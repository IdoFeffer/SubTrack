import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import PageShell from "../components/PageShell";
import SkeletonRow from "../components/SkeletonRow";
import ErrorBanner from "../components/ErrorBanner";
import EmptyState from "../components/EmptyState";
import {
  WEEKDAY_LABELS,
  buildCalendar,
  categoryColor,
  daysUntil,
  monthLabel,
  round2,
  sortSubs,
} from "../lib/subscriptions";
import "./RenewalsPage.css";

export default function RenewalsPage({ subs, loading, error, onRetry, onDelete }) {
  const navigate = useNavigate();
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), monthIndex: now.getMonth() });

  const monthSubs = subs.filter((s) => {
    const d = new Date(s.nextRenewal);
    return d.getFullYear() === cursor.year && d.getMonth() === cursor.monthIndex;
  });
  const monthTotal = round2(monthSubs.reduce((sum, s) => sum + s.price, 0));

  const calendar = buildCalendar(cursor.year, cursor.monthIndex, subs);
  const upcoming = sortSubs(subs, "date");
  const soonest = upcoming[0] ?? null;

  const uniqueCategories = [];
  for (const sub of subs) {
    if (!uniqueCategories.some((c) => c.category === sub.category)) {
      uniqueCategories.push({ category: sub.category, ...categoryColor(sub.category) });
    }
  }

  function stepMonth(delta) {
    setCursor((prev) => {
      const d = new Date(prev.year, prev.monthIndex + delta, 1);
      return { year: d.getFullYear(), monthIndex: d.getMonth() };
    });
  }

  return (
    <PageShell
      activePage="renewals"
      bottomCard={{
        bottomTitle: `חידושים ב${monthLabel(cursor.year, cursor.monthIndex).split(" ")[0]}`,
        bottomValue: `${monthSubs.length} מנויים`,
        bottomValueSize: "22px",
        bottomNote: `₪${monthTotal}`,
      }}
    >
      <div className="renewals-header">
        <div>
          <p className="renewals-header__eyebrow">{monthLabel(cursor.year, cursor.monthIndex)}</p>
          <p className="renewals-header__title">לוח חידושים</p>
        </div>
        <div className="renewals-nav">
          <button onClick={() => stepMonth(-1)} aria-label="חודש קודם" className="renewals-nav__btn">
            <ChevronRight size={16} />
          </button>
          <div className="renewals-nav__label">{monthLabel(cursor.year, cursor.monthIndex)}</div>
          <button onClick={() => stepMonth(1)} aria-label="חודש הבא" className="renewals-nav__btn">
            <ChevronLeft size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <SkeletonRow height={300} />
      ) : error ? (
        <ErrorBanner onRetry={onRetry} />
      ) : subs.length === 0 ? (
        <EmptyState onAdd={() => navigate("/")} />
      ) : (
        <div className="renewals-body">
          <div className="renewals-calendar">
            <div className="renewals-calendar__grid">
              {WEEKDAY_LABELS.map((label, i) => (
                <p key={i} className="renewals-calendar__weekday">
                  {label}
                </p>
              ))}
            </div>
            <div className="renewals-calendar__grid">
              {calendar.map((cell) => (
                <div
                  key={cell.key}
                  className="renewals-calendar__cell"
                  style={{ background: cell.bg, border: `1px solid ${cell.border}` }}
                >
                  <span className="renewals-calendar__day" style={{ color: cell.dayColor }}>
                    {cell.day}
                  </span>
                  {cell.chips?.slice(0, 2).map((chip, i) => (
                    <div
                      key={i}
                      className="renewals-calendar__chip"
                      style={{ background: "#ffffffcc", color: chip.color }}
                    >
                      {chip.name}
                    </div>
                  ))}
                  {cell.chips?.length > 2 && (
                    <span className="renewals-calendar__more" style={{ color: cell.dayColor }}>
                      +{cell.chips.length - 2}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="renewals-side">
            <div className="upcoming-card">
              <p className="upcoming-card__title">החידושים הקרובים</p>
              <div className="upcoming-card__list">
                {upcoming.map((sub) => {
                  const cat = categoryColor(sub.category);
                  const days = daysUntil(sub.nextRenewal);
                  const soon = days <= 3;
                  const dateLabel = soon
                    ? `בעוד ${days} ימים`
                    : new Date(sub.nextRenewal).toLocaleDateString("he-IL", { day: "numeric", month: "long" });
                  return (
                    <div key={sub.id} className="upcoming-row">
                      <div className="upcoming-row__main">
                        <div className="upcoming-row__avatar" style={{ background: cat.tint }}>
                          {sub.image ? <img src={sub.image} alt="" /> : sub.icon}
                        </div>
                        <div>
                          <p className="upcoming-row__name">{sub.name}</p>
                          <p className="upcoming-row__date" style={{ color: soon ? "#e11d48" : "#8b7cae" }}>
                            {dateLabel}
                          </p>
                        </div>
                      </div>
                      <p className="upcoming-row__price" dir="ltr">
                        ₪{sub.price}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {soonest && (
              <div className="urgent-card">
                <div className="urgent-card__head">
                  <Clock size={18} className="urgent-card__icon" style={{ color: "#e11d48" }} />
                  <p className="urgent-card__title">הכי דחוף</p>
                </div>
                <p className="urgent-card__text">
                  {soonest.name} ₪{soonest.price} · בעוד {daysUntil(soonest.nextRenewal)} ימים
                </p>
                <div className="urgent-card__actions">
                  <button onClick={() => onDelete(soonest.id)} className="urgent-card__cancel">
                    בטל מנוי
                  </button>
                  <div className="urgent-card__remind">הזכר לי</div>
                </div>
              </div>
            )}

            <div className="legend-card">
              <p className="legend-card__title">מקרא</p>
              <div className="legend-card__chips">
                {uniqueCategories.map((c) => (
                  <span key={c.category} className="legend-chip" style={{ color: c.color, background: c.tint }}>
                    {c.category || "אחר"}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
