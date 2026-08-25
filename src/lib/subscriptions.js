export const ICON_OPTIONS = ["📦", "🎬", "🎵", "🏋", "☁️", "🎮", "📰", "🍽️", "🚗", "💊", "📚", "💻", "💼"];

export const CATEGORY_COLORS = {
  בידור: { color: "#e11d48", tint: "#ffe4e6" },
  מוזיקה: { color: "#059669", tint: "#d1fae5" },
  כושר: { color: "#c2410c", tint: "#ffedd5" },
  ענן: { color: "#0284c7", tint: "#e0f2fe" },
  תוכנה: { color: "#4f46e5", tint: "#e0e7ff" },
  אוכל: { color: "#ca8a04", tint: "#fef9c3" },
  תחבורה: { color: "#0d9488", tint: "#ccfbf1" },
  עסק: { color: "#78350f", tint: "#f3e6d5" },
  אחר: { color: "#64748b", tint: "#e2e8f0" },
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
  "עסק",
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

export function round2(amount) {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

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

export const WEEKDAY_LABELS = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];

export function monthLabel(year, monthIndex) {
  return new Date(year, monthIndex, 1).toLocaleDateString("he-IL", { month: "long", year: "numeric" });
}

export function buildCalendar(year, monthIndex, subs) {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const cells = [];

  for (let i = 0; i < firstWeekday; i++) {
    cells.push({
      key: `blank-${i}`,
      day: "",
      bg: "#faf8ff",
      border: "#f4f0fb",
      dayColor: "#cfc6e4",
      chips: [],
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const hits = subs.filter((s) => s.nextRenewal === iso);
    const hit = hits[0] ?? null;
    const cat = hit ? categoryColor(hit.category) : null;
    cells.push({
      key: `day-${d}`,
      day: d,
      bg: hit ? cat.tint : "#fff",
      border: hit ? `${cat.color}33` : "#f4f0fb",
      dayColor: hit ? cat.color : "#8b7cae",
      chips: hits.map((s) => ({ name: `${s.icon} ${s.name}`, color: categoryColor(s.category).color })),
    });
  }

  return cells;
}

export function lastNMonths(n, referenceDate = new Date()) {
  const months = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), monthIndex: d.getMonth(), isCurrent: i === 0 });
  }
  return months;
}
