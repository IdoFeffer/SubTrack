import { useEffect, useState } from "react";
import PageShell from "../components/PageShell";
import { useAuth } from "../context/AuthContext";
import { fetchSettings, updateSettings } from "../lib/api";
import { CATEGORY_OPTIONS, categoryColor } from "../lib/subscriptions";

const CURRENCY_OPTIONS = [
  { value: "₪", label: "שקל (₪)" },
  { value: "$", label: "דולר ($)" },
  { value: "€", label: "יורו (€)" },
];

const TOGGLE_META = [
  { key: "notifyRenewal", title: "התראה לפני חידוש", desc: "פוש 3 ימים לפני מועד החידוש" },
  { key: "notifyMonthly", title: "סיכום חודשי במייל", desc: "בראשון לכל חודש" },
  { key: "gmail", title: "ייבוא ממייל (Gmail)", desc: "זיהוי אוטומטי של חיובים — בקרוב", disabled: true },
];

function Toggle({ on, disabled, onClick }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={onClick}
      className={`relative w-[46px] h-[26px] rounded-full shrink-0 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      style={{ background: on ? "linear-gradient(140deg,#7c3aed,#c026d3)" : "#e7e1f4" }}
    >
      <span
        className="absolute top-[3px] w-5 h-5 rounded-full bg-white"
        style={{ boxShadow: "0 2px 6px rgba(27,16,51,.25)", [on ? "left" : "right"]: "3px" }}
      />
    </button>
  );
}

export default function SettingsPage({ subs }) {
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState(null);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const displayName = user?.name?.trim() || user?.email || "";
  const initial = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    fetchSettings()
      .then((s) => {
        setSettings(s);
        setDraft(s);
      })
      .catch(() => {});
  }, []);

  const isDirty = draft && settings && JSON.stringify(draft) !== JSON.stringify(settings);

  function toggle(key) {
    if (!draft) return;
    setDraft((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function setDraftField(key, value) {
    if (!draft) return;
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!draft || !isDirty) return;
    setSaving(true);
    setSaveError(null);
    try {
      const saved = await updateSettings(draft);
      setSettings(saved);
      setDraft(saved);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const uniqueCategories = [];
  for (const sub of subs) {
    if (!uniqueCategories.some((c) => c.category === sub.category)) {
      uniqueCategories.push({ category: sub.category, ...categoryColor(sub.category) });
    }
  }

  return (
    <PageShell activePage="settings" bottomCard={{ bottomTitle: "גרסה", bottomValue: "SubTrack 0.4", bottomValueSize: "text-[16px]" }}>
      <div>
        <p className="m-0 text-xs font-semibold tracking-[.08em] text-[#8b5cf6]">חשבון והתראות</p>
        <p className="mt-1 mb-0 text-[30px] font-bold text-[#1b1033]">הגדרות</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_330px] gap-[22px]">
        <div className="flex flex-col gap-4">
          <div
            className="bg-white border border-[#ece7f7] rounded-[20px] p-6"
            style={{ boxShadow: "0 16px 36px -28px rgba(27,16,51,.7)" }}
          >
            <p className="m-0 mb-1 text-[15px] font-bold text-[#1b1033]">התראות</p>
            <div className="flex flex-col">
              {TOGGLE_META.map((t) => (
                <div
                  key={t.key}
                  className="flex items-center justify-between gap-4 py-4 border-b border-[#f4f0fb] last:border-b-0"
                >
                  <div>
                    <p className="m-0 text-sm font-semibold text-[#1b1033]">{t.title}</p>
                    <p className="mt-0.5 mb-0 text-xs text-[#8b7cae]">{t.desc}</p>
                  </div>
                  <Toggle
                    on={t.disabled ? false : Boolean(draft?.[t.key])}
                    disabled={t.disabled || !draft}
                    onClick={() => toggle(t.key)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#ece7f7] rounded-[20px] p-6 flex flex-col gap-4">
            <p className="m-0 text-[15px] font-bold text-[#1b1033]">כללי</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-[#6b5b8a]">מטבע</label>
                <select
                  value={draft?.currency ?? "₪"}
                  disabled={!draft}
                  onChange={(e) => setDraftField("currency", e.target.value)}
                  className="w-full rounded-xl px-3.5 py-3 text-sm border-[1.5px] border-[#ddd3f7] bg-[#faf8ff] text-[#1b1033] outline-none focus:border-[#7c3aed] focus:bg-white"
                >
                  {CURRENCY_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-[#6b5b8a]">יום תחילת חודש</label>
                <select
                  value={draft?.monthStartDay ?? 1}
                  disabled={!draft}
                  onChange={(e) => setDraftField("monthStartDay", Number(e.target.value))}
                  className="w-full rounded-xl px-3.5 py-3 text-sm border-[1.5px] border-[#ddd3f7] bg-[#faf8ff] text-[#1b1033] outline-none focus:border-[#7c3aed] focus:bg-white"
                >
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      {d} בחודש
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2 text-[#6b5b8a]">קטגוריות</label>
              <div className="flex flex-wrap gap-2">
                {(uniqueCategories.length ? uniqueCategories : CATEGORY_OPTIONS.map((c) => ({ category: c, ...categoryColor(c) }))).map(
                  (c) => (
                    <span
                      key={c.category}
                      className="rounded-full px-3.5 py-1.5 text-xs font-semibold"
                      style={{ color: c.color, background: c.tint }}
                    >
                      {c.category || "אחר"}
                    </span>
                  )
                )}
                <span className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-[#7c3aed] bg-[#f3e8ff] border border-dashed border-[#c4b5fd]">
                  + קטגוריה
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={!isDirty || saving}
              className="rounded-xl px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: "linear-gradient(140deg,#7c3aed,#c026d3)" }}
            >
              {saving ? "שומר..." : "שמור הגדרות"}
            </button>
            {justSaved && <span className="text-sm font-semibold text-[#059669]">נשמר ✓</span>}
            {saveError && <span className="text-sm font-medium text-[#e11d48]">{saveError}</span>}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-white border border-[#ece7f7] rounded-[20px] p-5 flex flex-col gap-3.5">
            <p className="m-0 text-[15px] font-bold text-[#1b1033]">חשבון</p>
            <div className="flex items-center gap-3">
              <div className="w-[46px] h-[46px] rounded-full flex items-center justify-center text-white text-[17px] font-bold bg-[linear-gradient(140deg,#a855f7,#ec4899)]">
                {initial}
              </div>
              <div>
                <p className="m-0 text-sm font-semibold text-[#1b1033]">{user?.name || "המשתמש שלי"}</p>
                <p className="mt-0.5 mb-0 text-xs text-[#8b7cae]" dir="ltr">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-xl py-2.5 text-center text-sm font-semibold border-[1.5px] border-[#ddd3f7] text-[#4c1d95]"
            >
              התנתקות
            </button>
          </div>

          <div
            className="rounded-[20px] p-5 border border-[#ddd3f7]"
            style={{ background: "linear-gradient(140deg,#f3e8ff,#fae8ff)" }}
          >
            <p className="m-0 text-[15px] font-bold text-[#4c1d95]">ייבוא מנויים ממייל</p>
            <p className="mt-2.5 mb-0 text-[13px] text-[#5b4b7a]">
              נזהה חיובים חוזרים בתיבה שלך ונציע להוסיף אותם. בקרוב.
            </p>
            <div className="mt-3.5 inline-block rounded-[10px] px-3.5 py-2.5 text-[13px] font-semibold text-white bg-[#7c3aed]">
              הצטרף לרשימת המתנה
            </div>
          </div>

          <div className="bg-white border border-[#fecdd3] rounded-[20px] p-5">
            <p className="m-0 text-[15px] font-bold text-[#9f1239]">אזור מסוכן</p>
            <p className="mt-2 mb-0 text-[13px] text-[#8b7cae]">מחיקת כל המנויים וההיסטוריה. אין דרך חזרה.</p>
            <div className="mt-3.5 inline-block rounded-[10px] px-3.5 py-2.5 text-[13px] font-semibold text-[#e11d48] bg-[#fff1f2] border border-[#fecdd3]">
              מחק את החשבון
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
