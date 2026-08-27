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
import "./SubscriptionsPage.css";

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
    <div className="subs-mobile">
      {view === "list" ? (
        <div className="subs-mobile__list-view">
          <div className="subs-mobile__head">
            <div>
              <p className="subs-mobile__eyebrow">אוגוסט 2026</p>
              <p className="subs-mobile__title">המנויים שלי</p>
            </div>
            <button onClick={onAdd} aria-label="הוסף מנוי" className="subs-mobile__add-btn">
              <span className="subs-mobile__add-icon">
                <Plus size={20} />
              </span>
            </button>
          </div>

          <div className="subs-mobile__metrics">
            <MetricCard
              label="בחודש"
              value={`₪${monthlyTotal}`}
              variant="gradient"
              padding="16px"
              valueSize="28px"
              labelSize="12px"
            />
            <MetricCard
              label="מנויים"
              value={count}
              variant="teal"
              padding="16px"
              valueSize="28px"
              labelSize="12px"
            />
          </div>

          {alertSub && (
            <div className="subs-mobile__alert">
              <Clock size={18} className="subs-mobile__alert-icon" />
              <p className="subs-mobile__alert-text">
                {alertSub.name} מתחדש בעוד {daysUntil(alertSub.nextRenewal)} ימים
              </p>
            </div>
          )}

          <div className="subs-mobile__rows">
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
        <div className="subs-mobile__form-view">
          <div className="subs-mobile__form-header">
            <div className="subs-mobile__form-head-row">
              <button onClick={onBack} aria-label="חזרה" className="subs-mobile__back-btn">
                <span className="subs-mobile__back-icon">
                  <ArrowRight size={17} />
                </span>
              </button>
              <p className="subs-mobile__form-title">{editingId != null ? "עריכת מנוי" : "מנוי חדש"}</p>
            </div>
            <p className="subs-mobile__form-subtitle">שלוש שדות ואפשר לשמור</p>
          </div>
          <div className="subs-mobile__form-body">
            <FormFields form={form} setForm={setForm} errors={errors} />
            {saveError && <p className="subs-mobile__form-error">{saveError}</p>}
            <button onClick={onSave} className="subs-mobile__save-btn">
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
    <div className="subs-tablet">
      <div className="subs-tablet__inner">
        <div className="subs-tablet__head">
          <div>
            <p className="subs-tablet__eyebrow">אוגוסט 2026</p>
            <p className="subs-tablet__title">המנויים שלי</p>
          </div>
          <div className="subs-tablet__actions">
            <button onClick={onCycleSort} className="subs-tablet__sort-btn">
              מיון: {sortLabel}
            </button>
            <button
              onClick={(e) => {
                addTriggerRef.current = e.currentTarget;
                onAddClick();
              }}
              className="subs-tablet__add-btn"
            >
              <Plus size={17} />
              מנוי חדש
            </button>
          </div>
        </div>

        <div className="subs-tablet__metrics">
          <MetricCard label="בחודש" value={`₪${monthlyTotal}`} variant="gradient" valueSize="34px" />
          <MetricCard label="מנויים" value={count} variant="teal" valueSize="34px" />
          <MetricCard
            label="חידוש הבא"
            value={nextRenewalDays != null ? `${nextRenewalDays} ימים` : "—"}
            variant="rose"
            valueSize="34px"
          />
        </div>

        <div className="subs-tablet__rows">
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
      className={`subs-desktop__sort-header ${align === "left" ? "subs-desktop__sort-header--left" : ""} ${
        active ? "subs-desktop__sort-header--active" : ""
      }`}
    >
      {label}
      {active && <span className="subs-desktop__sort-arrow">{sortDir === "asc" ? "▲" : "▼"}</span>}
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
    <div className="subs-desktop">
      <Sidebar
        activePage="subscriptions"
        bottomTitle="חסכת החודש"
        bottomValue="₪38"
        bottomValueColor="#34d399"
        bottomNote="אחרי ביטול מנוי אחד"
      />
      <div className="subs-desktop__content">
        <div className="subs-desktop__head">
          <div>
            <p className="subs-desktop__eyebrow">אוגוסט 2026</p>
            <p className="subs-desktop__title">המנויים שלי</p>
          </div>
          <div>
            <button
              onClick={(e) => {
                addTriggerRef.current = e.currentTarget;
                onAddClick();
              }}
              className="subs-desktop__add-btn"
            >
              <Plus size={17} />
              מנוי חדש
            </button>
          </div>
        </div>

        <div className="subs-desktop__metrics">
          <MetricCard label="בחודש" value={`₪${monthlyTotal}`} variant="gradient" />
          <MetricCard label="בשנה" value={`₪${yearlyTotal}`} variant="white" />
          <MetricCard label="מנויים" value={count} variant="teal" />
          <MetricCard
            label="חידוש הבא"
            value={nextRenewalDays != null ? `${nextRenewalDays} ימים` : "—"}
            variant="rose"
          />
        </div>

        <div className="subs-desktop__body">
          <div className="subs-desktop__table">
            <div className="subs-desktop__table-head">
              <SortHeader label="מנוי" field="name" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
              <SortHeader label="קטגוריה" field="category" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
              <SortHeader label="חידוש הבא" field="date" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
              <SortHeader label="מחיר" field="price" sortBy={sortBy} sortDir={sortDir} onSort={onSort} align="left" />
            </div>
            <div className="subs-desktop__table-body">
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

          <div className="subs-desktop__side">
            <div className="category-split">
              <p className="category-split__title">פילוח לפי קטגוריה</p>
              <div className="category-split__bar">
                {subs.map((sub) => {
                  const cat = categoryColor(sub.category);
                  const share = monthlyTotal ? (sub.price / monthlyTotal) * 100 : 0;
                  return (
                    <div
                      key={sub.id}
                      className="category-split__segment"
                      style={{ background: cat.color, width: `${share}%` }}
                    />
                  );
                })}
              </div>
              <div className="category-split__list">
                {subs.map((sub) => {
                  const cat = categoryColor(sub.category);
                  return (
                    <div key={sub.id} className="category-split__row">
                      <div className="category-split__row-main">
                        <span className="category-split__dot" style={{ background: cat.color }} />
                        <span className="category-split__name">{sub.name}</span>
                      </div>
                      <span className="category-split__price" dir="ltr">
                        ₪{sub.price}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {soonestSub && (
              <div className="soonest-card">
                <div className="soonest-card__head">
                  <Clock size={18} style={{ color: "#e11d48" }} />
                  <p className="soonest-card__title">מתחדש בקרוב</p>
                </div>
                <p className="soonest-card__text">
                  {soonestSub.name} ₪{soonestSub.price} · בעוד {daysUntil(soonestSub.nextRenewal)} ימים
                </p>
                <div className="soonest-card__actions">
                  <button onClick={() => onDelete(soonestSub.id)} className="soonest-card__cancel">
                    בטל מנוי
                  </button>
                  <div className="soonest-card__remind">הזכר לי</div>
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
