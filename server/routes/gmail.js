import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import * as Users from "../models/users.js";
import * as Subscriptions from "../models/subscriptions.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";

const SCAN_QUERY =
  '(receipt OR invoice OR "payment confirmation" OR charged OR renewed OR subscription OR קבלה OR חשבונית OR "אישור תשלום" OR חויב OR חידוש) newer_than:180d';

const AMOUNT_PATTERNS = [
  /₪\s*([\d,]+(?:\.\d{1,2})?)/,
  /([\d,]+(?:\.\d{1,2})?)\s*₪/,
  /\b(?:ILS|NIS)\s*([\d,]+(?:\.\d{1,2})?)/i,
  /\$\s*([\d,]+(?:\.\d{1,2})?)/,
  /\b(?:USD)\s*([\d,]+(?:\.\d{1,2})?)/i,
];

function extractAmount(text) {
  for (const pattern of AMOUNT_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const value = parseFloat(match[1].replace(/,/g, ""));
      if (Number.isFinite(value) && value > 0) return value;
    }
  }
  return null;
}

function parseFromHeader(value) {
  if (!value) return { name: "", email: "" };
  const angleMatch = value.match(/^"?([^"<]*)"?\s*<([^<>]+)>$/);
  if (angleMatch) {
    const email = angleMatch[2].trim().toLowerCase();
    const name = angleMatch[1].trim();
    return { name: name || email, email };
  }
  const email = value.trim().toLowerCase();
  return { name: email, email };
}

class GmailApiError extends Error {
  constructor(status, body) {
    super(`Gmail API request failed (${status})`);
    this.status = status;
    this.body = body;
  }
}

function gmailApiErrorMessage(err) {
  if (err.body?.includes("accessNotConfigured") || err.body?.includes("has not been used")) {
    return "Gmail API לא מופעל בפרויקט Google Cloud שלך. צריך להפעיל אותו ב-APIs & Services → Library.";
  }
  if (err.status === 401) {
    return "ההרשאה מול Gmail פגה, נסה להתחבר מחדש";
  }
  return "שגיאה בתקשורת עם Gmail";
}

async function fetchWithAuth(url, accessToken) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new GmailApiError(res.status, body);
  }
  return res.json();
}

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

router.get("/scan", requireAuth, async (req, res, next) => {
  try {
    if (!isGmailConfigured()) {
      return res.status(501).json({ error: "Gmail import is not configured on the server" });
    }
    const refreshToken = await Users.getGmailToken(req.userId);
    if (!refreshToken) {
      return res.status(409).json({ error: "Gmail אינו מחובר" });
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
    client.setCredentials({ refresh_token: refreshToken });
    const { token: accessToken } = await client.getAccessToken();
    if (!accessToken) {
      return res.status(502).json({ error: "לא הצלחנו לרענן את ההרשאה מול Google, נסה להתחבר מחדש" });
    }

    const listData = await fetchWithAuth(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=50&q=${encodeURIComponent(SCAN_QUERY)}`,
      accessToken
    );

    const messageIds = (listData.messages || []).map((m) => m.id);
    const messages = await Promise.all(
      messageIds.map((id) =>
        fetchWithAuth(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
          accessToken
        ).catch(() => null)
      )
    );

    const existingSubs = await Subscriptions.getAll(req.userId);
    const existingNames = existingSubs.map((s) => s.name.toLowerCase());

    const groups = new Map();
    for (const msg of messages) {
      if (!msg) continue;
      const headers = Object.fromEntries((msg.payload?.headers || []).map((h) => [h.name, h.value]));
      const from = parseFromHeader(headers.From);
      if (!from.email) continue;

      const subject = headers.Subject || "";
      const amount = extractAmount(`${subject} ${msg.snippet || ""}`);
      if (!amount) continue;

      const entry = groups.get(from.email) || {
        senderName: from.name || from.email,
        senderEmail: from.email,
        occurrences: [],
      };
      entry.occurrences.push({
        amount,
        date: msg.internalDate ? new Date(Number(msg.internalDate)).toISOString().slice(0, 10) : null,
      });
      groups.set(from.email, entry);
    }

    const candidates = [];
    for (const entry of groups.values()) {
      entry.occurrences.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
      const latest = entry.occurrences[0];
      const nameLower = entry.senderName.toLowerCase();
      const alreadyTracked = existingNames.some((n) => nameLower.includes(n) || n.includes(nameLower));
      if (alreadyTracked) continue;

      let suggestedRenewalDate = null;
      if (latest.date) {
        const d = new Date(latest.date);
        d.setDate(d.getDate() + 30);
        suggestedRenewalDate = d.toISOString().slice(0, 10);
      }

      candidates.push({
        id: entry.senderEmail,
        name: entry.senderName,
        senderEmail: entry.senderEmail,
        price: latest.amount,
        lastChargeDate: latest.date,
        suggestedRenewalDate,
        occurrences: entry.occurrences.length,
        recurring: entry.occurrences.length >= 2,
      });
    }

    candidates.sort((a, b) => b.occurrences - a.occurrences);
    res.json({ candidates });
  } catch (err) {
    if (err instanceof GmailApiError) {
      return res.status(502).json({ error: gmailApiErrorMessage(err) });
    }
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
