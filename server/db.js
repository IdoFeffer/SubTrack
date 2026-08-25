import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  throw new Error("TURSO_DATABASE_URL is not set (see server/.env.example)");
}
if (!authToken) {
  throw new Error("TURSO_AUTH_TOKEN is not set (see server/.env.example)");
}

export const db = createClient({ url, authToken });

export async function initSchema() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      next_renewal_date TEXT NOT NULL,
      category TEXT,
      icon TEXT,
      image TEXT,
      user_id TEXT
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  try {
    await db.execute("ALTER TABLE users ADD COLUMN google_id TEXT");
  } catch {
    // column already exists
  }
  await db.execute(
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL"
  );
}
