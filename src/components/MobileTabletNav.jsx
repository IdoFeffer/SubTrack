import { NavLink } from "react-router-dom";
import { BarChart3, Calendar, LayoutGrid, Settings } from "lucide-react";
import "./MobileTabletNav.css";

const NAV_ITEMS = [
  { label: "מנויים", icon: LayoutGrid, to: "/", end: true },
  { label: "חידושים", icon: Calendar, to: "/renewals" },
  { label: "הוצאות", icon: BarChart3, to: "/expenses" },
  { label: "הגדרות", icon: Settings, to: "/settings" },
];

export default function MobileTabletNav() {
  return (
    <nav className="mobile-nav">
      {NAV_ITEMS.map(({ label, icon: Icon, to, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `mobile-nav__link ${isActive ? "mobile-nav__link--active" : ""}`}
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
