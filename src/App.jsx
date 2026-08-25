import { useEffect, useMemo, useRef, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import MobileTabletNav from "./components/MobileTabletNav";
import SubscriptionsPage from "./pages/SubscriptionsPage";
import RenewalsPage from "./pages/RenewalsPage";
import ExpensesPage from "./pages/ExpensesPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import { useAuth } from "./context/AuthContext";
import { EMPTY_FORM, SORT_CYCLE, SORT_LABELS, daysUntil, sortSubs } from "./lib/subscriptions";
import {
  fetchSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  fromApiSubscription,
  toApiPayload,
} from "./lib/api";

export default function App() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return <div className="min-h-screen bg-[linear-gradient(180deg,#faf5ff,#fdf2f8)]" />;
  }

  if (!user) {
    return <LoginPage />;
  }

  return <AppShell />;
}

function AppShell() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [view, setView] = useState("list"); // mobile only: "list" | "form"
  const [modalOpen, setModalOpen] = useState(false); // tablet/desktop
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState(null);
  const [sortBy, setSortBy] = useState("date");

  const addTriggerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchSubscriptions()
      .then((rows) => {
        if (cancelled) return;
        setSubs(rows.map(fromApiSubscription));
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const monthlyTotal = subs.reduce((sum, s) => sum + s.price, 0);
  const yearlyTotal = monthlyTotal * 12;
  const count = subs.length;
  const nextRenewalDays = subs.length ? Math.min(...subs.map((s) => daysUntil(s.nextRenewal))) : null;
  const soonestSub = subs.length
    ? subs.reduce((min, s) => (daysUntil(s.nextRenewal) < daysUntil(min.nextRenewal) ? s : min), subs[0])
    : null;
  const mobileAlertSub = soonestSub && daysUntil(soonestSub.nextRenewal) <= 3 ? soonestSub : null;
  const sortedSubs = useMemo(() => sortSubs(subs, sortBy), [subs, sortBy]);

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = "הזן שם מנוי";
    const priceNum = parseFloat(form.price);
    if (!form.price.trim() || isNaN(priceNum) || priceNum <= 0) {
      next.price = "הזן מחיר תקין";
    }
    if (!form.date) next.date = "בחר תאריך";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function openAddMobile() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setSaveError(null);
    setView("form");
  }

  function openAddModal() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setSaveError(null);
    setModalOpen(true);
  }

  function editValuesFor(sub) {
    return {
      name: sub.name,
      price: String(sub.price),
      date: sub.nextRenewal,
      icon: sub.icon,
      image: sub.image ?? null,
      category: sub.category ?? null,
    };
  }

  function openEditMobile(sub) {
    setEditingId(sub.id);
    setForm(editValuesFor(sub));
    setErrors({});
    setSaveError(null);
    setView("form");
  }

  function openEditModal(sub) {
    setEditingId(sub.id);
    setForm(editValuesFor(sub));
    setErrors({});
    setSaveError(null);
    setModalOpen(true);
  }

  async function handleDelete(id) {
    const previous = subs;
    setSubs((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteSubscription(id);
    } catch (err) {
      setSubs(previous);
    }
  }

  async function handleSave() {
    if (!validate()) return;
    setSaveError(null);
    const payload = toApiPayload(form);
    try {
      if (editingId != null) {
        const updated = await updateSubscription(editingId, payload);
        setSubs((prev) => prev.map((s) => (s.id === editingId ? fromApiSubscription(updated) : s)));
      } else {
        const created = await createSubscription(payload);
        setSubs((prev) => [...prev, fromApiSubscription(created)]);
      }
    } catch (err) {
      setSaveError(err.message);
      return;
    }
    setForm(EMPTY_FORM);
    setErrors({});
    setEditingId(null);
    setView("list");
    setModalOpen(false);
  }

  function closeModal() {
    setModalOpen(false);
  }

  function cycleSort() {
    setSortBy((prev) => SORT_CYCLE[(SORT_CYCLE.indexOf(prev) + 1) % SORT_CYCLE.length]);
  }

  function retry() {
    setReloadKey((k) => k + 1);
  }

  const subscriptionsPageProps = {
    subs,
    sortedSubs,
    loading,
    error,
    onRetry: retry,
    monthlyTotal,
    yearlyTotal,
    count,
    nextRenewalDays,
    soonestSub,
    alertSub: mobileAlertSub,
    sortLabel: SORT_LABELS[sortBy],
    onCycleSort: cycleSort,
    view,
    modalOpen,
    editingId,
    form,
    setForm,
    errors,
    saveError,
    onAdd: openAddMobile,
    onAddClick: openAddModal,
    onEdit: openEditMobile,
    onEditModal: openEditModal,
    onDelete: handleDelete,
    onBack: () => setView("list"),
    onCloseModal: closeModal,
    onSave: handleSave,
    addTriggerRef,
  };

  return (
    <BrowserRouter>
      <MobileTabletNav />
      <Routes>
        <Route path="/" element={<SubscriptionsPage {...subscriptionsPageProps} />} />
        <Route
          path="/renewals"
          element={<RenewalsPage subs={subs} loading={loading} error={error} onRetry={retry} onDelete={handleDelete} />}
        />
        <Route
          path="/expenses"
          element={<ExpensesPage subs={subs} loading={loading} error={error} onRetry={retry} />}
        />
        <Route path="/settings" element={<SettingsPage subs={subs} />} />
      </Routes>
    </BrowserRouter>
  );
}
