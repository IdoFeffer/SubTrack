import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import * as Users from "../models/users.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";

function isGmailConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function buildOAuthClient(req) {
  const redirectUri = `${req.protocol}://${req.get("host")}/api/gmail/callback`;
  return new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, redirectUri);
}

function safeReturnTo(req) {
  const fallback = process.env.FRONTEND_URL || "/settings";
  const referer = req.headers.referer;
  if (!referer) return fallback;
  try {
    const refUrl = new URL(referer);
    const hostOnly = req.get("host").split(":")[0];
    if (refUrl.hostname === hostOnly || refUrl.hostname === "localhost") {
      return referer;
    }
  } catch {
    // fall through to fallback
  }
  return fallback;
}

router.get("/status", requireAuth, async (req, res, next) => {
  try {
    const connected = await Users.hasGmailToken(req.userId);
    res.json({ connected, available: isGmailConfigured() });
  } catch (err) {
    next(err);
  }
});

router.get("/connect", requireAuth, (req, res) => {
  if (!isGmailConfigured()) {
    return res.status(501).send("Gmail import is not configured on the server");
  }
  const client = buildOAuthClient(req);
  const state = Buffer.from(safeReturnTo(req)).toString("base64url");
  const url = client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [GMAIL_SCOPE],
    state,
  });
  res.redirect(url);
});

router.get("/callback", requireAuth, async (req, res, next) => {
  try {
    if (!isGmailConfigured()) {
      return res.status(501).send("Gmail import is not configured on the server");
    }

    let returnTo = process.env.FRONTEND_URL || "/settings";
    if (req.query.state) {
      try {
        returnTo = Buffer.from(req.query.state, "base64url").toString();
      } catch {
        // keep default
      }
    }

    if (!req.query.code) {
      return res.redirect(`${returnTo}?gmail=error`);
    }

    const client = buildOAuthClient(req);
    const { tokens } = await client.getToken(req.query.code);
    if (!tokens.refresh_token) {
      return res.redirect(`${returnTo}?gmail=error`);
    }

    await Users.setGmailToken(req.userId, tokens.refresh_token);
    res.redirect(`${returnTo}?gmail=connected`);
  } catch (err) {
    next(err);
  }
});

router.post("/disconnect", requireAuth, async (req, res, next) => {
  try {
    const token = await Users.getGmailToken(req.userId);
    if (token && isGmailConfigured()) {
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
      try {
        await client.revokeToken(token);
      } catch {
        // token may already be invalid/expired on Google's side — still clear it locally
      }
    }
    await Users.clearGmailToken(req.userId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
