import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MetricCard from "../components/MetricCard";
import SkeletonRow from "../components/SkeletonRow";
import ErrorBanner from "../components/ErrorBanner";
import EmptyState from "../components/EmptyState";
import PageShell from "../components/PageShell";
import { categoryColor, lastNMonths, monthLabel, round2 } from "../lib/subscriptions";
import "./ExpensesPage.css";

export default function ExpensesPage({ subs, loading, error, onRetry }) {
  const navigate = useNavigate();
  const [showTopCategoryDetails, setShowTopCategoryDetails] = useState(false);
  const monthlyTotal = round2(subs.reduce((sum, s) => sum + s.price, 0));
  const yearlyTotal = round2(monthlyTotal * 12);

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
    if (existing) existing.total = round2(existing.total + sub.price);
    else categoryTotals.push({ category: sub.category, total: sub.price });
  }
  categoryTotals.sort((a, b) => b.total - a.total);

  const topCategory = categoryTotals[0] ?? null;
  const topCategoryShare = topCategory && monthlyTotal ? Math.round((topCategory.total / monthlyTotal) * 100) : 0;
  const topCategorySubs = topCategory
    ? subs.filter((s) => s.category === topCategory.category).sort((a, b) => b.price - a.price)
    : [];

  return (
    <PageShell
      activePage="expenses"
      bottomCard={{
        bottomTitle: "הוצאה שנתית צפויה",
        bottomValue: `₪${yearlyTotal}`,
        bottomNote: "לפי המנויים הפעילים",
      }}
    >
      <div className="expenses-header">
        <div>
          <p className="expenses-header__eyebrow">6 חודשים אחרונים</p>
          <p className="expenses-header__title">הוצאות</p>
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
          <div className="expenses-metrics">
            <MetricCard label="החודש" value={`₪${monthlyTotal}`} variant="gradient" />
            <MetricCard label="ממוצע חודשי" value={`₪${averageMonthly}`} variant="white" />
            <MetricCard label="המנוי היקר" value={priciestSub?.name ?? "—"} variant="teal" valueSize="24px" />
          </div>

          <div className="expenses-body">
            <div className="trend-card">
              <p className="trend-card__title">מגמת הוצאות</p>
              <div className="trend-chart">
                {months.map((m) => (
                  <div key={m.label} className="trend-chart__col">
                    <p className="trend-chart__amount" dir="ltr">
                      ₪{m.amount}
                    </p>
                    <div
                      className="trend-chart__bar"
                      style={{
                        background: m.isCurrent ? "var(--gradient-bar)" : "var(--color-border)",
                        height: `${Math.max(6, (m.amount / maxAmount) * 100)}%`,
                      }}
                    />
                    <p className="trend-chart__label" style={{ color: m.isCurrent ? "#7c3aed" : "#8b7cae" }}>
                      {m.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="expenses-side">
              <div className="category-breakdown">
                <p className="category-breakdown__title">לפי קטגוריה</p>
                <div className="category-breakdown__list">
                  {categoryTotals.map((c) => {
                    const cat = categoryColor(c.category);
                    const share = monthlyTotal ? Math.round((c.total / monthlyTotal) * 100) : 0;
                    return (
                      <div key={c.category ?? "אחר"} className="category-breakdown__row">
                        <div className="category-breakdown__row-top">
                          <span className="category-breakdown__name">{c.category || "אחר"}</span>
                          <span className="category-breakdown__value" dir="ltr">
                            ₪{c.total} · {share}%
                          </span>
                        </div>
                        <div className="category-breakdown__track">
                          <div
                            className="category-breakdown__fill"
                            style={{ background: cat.color, width: `${share}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {topCategory && (
                <div className="savings-card">
                  <p className="savings-card__title">הזדמנות לחיסכון</p>
                  <p className="savings-card__text">
                    {topCategory.category || "אחר"} מהווה {topCategoryShare}% מההוצאה החודשית שלך.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowTopCategoryDetails((v) => !v)}
                    className="savings-card__toggle"
                  >
                    {showTopCategoryDetails ? "הסתר פירוט" : "הצג פירוט"}
                  </button>

                  {showTopCategoryDetails && (
                    <div className="savings-card__details">
                      {topCategorySubs.map((sub) => (
                        <div key={sub.id} className="savings-card__detail-row">
                          <span className="savings-card__detail-name">
                            {sub.icon} {sub.name}
                          </span>
                          <span className="savings-card__detail-price" dir="ltr">
                            ₪{sub.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </PageShell>
  );
}
