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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(27,16,51,.45)", animation: "subtrack-scrim-in 150ms ease-out" }}
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-[380px] max-w-full bg-white rounded-[22px] p-6"
        style={{ boxShadow: "0 40px 80px -30px rgba(27,16,51,.7)", animation: "subtrack-dialog-in 180ms ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="m-0 text-lg font-bold text-[#1b1033]">{title}</p>
        <p className="mt-2 mb-0 text-sm text-[#6b5b8a]">{message}</p>
        {error && <p className="mt-2 mb-0 text-sm font-medium text-[#e11d48]">{error}</p>}
        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirming}
            className="flex-1 rounded-[13px] py-3 text-white text-sm font-bold bg-[#e11d48] disabled:opacity-60"
          >
            {confirming ? "מוחק..." : confirmLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-[13px] px-5 py-3 text-sm font-semibold border-[1.5px] border-[#ddd3f7] text-[#4c1d95]"
          >
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
    <div className="rounded-xl border border-[#ddd3f7] bg-white p-3.5 flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="m-0 text-sm font-semibold text-[#1b1033] truncate">{candidate.name}</p>
        {candidate.recurring && (
          <span className="shrink-0 text-[11px] font-semibold text-[#7c3aed] bg-[#f3e8ff] rounded-full px-2 py-0.5">
            נמצא {candidate.occurrences} פעמים
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="שם המנוי"
          className="rounded-lg px-2.5 py-2 text-xs border-[1.5px] border-[#ddd3f7] bg-[#faf8ff] text-[#1b1033] outline-none focus:border-[#7c3aed] focus:bg-white"
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="מחיר"
          dir="ltr"
          className="rounded-lg px-2.5 py-2 text-xs border-[1.5px] border-[#ddd3f7] bg-[#faf8ff] text-[#1b1033] outline-none focus:border-[#7c3aed] focus:bg-white text-right"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          dir="ltr"
          className="rounded-lg px-2.5 py-2 text-xs border-[1.5px] border-[#ddd3f7] bg-[#faf8ff] text-[#1b1033] outline-none focus:border-[#7c3aed] focus:bg-white"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg px-2.5 py-2 text-xs border-[1.5px] border-[#ddd3f7] bg-[#faf8ff] text-[#1b1033] outline-none focus:border-[#7c3aed] focus:bg-white"
        >
          <option value="">קטגוריה</option>
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onAdd({ name, price, date, category })}
          disabled={adding}
          className="flex-1 rounded-lg py-2 text-xs font-semibold text-white disabled:opacity-60"
          style={{ background: "linear-gradient(140deg,#7c3aed,#c026d3)" }}
        >
          {adding ? "מוסיף..." : "הוסף מנוי"}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-lg px-3 py-2 text-xs font-semibold border-[1.5px] border-[#ddd3f7] text-[#4c1d95]"
        >
          התעלם
        </button>
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
              נסרוק את תיבת ה-Gmail שלך לחיפוש חיובים חוזרים ונציע להוסיף אותם כמנויים.
            </p>
            {gmailMessage && (
              <p
                className={`mt-2.5 mb-0 text-[13px] font-semibold ${
                  gmailMessage.type === "error" ? "text-[#e11d48]" : "text-[#059669]"
                }`}
              >
                {gmailMessage.text}
              </p>
            )}
            {gmailStatus?.connected ? (
              <>
                <div className="mt-3.5 flex items-center gap-2.5 flex-wrap">
                  <span className="rounded-[10px] px-3.5 py-2.5 text-[13px] font-semibold text-[#059669] bg-white border border-[#a7f3d0]">
                    מחובר ל-Gmail ✓
                  </span>
                  <button
                    type="button"
                    onClick={handleScan}
                    disabled={scanning}
                    className="rounded-[10px] px-3.5 py-2.5 text-[13px] font-semibold text-white disabled:opacity-60"
                    style={{ background: "linear-gradient(140deg,#7c3aed,#c026d3)" }}
                  >
                    {scanning ? "סורק..." : "סרוק עכשיו"}
                  </button>
                  <button
                    type="button"
                    onClick={handleDisconnectGmail}
                    disabled={disconnecting}
                    className="rounded-[10px] px-3.5 py-2.5 text-[13px] font-semibold text-[#7c3aed] bg-white border border-[#ddd3f7] disabled:opacity-60"
                  >
                    {disconnecting ? "מנתק..." : "נתק"}
                  </button>
                </div>

                {scanError && <p className="mt-2.5 mb-0 text-[13px] font-medium text-[#e11d48]">{scanError}</p>}

                {candidates && (
                  <div className="mt-3.5 flex flex-col gap-2.5">
                    {candidates.length === 0 ? (
                      <p className="m-0 text-[13px] text-[#5b4b7a]">לא נמצאו חיובים חדשים בתיבה שלך.</p>
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
              <a
                href={gmailConnectUrl()}
                className="mt-3.5 inline-block rounded-[10px] px-3.5 py-2.5 text-[13px] font-semibold text-white bg-[#7c3aed]"
              >
                התחבר ל-Gmail
              </a>
            )}
          </div>

          <div className="bg-white border border-[#fecdd3] rounded-[20px] p-5">
            <p className="m-0 text-[15px] font-bold text-[#9f1239]">אזור מסוכן</p>
            <p className="mt-2 mb-0 text-[13px] text-[#8b7cae]">מחיקת כל המנויים וההיסטוריה. אין דרך חזרה.</p>
            <button
              type="button"
              onClick={() => setDeleteConfirmOpen(true)}
              className="mt-3.5 rounded-[10px] px-3.5 py-2.5 text-[13px] font-semibold text-[#e11d48] bg-[#fff1f2] border border-[#fecdd3]"
            >
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
