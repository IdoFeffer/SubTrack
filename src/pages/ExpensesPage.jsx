import { useNavigate } from "react-router-dom";
import MetricCard from "../components/MetricCard";
import SkeletonRow from "../components/SkeletonRow";
import ErrorBanner from "../components/ErrorBanner";
import EmptyState from "../components/EmptyState";
import PageShell from "../components/PageShell";
import { categoryColor, lastNMonths, monthLabel } from "../lib/subscriptions";

export default function ExpensesPage({ subs, loading, error, onRetry }) {
  const navigate = useNavigate();
  const monthlyTotal = subs.reduce((sum, s) => sum + s.price, 0);
  const yearlyTotal = monthlyTotal * 12;

  const months = lastNMonths(6).map(({ year, monthIndex, isCurrent }) => ({
    label: monthLabel(year, monthIndex).split(" ")[0],
    amount: monthlyTotal,
    isCurrent,
  }));
  const maxAmount = Math.max(1, ...months.map((m) => m.amount));
  const averageMonthly = monthlyTotal;

  const priciestSub = subs.length
    ? subs.reduce((max, s) => (s.price > max.price ? s : max), subs[0])
    : null;

  const categoryTotals = [];
  for (const sub of subs) {
    const existing = categoryTotals.find((c) => c.category === sub.category);
    if (existing) existing.total += sub.price;
    else categoryTotals.push({ category: sub.category, total: sub.price });
  }
  categoryTotals.sort((a, b) => b.total - a.total);

  const topCategory = categoryTotals[0] ?? null;
  const topCategoryShare = topCategory && monthlyTotal ? Math.round((topCategory.total / monthlyTotal) * 100) : 0;

  return (
    <PageShell
      activePage="expenses"
      bottomCard={{
        bottomTitle: "הוצאה שנתית צפויה",
        bottomValue: `₪${yearlyTotal}`,
        bottomNote: "לפי המנויים הפעילים",
      }}
    >
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <p className="m-0 text-xs font-semibold tracking-[.08em] text-[#8b5cf6]">6 חודשים אחרונים</p>
          <p className="mt-1 mb-0 text-[30px] font-bold text-[#1b1033]">הוצאות</p>
        </div>
      </div>

      {loading ? (
        <SkeletonRow height={300} />
      ) : error ? (
        <ErrorBanner onRetry={onRetry} />
      ) : subs.length === 0 ? (
        <EmptyState onAdd={() => navigate("/")} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-[14px]">
            <MetricCard label="החודש" value={`₪${monthlyTotal}`} variant="gradient" />
            <MetricCard label="ממוצע חודשי" value={`₪${averageMonthly}`} variant="white" />
            <MetricCard label="המנוי היקר" value={priciestSub?.name ?? "—"} variant="teal" valueSize="text-[24px]" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_330px] gap-[22px]">
            <div
              className="bg-white border border-[#ece7f7] rounded-[20px] p-6 flex flex-col gap-4"
              style={{ boxShadow: "0 16px 36px -28px rgba(27,16,51,.7)" }}
            >
              <p className="m-0 text-[15px] font-bold text-[#1b1033]">מגמת הוצאות</p>
              <div className="flex-1 grid grid-cols-6 gap-3 sm:gap-[18px] items-end min-h-[180px]">
                {months.map((m) => (
                  <div key={m.label} className="flex flex-col items-center gap-2.5 h-full justify-end">
                    <p className="m-0 text-[13px] font-bold text-[#1b1033]" dir="ltr">
                      ₪{m.amount}
                    </p>
                    <div
                      className="w-full rounded-t-[14px] rounded-b-[6px]"
                      style={{
                        background: m.isCurrent ? "linear-gradient(180deg,#c026d3,#7c3aed)" : "#ece7f7",
                        height: `${Math.max(6, (m.amount / maxAmount) * 100)}%`,
                      }}
                    />
                    <p
                      className="m-0 text-xs font-semibold"
                      style={{ color: m.isCurrent ? "#7c3aed" : "#8b7cae" }}
                    >
                      {m.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-white border border-[#ece7f7] rounded-[20px] p-5">
                <p className="m-0 mb-3.5 text-[15px] font-bold text-[#1b1033]">לפי קטגוריה</p>
                <div className="flex flex-col gap-3">
                  {categoryTotals.map((c) => {
                    const cat = categoryColor(c.category);
                    const share = monthlyTotal ? Math.round((c.total / monthlyTotal) * 100) : 0;
                    return (
                      <div key={c.category ?? "אחר"} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="text-[#4b3a6b] font-medium">{c.category || "אחר"}</span>
                          <span className="text-[#8b7cae]" dir="ltr">
                            ₪{c.total} · {share}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-[#f4f0fb]">
                          <div
                            className="h-full rounded-full"
                            style={{ background: cat.color, width: `${share}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {topCategory && (
                <div
                  className="rounded-[20px] p-5 border border-[#b9e6e0]"
                  style={{ background: "linear-gradient(140deg,#e7f6f4,#d1fae5)" }}
                >
                  <p className="m-0 text-[15px] font-bold text-[#0f766e]">הזדמנות לחיסכון</p>
                  <p className="mt-2.5 mb-0 text-[13px] text-[#0f766e]">
                    {topCategory.category || "אחר"} מהווה {topCategoryShare}% מההוצאה החודשית שלך.
                  </p>
                  <div className="mt-3.5 inline-block rounded-[10px] px-3.5 py-2.5 text-[13px] font-semibold text-white bg-[#0f766e]">
                    הצג פירוט
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </PageShell>
  );
}
