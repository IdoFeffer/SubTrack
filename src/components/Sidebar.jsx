import { Link } from "react-router-dom";
import { BarChart3, Calendar, LayoutGrid, Settings } from "lucide-react";
import "./Sidebar.css";

const NAV_ITEMS = [
  { key: "subscriptions", label: "המנויים שלי", icon: LayoutGrid, to: "/" },
  { key: "renewals", label: "לוח חידושים", icon: Calendar, to: "/renewals" },
  { key: "expenses", label: "הוצאות", icon: BarChart3, to: "/expenses" },
  { key: "settings", label: "הגדרות", icon: Settings, to: "/settings" },
];

export default function Sidebar({
  activePage,
  bottomTitle,
  bottomValue,
  bottomValueColor = "#fff",
  bottomValueSize = "22px",
  bottomNote,
}) {
  return (
    <div className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__logo">S</div>
        <p className="sidebar__title">SubTrack</p>
      </div>

      <div className="sidebar__nav">
        {NAV_ITEMS.map(({ key, label, icon: Icon, to }) => {
          const active = key === activePage;
          return (
            <Link
              key={key}
              to={to}
              className={`sidebar__link ${active ? "sidebar__link--active" : ""}`}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </div>

      <div className="sidebar__bottom">
        <p className="sidebar__bottom-title">{bottomTitle}</p>
        <p className="sidebar__bottom-value" style={{ color: bottomValueColor, fontSize: bottomValueSize }} dir="ltr">
          <span className="sidebar__bottom-value-inner">{bottomValue}</span>
        </p>
        {bottomNote && <p className="sidebar__bottom-note">{bottomNote}</p>}
      </div>
    </div>
  );
}
