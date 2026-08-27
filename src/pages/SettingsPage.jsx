import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageShell from "../components/PageShell";
import { useAuth } from "../context/AuthContext";
import {
  createSubscription,
  disconnectGmail,
  fetchGmailStatus,
  fetchSettings,
  gmailConnectUrl,
  scanGmail,
  updateSettings,
} from "../lib/api";
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
  { key: "gmail", title: "ייבוא ממייל (Gmail)", desc: "זיהוי אוטומטי של חיובים — בקרוב", disabled: true },
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

function CandidateCard({ candidate, adding, onAdd, onDismiss }) {
  const [name, setName] = useState(candidate.name);
  const [price, setPrice] = useState(String(candidate.price));
  const [date, setDate] = useState(candidate.suggestedRenewalDate || "");
  const [category, setCategory] = useState("");

  return (
    <div className="candidate-card">
      <div className="candidate-card__head">
        <p className="candidate-card__name">{candidate.name}</p>
        {candidate.recurring && <span className="candidate-card__badge">נמצא {candidate.occurrences} פעמים</span>}
      </div>
      <div className="candidate-card__grid">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="שם המנוי"
          className="candidate-card__input"
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="מחיר"
          dir="ltr"
          className="candidate-card__input candidate-card__input--price"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          dir="ltr"
          className="candidate-card__input"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="candidate-card__input">
          <option value="">קטגוריה</option>
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="candidate-card__actions">
        <button
          type="button"
          onClick={() => onAdd({ name, price, date, category })}
          disabled={adding}
          className="candidate-card__add"
        >
          {adding ? "מוסיף..." : "הוסף מנוי"}
        </button>
        <button type="button" onClick={onDismiss} className="candidate-card__dismiss">
          התעלם
        </button>
      </div>
    </div>
  );
}

function Toggle({ on, disabled, onClick }) {
  return (
    <button type="button" role="switch" aria-checked={on} disabled={disabled} onClick={onClick} className="toggle-switch" style={{ background: on ? "var(--gradient-primary)" : "#e7e1f4" }}>
      <span className="toggle-switch__knob" style={{ [on ? "left" : "right"]: "3px" }} />
    </button>
  );
}

export default function SettingsPage({ subs, onSubscriptionAdded }) {
  const { user, logout, deleteAccount } = useAuth();
  const [settings, setSettings] = useState(null);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [gmailStatus, setGmailStatus] = useState(null);
  const [gmailMessage, setGmailMessage] = useState(null);
  const [disconnecting, setDisconnecting] = useState(false);
  const [candidates, setCandidates] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [addingCandidateId, setAddingCandidateId] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const displayName = user?.name?.trim() || user?.email || "";
  const initial = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    fetchGmailStatus()
      .then(setGmailStatus)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const gmailParam = searchParams.get("gmail");
    if (!gmailParam) return;
    if (gmailParam === "connected") {
      setGmailMessage({ type: "success", text: "Gmail חובר בהצלחה" });
      fetchGmailStatus()
        .then(setGmailStatus)
        .catch(() => {});
    } else {
      setGmailMessage({ type: "error", text: "החיבור ל-Gmail נכשל, נסה שוב" });
    }
    searchParams.delete("gmail");
    setSearchParams(searchParams, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDisconnectGmail() {
    setDisconnecting(true);
    try {
      await disconnectGmail();
      setGmailStatus((s) => ({ ...s, connected: false }));
      setCandidates(null);
    } finally {
      setDisconnecting(false);
    }
  }

  async function handleScan() {
    setScanning(true);
    setScanError(null);
    try {
      const result = await scanGmail();
      setCandidates(result.candidates);
    } catch (err) {
      setScanError(err.message);
    } finally {
      setScanning(false);
    }
  }

  async function handleAddCandidate(candidate, values) {
    setScanError(null);
    setAddingCandidateId(candidate.id);
    try {
      await createSubscription({
        name: values.name.trim(),
        price: parseFloat(values.price),
        next_renewal_date: values.date,
        category: values.category || null,
        icon: "📧",
        image: null,
      });
      setCandidates((prev) => prev.filter((c) => c.id !== candidate.id));
      onSubscriptionAdded?.();
    } catch (err) {
      setScanError(err.message);
    } finally {
      setAddingCandidateId(null);
    }
  }

  function handleDismissCandidate(id) {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
  }

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

  async function handleDeleteAccount() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount();
    } catch (err) {
      setDeleteError(err.message);
      setDeleting(false);
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
        <p className="settings-header__eyebrow">חשבון והתראות</p>
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
                  <Toggle
                    on={t.disabled ? false : Boolean(draft?.[t.key])}
                    disabled={t.disabled || !draft}
                    onClick={() => toggle(t.key)}
                  />
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
          <div className="account-card">
            <p className="settings-card__title">חשבון</p>
            <div className="account-card__profile">
              <div className="account-card__avatar">{initial}</div>
              <div>
                <p className="account-card__name">{user?.name || "המשתמש שלי"}</p>
                <p className="account-card__email" dir="ltr">
                  {user?.email}
                </p>
              </div>
            </div>
            <button type="button" onClick={logout} className="account-card__logout">
              התנתקות
            </button>
          </div>

          <div className="gmail-card">
            <p className="gmail-card__title">ייבוא מנויים ממייל</p>
            <p className="gmail-card__text">נסרוק את תיבת ה-Gmail שלך לחיפוש חיובים חוזרים ונציע להוסיף אותם כמנויים.</p>
            {gmailMessage && (
              <p className={`gmail-card__message ${gmailMessage.type === "error" ? "gmail-card__message--error" : "gmail-card__message--success"}`}>
                {gmailMessage.text}
              </p>
            )}
            {gmailStatus?.connected ? (
              <>
                <div className="gmail-card__actions">
                  <span className="gmail-card__status">מחובר ל-Gmail ✓</span>
                  <button type="button" onClick={handleScan} disabled={scanning} className="gmail-card__scan-btn">
                    {scanning ? "סורק..." : "סרוק עכשיו"}
                  </button>
                  <button type="button" onClick={handleDisconnectGmail} disabled={disconnecting} className="gmail-card__disconnect-btn">
                    {disconnecting ? "מנתק..." : "נתק"}
                  </button>
                </div>

                {scanError && <p className="gmail-card__scan-error">{scanError}</p>}

                {candidates && (
                  <div className="gmail-card__candidates">
                    {candidates.length === 0 ? (
                      <p className="gmail-card__empty">לא נמצאו חיובים חדשים בתיבה שלך.</p>
                    ) : (
                      candidates.map((candidate) => (
                        <CandidateCard
                          key={candidate.id}
                          candidate={candidate}
                          adding={addingCandidateId === candidate.id}
                          onAdd={(values) => handleAddCandidate(candidate, values)}
                          onDismiss={() => handleDismissCandidate(candidate.id)}
                        />
                      ))
                    )}
                  </div>
                )}
              </>
            ) : (
              <a href={gmailConnectUrl()} className="gmail-card__connect-btn">
                התחבר ל-Gmail
              </a>
            )}
          </div>

          <div className="danger-card">
            <p className="danger-card__title">אזור מסוכן</p>
            <p className="danger-card__text">מחיקת כל המנויים וההיסטוריה. אין דרך חזרה.</p>
            <button type="button" onClick={() => setDeleteConfirmOpen(true)} className="danger-card__btn">
              מחק את החשבון
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="למחוק את החשבון?"
        message="פעולה זו תמחק לצמיתות את החשבון שלך ואת כל המנויים וההיסטוריה. אי אפשר לשחזר."
        confirmLabel="כן, מחק את החשבון"
        confirming={deleting}
        error={deleteError}
        onConfirm={handleDeleteAccount}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setDeleteError(null);
        }}
      />
    </PageShell>
  );
}
