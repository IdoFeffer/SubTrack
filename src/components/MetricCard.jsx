import "./MetricCard.css";

export default function MetricCard({
  label,
  value,
  variant = "white",
  padding = "20px",
  labelSize = "13px",
  valueSize = "32px",
}) {
  return (
    <div className={`metric-card metric-card--${variant}`} style={{ padding }}>
      <p className="metric-card__label" style={{ fontSize: labelSize }}>
        {label}
      </p>
      <p className="metric-card__value" style={{ fontSize: valueSize }} dir="ltr">
        {value}
      </p>
    </div>
  );
}
