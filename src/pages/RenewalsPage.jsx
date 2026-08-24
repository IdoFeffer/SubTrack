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
  sortSubs,
} from "../lib/subscriptions";

export default function RenewalsPage({ subs, loading, error, onRetry, onDelete }) {
  const navigate = useNavigate();
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), monthIndex: now.getMonth() });

  const monthSubs = subs.filter((s) => {
    const d = new Date(s.nextRenewal);
    return d.getFullYear() === cursor.year && d.getMonth() === cursor.monthIndex;
  });
  const monthTotal = monthSubs.reduce((sum, s) => sum + s.price, 0);

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
        bottomValueSize: "text-[22px]",
        bottomNote: `₪${monthTotal}`,
      }}
    >
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <p className="m-0 text-xs font-semibold tracking-[.08em] text-[#8b5cf6]">
            {monthLabel(cursor.year, cursor.monthIndex)}
          </p>
          <p className="mt-1 mb-0 text-[30px] font-bold text-[#1b1033]">לוח חידושים</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => stepMonth(-1)}
            aria-label="חודש קודם"
            className="w-11 h-11 lg:w-[38px] lg:h-[38px] rounded-xl bg-white border-[1.5px] border-[#ddd3f7] flex items-center justify-center text-[#4c1d95]"
          >
            <ChevronRight size={16} />
          </button>
          <div className="px-4 py-2.5 rounded-xl bg-white border-[1.5px] border-[#ddd3f7] text-sm font-semibold text-[#4c1d95]">
            {monthLabel(cursor.year, cursor.monthIndex)}
          </div>
          <button
            onClick={() => stepMonth(1)}
            aria-label="חודש הבא"
            className="w-11 h-11 lg:w-[38px] lg:h-[38px] rounded-xl bg-white border-[1.5px] border-[#ddd3f7] flex items-center justify-center text-[#4c1d95]"
          >
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
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_330px] gap-[22px]">
          <div
            className="bg-white border border-[#ece7f7] rounded-[20px] p-5 flex flex-col gap-2.5 overflow-x-auto"
            style={{ boxShadow: "0 16px 36px -28px rgba(27,16,51,.7)" }}
          >
            <div className="grid grid-cols-7 gap-2 min-w-[320px]">
              {WEEKDAY_LABELS.map((label, i) => (
                <p key={i} className="m-0 text-center text-xs font-semibold text-[#8b7cae]">
                  {label}
                </p>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2 min-w-[320px]">
              {calendar.map((cell) => (
                <div
                  key={cell.key}
                  className="rounded-xl p-2 flex flex-col gap-1.5 min-h-[64px]"
                  style={{ background: cell.bg, border: `1px solid ${cell.border}` }}
                >
                  <span className="text-[13px] font-semibold" style={{ color: cell.dayColor }}>
                    {cell.day}
                  </span>
                  {cell.chip && (
                    <div
                      className="rounded-lg px-1.5 py-1 text-[11px] font-semibold truncate"
                      style={{ background: "#ffffffcc", color: cell.chip.color }}
                    >
                      {cell.chip.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-white border border-[#ece7f7] rounded-[20px] p-5">
              <p className="m-0 mb-3.5 text-[15px] font-bold text-[#1b1033]">החידושים הקרובים</p>
              <div className="flex flex-col gap-2.5">
                {upcoming.map((sub) => {
                  const cat = categoryColor(sub.category);
                  const days = daysUntil(sub.nextRenewal);
                  const soon = days <= 3;
                  const dateLabel = soon
                    ? `בעוד ${days} ימים`
                    : new Date(sub.nextRenewal).toLocaleDateString("he-IL", { day: "numeric", month: "long" });
                  return (
                    <div key={sub.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-[17px] overflow-hidden shrink-0"
                          style={{ background: cat.tint }}
                        >
                          {sub.image ? (
                            <img src={sub.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            sub.icon
                          )}
                        </div>
                        <div>
                          <p className="m-0 text-sm font-semibold text-[#1b1033]">{sub.name}</p>
                          <p className="mt-0.5 mb-0 text-xs font-medium" style={{ color: soon ? "#e11d48" : "#8b7cae" }}>
                            {dateLabel}
                          </p>
                        </div>
                      </div>
                      <p className="m-0 text-sm font-bold text-[#1b1033]" dir="ltr">
                        ₪{sub.price}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {soonest && (
              <div
                className="rounded-[20px] p-5 border border-[#fecdd3]"
                style={{ background: "linear-gradient(140deg,#fff1f2,#ffe4e6)" }}
              >
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-[#e11d48]" />
                  <p className="m-0 text-[15px] font-bold text-[#9f1239]">הכי דחוף</p>
                </div>
                <p className="mt-2.5 mb-0 text-[13px] text-[#9f1239]">
                  {soonest.name} ₪{soonest.price} · בעוד {daysUntil(soonest.nextRenewal)} ימים
                </p>
                <div className="mt-3.5 flex gap-2">
                  <button
                    onClick={() => onDelete(soonest.id)}
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

            <div className="bg-white border border-[#ece7f7] rounded-[20px] p-5">
              <p className="m-0 mb-2.5 text-[15px] font-bold text-[#1b1033]">מקרא</p>
              <div className="flex flex-wrap gap-2">
                {uniqueCategories.map((c) => (
                  <span
                    key={c.category}
                    className="rounded-full px-3 py-1.5 text-xs font-semibold"
                    style={{ color: c.color, background: c.tint }}
                  >
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
