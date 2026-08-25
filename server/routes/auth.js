import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import * as Users from "../models/users.js";
import { COOKIE_NAME, signToken, requireAuth } from "../middleware/auth.js";

const router = Router();
const googleClient = process.env.GOOGLE_CLIENT_ID ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID) : null;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

function validateCredentials(email, password) {
  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "כתובת אימייל לא תקינה";
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return "הסיסמה חייבת להכיל לפחות 8 תווים";
  }
  return null;
}

router.post("/signup", async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const error = validateCredentials(email, password);
    if (error) return res.status(400).json({ error });

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await Users.findByEmail(normalizedEmail);
    if (existing) {
      return res.status(409).json({ error: "כבר קיים חשבון עם האימייל הזה" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await Users.create({ email: normalizedEmail, passwordHash, name: name?.trim() || null });

    const token = signToken(user.id);
    res.cookie(COOKIE_NAME, token, cookieOptions);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "יש להזין אימייל וסיסמה" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const row = await Users.findByEmail(normalizedEmail);
    if (!row) {
      return res.status(401).json({ error: "אימייל או סיסמה שגויים" });
    }

    const valid = await bcrypt.compare(password, row.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "אימייל או סיסמה שגויים" });
    }

    const token = signToken(row.id);
    res.cookie(COOKIE_NAME, token, cookieOptions);
    res.json(Users.toUser(row));
  } catch (err) {
    next(err);
  }
});

router.post("/google", async (req, res, next) => {
  try {
    if (!googleClient) {
      return res.status(501).json({ error: "התחברות עם Google לא מוגדרת בשרת" });
    }
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: "credential is required" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email_verified) {
      return res.status(401).json({ error: "כתובת האימייל של חשבון ה-Google לא מאומתת" });
    }

    const email = payload.email.toLowerCase();
    const googleId = payload.sub;

    let user;
    const existingByGoogleId = await Users.findByGoogleId(googleId);
    if (existingByGoogleId) {
      user = Users.toUser(existingByGoogleId);
    } else {
      const existingByEmail = await Users.findByEmail(email);
      if (existingByEmail) {
        user = await Users.linkGoogleId(existingByEmail.id, googleId);
      } else {
        const randomPasswordHash = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);
        user = await Users.create({
          email,
          passwordHash: randomPasswordHash,
          name: payload.name || null,
          googleId,
        });
      }
    }

    const token = signToken(user.id);
    res.cookie(COOKIE_NAME, token, cookieOptions);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.post("/logout", (req, res) => {
  const { maxAge, ...clearCookieOptions } = cookieOptions;
  res.clearCookie(COOKIE_NAME, clearCookieOptions);
  res.status(204).end();
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await Users.findById(req.userId);
    if (!user) return res.status(401).json({ error: "not authenticated" });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

export default router;
