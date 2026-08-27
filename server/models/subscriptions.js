import { db } from "../db.js";

function toSubscription(row) {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    next_renewal_date: row.next_renewal_date,
    category: row.category,
    icon: row.icon,
    image: row.image,
    user_id: row.user_id,
  };
}

export async function getAll(userId) {
  const result = await db.execute({
    sql: "SELECT * FROM subscriptions WHERE user_id = ? ORDER BY next_renewal_date ASC",
    args: [userId],
  });
  return result.rows.map(toSubscription);
}

export async function create({ name, price, next_renewal_date, category = null, icon = null, image = null, user_id }) {
  const result = await db.execute({
    sql: `INSERT INTO subscriptions (name, price, next_renewal_date, category, icon, image, user_id)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          RETURNING *`,
    args: [name, price, next_renewal_date, category, icon, image, user_id],
  });
  return toSubscription(result.rows[0]);
}

export async function update(id, userId, { name, price, next_renewal_date, category = null, icon = null, image = null }) {
  const result = await db.execute({
    sql: `UPDATE subscriptions
          SET name = ?, price = ?, next_renewal_date = ?, category = ?, icon = ?, image = ?
          WHERE id = ? AND user_id = ?
          RETURNING *`,
    args: [name, price, next_renewal_date, category, icon, image, id, userId],
  });
  return result.rows[0] ? toSubscription(result.rows[0]) : null;
}

export async function remove(id, userId) {
  const result = await db.execute({
    sql: "DELETE FROM subscriptions WHERE id = ? AND user_id = ?",
    args: [id, userId],
  });
  return result.rowsAffected > 0;
}

export async function removeAllForUser(userId) {
  await db.execute({
    sql: "DELETE FROM subscriptions WHERE user_id = ?",
    args: [userId],
  });
}
