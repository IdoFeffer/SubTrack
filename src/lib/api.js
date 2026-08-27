const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

async function request(path, options) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `בקשה נכשלה (${res.status})`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export function signup({ email, password, name }) {
  return request("/auth/signup", { method: "POST", body: JSON.stringify({ email, password, name }) });
}

export function login({ email, password, remember = true }) {
  return request("/auth/login", { method: "POST", body: JSON.stringify({ email, password, remember }) });
}

export function loginWithGoogle(credential) {
  return request("/auth/google", { method: "POST", body: JSON.stringify({ credential }) });
}

export function logout() {
  return request("/auth/logout", { method: "POST" });
}

export function deleteAccount() {
  return request("/auth/me", { method: "DELETE" });
}

export function fetchMe() {
  return request("/auth/me");
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

export function fetchSubscriptions() {
  return request("/subscriptions");
}

export function createSubscription(payload) {
  return request("/subscriptions", { method: "POST", body: JSON.stringify(payload) });
}

export function updateSubscription(id, payload) {
  return request(`/subscriptions/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function deleteSubscription(id) {
  return request(`/subscriptions/${id}`, { method: "DELETE" });
}

export function fetchSettings() {
  return request("/settings");
}

export function updateSettings(partial) {
  return request("/settings", { method: "PUT", body: JSON.stringify(partial) });
}

export function fetchGmailStatus() {
  return request("/gmail/status");
}

export function gmailConnectUrl() {
  return `${API_BASE}/gmail/connect`;
}

export function disconnectGmail() {
  return request("/gmail/disconnect", { method: "POST" });
}
