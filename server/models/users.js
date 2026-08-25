import { db } from "../db.js";

function toUser(row) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
  };
}

export async function findByEmail(email) {
  const result = await db.execute({
    sql: "SELECT * FROM users WHERE email = ?",
    args: [email],
  });
  return result.rows[0] ?? null;
}

export async function findByGoogleId(googleId) {
  const result = await db.execute({
    sql: "SELECT * FROM users WHERE google_id = ?",
    args: [googleId],
  });
  return result.rows[0] ?? null;
}

export async function findById(id) {
  const result = await db.execute({
    sql: "SELECT * FROM users WHERE id = ?",
    args: [id],
  });
  return result.rows[0] ? toUser(result.rows[0]) : null;
}

export async function create({ email, passwordHash, name = null, googleId = null }) {
  const result = await db.execute({
    sql: `INSERT INTO users (email, password_hash, name, google_id)
          VALUES (?, ?, ?, ?)
          RETURNING *`,
    args: [email, passwordHash, name, googleId],
  });
  return toUser(result.rows[0]);
}

export async function linkGoogleId(id, googleId) {
  const result = await db.execute({
    sql: `UPDATE users SET google_id = ? WHERE id = ? RETURNING *`,
    args: [googleId, id],
  });
  return toUser(result.rows[0]);
}

export { toUser };
