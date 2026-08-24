export const ICON_OPTIONS = ["📦", "🎬", "🎵", "🏋", "☁️", "🎮", "📰", "🍽️", "🚗", "💊", "📚", "💻"];

export const CATEGORY_COLORS = {
  בידור: { color: "#e11d48", tint: "#ffe4e6" },
  מוזיקה: { color: "#059669", tint: "#d1fae5" },
  כושר: { color: "#c2410c", tint: "#ffedd5" },
  ענן: { color: "#0284c7", tint: "#e0f2fe" },
};

export const DEFAULT_CATEGORY_COLOR = { color: "#7c3aed", tint: "#f3e8ff" };

export const CATEGORY_OPTIONS = [
  "בידור",
  "מוזיקה",
  "כושר",
  "ענן",
  "תוכנה",
  "אוכל",
  "תחבורה",
  "אחר",
];

export function categoryColor(category) {
  return CATEGORY_COLORS[category] || DEFAULT_CATEGORY_COLOR;
}

export const SEED_SUBSCRIPTIONS = [
  { id: 1, name: "Netflix", price: 55, nextRenewal: "2026-08-26", icon: "🎬", category: "בידור", image: null },
  { id: 2, name: "Spotify", price: 20, nextRenewal: "2026-09-03", icon: "🎵", category: "מוזיקה", image: null },
  { id: 3, name: "חדר כושר", price: 150, nextRenewal: "2026-09-01", icon: "🏋", category: "כושר", image: null },
  { id: 4, name: "iCloud+", price: 12, nextRenewal: "2026-09-12", icon: "☁️", category: "ענן", image: null },
];

export const EMPTY_FORM = {
  name: "",
  price: "",
  date: "",
  icon: ICON_OPTIONS[0],
  image: null,
  category: null,
};

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("he-IL", { day: "numeric", month: "long" });
}

export function daysUntil(dateStr) {
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function sortSubs(subs, sortBy) {
  const sorted = [...subs];
  if (sortBy === "price") {
    sorted.sort((a, b) => a.price - b.price);
  } else if (sortBy === "name") {
    sorted.sort((a, b) => a.name.localeCompare(b.name, "he"));
  } else {
    sorted.sort((a, b) => new Date(a.nextRenewal) - new Date(b.nextRenewal));
  }
  return sorted;
}

export const SORT_LABELS = {
  date: "תאריך חידוש",
  price: "מחיר",
  name: "שם",
};

export const SORT_CYCLE = ["date", "price", "name"];
