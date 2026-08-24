import { NavLink } from "react-router-dom";
import { Calendar, LayoutGrid } from "lucide-react";

const NAV_ITEMS = [
  { label: "מנויים", icon: LayoutGrid, to: "/", end: true },
  { label: "חידושים", icon: Calendar, to: "/renewals" },
];

export default function MobileTabletNav() {
  return (
    <nav className="lg:hidden sticky top-0 z-20 flex bg-white border-b border-[#ece7f7]">
      {NAV_ITEMS.map(({ label, icon: Icon, to, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex-1 min-h-11 flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium ${
              isActive ? "text-[#7c3aed]" : "text-[#8b7cae]"
            }`
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
