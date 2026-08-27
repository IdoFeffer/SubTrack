import { useEffect, useState } from "react";
import PageShell from "../components/PageShell";
import { clearAllData, fetchSettings, updateSettings } from "../lib/storage";
import { CATEGORY_OPTIONS, categoryColor } from "../lib/subscriptions";
import "./SettingsPage.css";

const CURRENCY_OPTIONS = [
  { value: "₪", label: "שקל (₪)" },
  { value: "$", label: "דולר ($)" },
  { value: "€", label: "יורו (€)" },
];

const TOGGLE_META = [
  { key: "notifyRenewal", title: "התראה לפני חידוש", desc: "פוש 3 ימים לפני מועד החידוש" },
  { key: "notifyMonthly", title: "סיכום חודשי במייל", desc: "בראשון לכל חודש" },
];

function ConfirmDialog({ open, title, message, confirmLabel, confirming, error, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="confirm-dialog__scrim" onClick={onCancel}>
      <div role="dialog" aria-modal="true" className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <p className="confirm-dialog__title">{title}</p>
        <p className="confirm-dialog__message">{message}</p>
        {error && <p className="confirm-dialog__error">{error}</p>}
        <div className="confirm-dialog__actions">
          <button type="button" onClick={onConfirm} disabled={confirming} className="confirm-dialog__confirm">
            {confirming ? "מוחק..." : confirmLabel}
          </button>
          <button type="button" onClick={onCancel} className="confirm-dialog__cancel">
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}

function Toggle({ on, disabled, onClick }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={onClick}
      className="toggle-switch"
      style={{ background: on ? "var(--gradient-primary)" : "#e7e1f4" }}
    >
      <span className="toggle-switch__knob" style={{ [on ? "left" : "right"]: "3px" }} />
    </button>
  );
}

export default function SettingsPage({ subs, onDataCleared }) {
  const [settings, setSettings] = useState(null);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

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

  async function handleClearData() {
    setClearing(true);
    try {
      await clearAllData();
      onDataCleared?.();
      setClearConfirmOpen(false);
    } finally {
      setClearing(false);
    }
  }

  const uniqueCategories = [];
  for (const sub of subs) {
    if (!uniqueCategories.some((c) => c.category === sub.category)) {
      uniqueCategories.push({ category: sub.category, ...categoryColor(sub.category) });
    }
  }

  return (
    <PageShell activePage="settings" bottomCard={{ bottomTitle: "גרסה", bottomValue: "SubTrack 0.4", bottomValueSize: "16px" }}>
      <div>
        <p className="settings-header__eyebrow">התראות והעדפות</p>
        <p className="settings-header__title">הגדרות</p>
      </div>

      <div className="settings-body">
        <div className="settings-col">
          <div className="settings-card">
            <p className="settings-card__title">התראות</p>
            <div className="toggle-list">
              {TOGGLE_META.map((t) => (
                <div key={t.key} className="toggle-row">
                  <div>
                    <p className="toggle-row__title">{t.title}</p>
                    <p className="toggle-row__desc">{t.desc}</p>
                  </div>
                  <Toggle on={Boolean(draft?.[t.key])} disabled={!draft} onClick={() => toggle(t.key)} />
                </div>
              ))}
            </div>
          </div>

          <div className="settings-card general-card">
            <p className="settings-card__title">כללי</p>
            <div className="general-card__grid">
              <div>
                <label className="settings-field-label">מטבע</label>
                <select
                  value={draft?.currency ?? "₪"}
                  disabled={!draft}
                  onChange={(e) => setDraftField("currency", e.target.value)}
                  className="settings-select"
                >
                  {CURRENCY_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="settings-field-label">יום תחילת חודש</label>
                <select
                  value={draft?.monthStartDay ?? 1}
                  disabled={!draft}
                  onChange={(e) => setDraftField("monthStartDay", Number(e.target.value))}
                  className="settings-select"
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
              <label className="settings-field-label">קטגוריות</label>
              <div className="category-chips">
                {(uniqueCategories.length ? uniqueCategories : CATEGORY_OPTIONS.map((c) => ({ category: c, ...categoryColor(c) }))).map(
                  (c) => (
                    <span key={c.category} className="category-chips__chip" style={{ color: c.color, background: c.tint }}>
                      {c.category || "אחר"}
                    </span>
                  )
                )}
                <span className="category-chips__add">+ קטגוריה</span>
              </div>
            </div>
          </div>

          <div className="settings-save-row">
            <button type="button" onClick={handleSave} disabled={!isDirty || saving} className="settings-save-btn">
              {saving ? "שומר..." : "שמור הגדרות"}
            </button>
            {justSaved && <span className="settings-save-success">נשמר ✓</span>}
            {saveError && <span className="settings-save-error">{saveError}</span>}
          </div>
        </div>

        <div className="settings-col">
          <div className="danger-card">
            <p className="danger-card__title">אזור מסוכן</p>
            <p className="danger-card__text">
              מחיקת כל המנויים וההגדרות שנשמרו במכשיר הזה. אין דרך חזרה.
            </p>
            <button type="button" onClick={() => setClearConfirmOpen(true)} className="danger-card__btn">
              מחק את כל הנתונים
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={clearConfirmOpen}
        title="למחוק את כל הנתונים?"
        message="פעולה זו תמחק לצמיתות את כל המנויים וההגדרות שנשמרו במכשיר הזה. אי אפשר לשחזר."
        confirmLabel="כן, מחק הכל"
        confirming={clearing}
        onConfirm={handleClearData}
        onCancel={() => setClearConfirmOpen(false)}
      />
    </PageShell>
  );
}
