import { ArrowRight, Clock, Plus } from "lucide-react";
import MetricCard from "../components/MetricCard";
import SubscriptionRow from "../components/SubscriptionRow";
import SubscriptionModal from "../components/SubscriptionModal";
import FormFields from "../components/FormFields";
import Sidebar from "../components/Sidebar";
import EmptyState from "../components/EmptyState";
import SkeletonRow from "../components/SkeletonRow";
import ErrorBanner from "../components/ErrorBanner";
import { categoryColor, daysUntil } from "../lib/subscriptions";

export default function SubscriptionsPage(props) {
  return (
    <>
      <MobileShell {...props} onEdit={props.onEdit} />
      <TabletShell {...props} onEdit={props.onEditModal} />
      <DesktopShell {...props} onEdit={props.onEditModal} />
    </>
  );
}

function ListBody({ loading, error, onRetry, subs, empty, skeletonHeight, skeletonCount = 4, children }) {
  if (loading) {
    return Array.from({ length: skeletonCount }).map((_, i) => <SkeletonRow key={i} height={skeletonHeight} />);
  }
  if (error) {
    return <ErrorBanner onRetry={onRetry} />;
  }
  if (subs.length === 0) {
    return empty;
  }
  return children;
}

function MobileShell({
  subs,
  loading,
  error,
  onRetry,
  monthlyTotal,
  count,
  alertSub,
  view,
  form,
  setForm,
  errors,
  saveError,
  editingId,
  onAdd,
  onEdit,
  onDelete,
  onBack,
  onSave,
}) {
  return (
    <div className="sm:hidden min-h-screen w-full">
      {view === "list" ? (
        <div className="min-h-screen flex flex-col gap-4 px-[18px] py-[22px] bg-[linear-gradient(180deg,#faf5ff,#fff_40%)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="m-0 text-xs font-semibold text-[#8b5cf6]">אוגוסט 2026</p>
              <p className="mt-0.5 mb-0 text-[22px] font-bold text-[#1b1033]">המנויים שלי</p>
            </div>
            <button onClick={onAdd} aria-label="הוסף מנוי" className="w-11 h-11 -m-[2px] flex items-center justify-center">
              <span
                className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-[#7c3aed]"
                style={{ boxShadow: "0 8px 18px -6px rgba(124,58,237,.8)" }}
              >
                <Plus size={20} />
              </span>
            </button>
          </div>

          <div className="grid grid-cols-[1.3fr_1fr] gap-2.5">
            <MetricCard
              label="בחודש"
              value={`₪${monthlyTotal}`}
              variant="gradient"
              padding="p-4"
              valueSize="text-[28px]"
              labelSize="text-xs"
            />
            <MetricCard
              label="מנויים"
              value={count}
              variant="teal"
              padding="p-4"
              valueSize="text-[28px]"
              labelSize="text-xs"
            />
          </div>

          {alertSub && (
            <div className="flex items-center gap-2 px-3.5 py-3 rounded-[14px] bg-[#fff1f2] border border-[#fecdd3]">
              <Clock size={18} className="text-[#e11d48] shrink-0" />
              <p className="m-0 text-[13px] font-medium text-[#9f1239]">
                {alertSub.name} מתחדש בעוד {daysUntil(alertSub.nextRenewal)} ימים
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            <ListBody
              loading={loading}
              error={error}
              onRetry={onRetry}
              subs={subs}
              skeletonHeight={66}
              empty={<EmptyState onAdd={onAdd} />}
            >
              {subs.map((sub) => (
                <SubscriptionRow key={sub.id} sub={sub} variant="mobile" onEdit={onEdit} onDelete={onDelete} />
              ))}
            </ListBody>
          </div>
        </div>
      ) : (
        <div className="min-h-screen w-full flex flex-col bg-white">
          <div
            className="px-[18px] pt-[22px] pb-[26px] text-white"
            style={{ background: "linear-gradient(140deg,#7c3aed,#c026d3)" }}
          >
            <div className="flex items-center gap-2.5">
              <button onClick={onBack} aria-label="חזרה" className="w-11 h-11 -m-[5px] flex items-center justify-center">
                <span className="w-[34px] h-[34px] rounded-[11px] flex items-center justify-center bg-[rgba(255,255,255,.18)]">
                  <ArrowRight size={17} />
                </span>
              </button>
              <p className="m-0 text-[19px] font-bold">{editingId != null ? "עריכת מנוי" : "מנוי חדש"}</p>
            </div>
            <p className="mt-2.5 mb-0 text-[13px] opacity-85">שלוש שדות ואפשר לשמור</p>
          </div>
          <div className="flex-1 px-[18px] py-5 flex flex-col gap-4">
            <FormFields form={form} setForm={setForm} errors={errors} />
            {saveError && <p className="m-0 text-sm font-medium text-[#e11d48]">{saveError}</p>}
            <button
              onClick={onSave}
              className="mt-auto w-full rounded-[14px] p-3.5 text-white text-[15px] font-bold"
              style={{
                background: "linear-gradient(140deg,#7c3aed,#c026d3)",
                boxShadow: "0 12px 24px -14px rgba(124,58,237,.9)",
              }}
            >
              {editingId != null ? "שמור שינויים" : "הוסף מנוי"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TabletShell({
  subs,
  sortedSubs,
  loading,
  error,
  onRetry,
  monthlyTotal,
  count,
  nextRenewalDays,
  sortLabel,
  onCycleSort,
  modalOpen,
  editingId,
  form,
  setForm,
  errors,
  saveError,
  onAddClick,
  onEdit,
  onDelete,
  onCloseModal,
  onSave,
  addTriggerRef,
}) {
  return (
    <div className="hidden sm:block lg:hidden min-h-screen w-full relative bg-[linear-gradient(180deg,#faf5ff,#fff_35%)] p-[30px]">
      <div className="flex flex-col gap-[22px]">
        <div className="flex items-end justify-between">
          <div>
            <p className="m-0 text-xs font-semibold tracking-[.08em] text-[#8b5cf6]">אוגוסט 2026</p>
            <p className="mt-1 mb-0 text-[28px] font-bold text-[#1b1033]">המנויים שלי</p>
          </div>
          <div className="flex gap-2.5">
            <button
              onClick={onCycleSort}
              className="rounded-xl px-4 py-[11px] text-sm font-medium border-[1.5px] border-[#ddd3f7] bg-white text-[#4c1d95]"
            >
              מיון: {sortLabel}
            </button>
            <button
              onClick={(e) => {
                addTriggerRef.current = e.currentTarget;
                onAddClick();
              }}
              className="flex items-center gap-2 rounded-xl px-[18px] py-[11px] text-sm font-semibold text-white"
              style={{
                background: "linear-gradient(140deg,#7c3aed,#c026d3)",
                boxShadow: "0 12px 24px -14px rgba(124,58,237,.9)",
              }}
            >
              <Plus size={17} />
              מנוי חדש
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-[14px]">
          <MetricCard label="בחודש" value={`₪${monthlyTotal}`} variant="gradient" valueSize="text-[34px]" />
          <MetricCard label="מנויים" value={count} variant="teal" valueSize="text-[34px]" />
          <MetricCard
            label="חידוש הבא"
            value={nextRenewalDays != null ? `${nextRenewalDays} ימים` : "—"}
            variant="rose"
            valueSize="text-[34px]"
          />
        </div>

        <div className="flex flex-col gap-3">
          <ListBody
            loading={loading}
            error={error}
            onRetry={onRetry}
            subs={subs}
            skeletonHeight={84}
            empty={<EmptyState onAdd={onAddClick} />}
          >
            {sortedSubs.map((sub) => (
              <SubscriptionRow key={sub.id} sub={sub} variant="tablet" onEdit={onEdit} onDelete={onDelete} />
            ))}
          </ListBody>
        </div>
      </div>

      <SubscriptionModal
        open={modalOpen}
        isEditing={editingId != null}
        form={form}
        setForm={setForm}
        errors={errors}
        saveError={saveError}
        onClose={onCloseModal}
        onSave={onSave}
        triggerRef={addTriggerRef}
      />
    </div>
  );
}

function SortHeader({ label, field, sortBy, sortDir, onSort, align }) {
  const active = sortBy === field;
  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={`flex items-center gap-1 text-xs font-semibold ${align === "left" ? "justify-start" : ""} ${
        active ? "text-[#7c3aed]" : "text-[#8b7cae]"
      }`}
    >
      {label}
      {active && <span className="text-[9px]">{sortDir === "asc" ? "▲" : "▼"}</span>}
    </button>
  );
}

function DesktopShell({
  subs,
  sortedSubs,
  loading,
  error,
  onRetry,
  monthlyTotal,
  yearlyTotal,
  count,
  nextRenewalDays,
  soonestSub,
  sortBy,
  sortDir,
  onSort,
  modalOpen,
  editingId,
  form,
  setForm,
  errors,
  saveError,
  onAddClick,
  onEdit,
  onDelete,
  onCloseModal,
  onSave,
  addTriggerRef,
}) {
  return (
    <div className="hidden lg:grid min-h-screen w-full" style={{ gridTemplateColumns: "250px 1fr" }}>
      <Sidebar
        activePage="subscriptions"
        bottomTitle="חסכת החודש"
        bottomValue="₪38"
        bottomValueColor="#34d399"
        bottomNote="אחרי ביטול מנוי אחד"
      />
      <div className="relative min-h-screen bg-[linear-gradient(180deg,#faf5ff,#fdf2f8)] px-[34px] py-[30px] flex flex-col gap-[22px]">
        <div className="flex items-end justify-between">
          <div>
            <p className="m-0 text-xs font-semibold tracking-[.08em] text-[#8b5cf6]">אוגוסט 2026</p>
            <p className="mt-1 mb-0 text-[30px] font-bold text-[#1b1033]">המנויים שלי</p>
          </div>
          <div className="flex gap-2.5">
            <button
              onClick={(e) => {
                addTriggerRef.current = e.currentTarget;
                onAddClick();
              }}
              className="flex items-center gap-2 rounded-xl px-[18px] py-[11px] text-sm font-semibold text-white"
              style={{
                background: "linear-gradient(140deg,#7c3aed,#c026d3)",
                boxShadow: "0 12px 26px -14px rgba(124,58,237,.9)",
              }}
            >
              <Plus size={17} />
              מנוי חדש
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-[14px]">
          <MetricCard label="בחודש" value={`₪${monthlyTotal}`} variant="gradient" />
          <MetricCard label="בשנה" value={`₪${yearlyTotal}`} variant="white" />
          <MetricCard label="מנויים" value={count} variant="teal" />
          <MetricCard
            label="חידוש הבא"
            value={nextRenewalDays != null ? `${nextRenewalDays} ימים` : "—"}
            variant="rose"
          />
        </div>

        <div className="grid gap-[22px] flex-1 min-h-0" style={{ gridTemplateColumns: "1fr 330px" }}>
          <div
            className="bg-white border border-[#ece7f7] rounded-[20px] pt-2 px-2 pb-3 overflow-hidden"
            style={{ boxShadow: "0 16px 36px -28px rgba(27,16,51,.7)" }}
          >
            <div
              className="grid px-4 py-3.5"
              style={{ gridTemplateColumns: "1fr 130px 120px 110px" }}
            >
              <SortHeader label="מנוי" field="name" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
              <SortHeader label="קטגוריה" field="category" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
              <SortHeader label="חידוש הבא" field="date" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
              <SortHeader label="מחיר" field="price" sortBy={sortBy} sortDir={sortDir} onSort={onSort} align="left" />
            </div>
            <div className="flex flex-col">
              <ListBody
                loading={loading}
                error={error}
                onRetry={onRetry}
                subs={subs}
                skeletonHeight={72}
                empty={<EmptyState onAdd={onAddClick} />}
              >
                {sortedSubs.map((sub) => (
                  <SubscriptionRow key={sub.id} sub={sub} variant="desktop" onEdit={onEdit} onDelete={onDelete} />
                ))}
              </ListBody>
            </div>
          </div>

          <div className="flex flex-col gap-4 min-h-0">
            <div className="bg-white border border-[#ece7f7] rounded-[20px] p-5">
              <p className="m-0 mb-3.5 text-[15px] font-bold text-[#1b1033]">פילוח לפי קטגוריה</p>
              <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
                {subs.map((sub) => {
                  const cat = categoryColor(sub.category);
                  const share = monthlyTotal ? (sub.price / monthlyTotal) * 100 : 0;
                  return (
                    <div key={sub.id} className="h-full" style={{ background: cat.color, width: `${share}%` }} />
                  );
                })}
              </div>
              <div className="flex flex-col gap-2.5 mt-3.5">
                {subs.map((sub) => {
                  const cat = categoryColor(sub.category);
                  return (
                    <div key={sub.id} className="flex items-center justify-between text-[13px]">
                      <div className="flex items-center gap-2">
                        <span className="w-[9px] h-[9px] rounded-full shrink-0" style={{ background: cat.color }} />
                        <span className="text-[#4b3a6b]">{sub.name}</span>
                      </div>
                      <span className="text-[#8b7cae]" dir="ltr">
                        ₪{sub.price}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {soonestSub && (
              <div
                className="rounded-[20px] p-5 border border-[#fecdd3]"
                style={{ background: "linear-gradient(140deg,#fff1f2,#ffe4e6)" }}
              >
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-[#e11d48]" />
                  <p className="m-0 text-[15px] font-bold text-[#9f1239]">מתחדש בקרוב</p>
                </div>
                <p className="mt-2.5 mb-0 text-[13px] text-[#9f1239]">
                  {soonestSub.name} ₪{soonestSub.price} · בעוד {daysUntil(soonestSub.nextRenewal)} ימים
                </p>
                <div className="mt-3.5 flex gap-2">
                  <button
                    onClick={() => onDelete(soonestSub.id)}
                    className="rounded-[10px] px-3.5 py-2.5 text-[13px] font-semibold text-white bg-[#e11d48]"
                  >
                    בטל מנוי
                  </button>
                  <div className="rounded-[10px] px-3.5 py-2.5 text-[13px] font-semibold text-[#9f1239] bg-white border border-[#fecdd3]">
                    הזכר לי
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <SubscriptionModal
          open={modalOpen}
          isEditing={editingId != null}
          form={form}
          setForm={setForm}
          errors={errors}
          saveError={saveError}
          onClose={onCloseModal}
          onSave={onSave}
          triggerRef={addTriggerRef}
        />
      </div>
    </div>
  );
}
