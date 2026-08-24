// Temporary in-memory storage. TODO: replace with Turso queries (see README).

let subscriptions = [
  { id: 1, name: "Netflix", price: 55, next_renewal_date: "2026-08-26", category: "בידור", user_id: null },
  { id: 2, name: "Spotify", price: 20, next_renewal_date: "2026-09-03", category: "מוזיקה", user_id: null },
  { id: 3, name: "חדר כושר", price: 150, next_renewal_date: "2026-09-01", category: "כושר", user_id: null },
  { id: 4, name: "iCloud+", price: 12, next_renewal_date: "2026-09-12", category: "ענן", user_id: null },
];

let nextId = subscriptions.length + 1;

export function getAll() {
  return subscriptions;
}

export function create({ name, price, next_renewal_date, category = null, user_id = null }) {
  const sub = { id: nextId++, name, price, next_renewal_date, category, user_id };
  subscriptions.push(sub);
  return sub;
}

export function remove(id) {
  const index = subscriptions.findIndex((s) => s.id === id);
  if (index === -1) return false;
  subscriptions.splice(index, 1);
  return true;
}
