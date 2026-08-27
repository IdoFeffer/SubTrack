const SUBSCRIPTIONS_KEY = "subtrack:subscriptions";
const SETTINGS_KEY = "subtrack:settings";

const DEFAULT_SETTINGS = {
  notifyRenewal: true,
  notifyMonthly: true,
  currency: "₪",
  monthStartDay: 1,
};

function readSubscriptions() {
  try {
    const raw = localStorage.getItem(SUBSCRIPTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeSubscriptions(subs) {
  localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(subs));
}

function nextId(subs) {
  return subs.reduce((max, s) => Math.max(max, s.id), 0) + 1;
}

export function fromApiSubscription(row) {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    nextRenewal: row.next_renewal_date,
    category: row.category,
    icon: row.icon,
    image: row.image,
  };
}

export function toApiPayload(form) {
  return {
    name: form.name.trim(),
    price: parseFloat(form.price),
    next_renewal_date: form.date,
    category: form.category,
    icon: form.icon,
    image: form.image,
  };
}

export async function fetchSubscriptions() {
  return readSubscriptions();
}

export async function createSubscription(payload) {
  const subs = readSubscriptions();
  const sub = { id: nextId(subs), ...payload };
  writeSubscriptions([...subs, sub]);
  return sub;
}

export async function updateSubscription(id, payload) {
  const subs = readSubscriptions();
  const idx = subs.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error("מנוי לא נמצא");
  const updated = { ...subs[idx], ...payload };
  subs[idx] = updated;
  writeSubscriptions(subs);
  return updated;
}

export async function deleteSubscription(id) {
  writeSubscriptions(readSubscriptions().filter((s) => s.id !== id));
}

export async function fetchSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function updateSettings(partial) {
  const current = await fetchSettings();
  const merged = { ...current, ...partial };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
  return merged;
}

export async function clearAllData() {
  localStorage.removeItem(SUBSCRIPTIONS_KEY);
  localStorage.removeItem(SETTINGS_KEY);
}
