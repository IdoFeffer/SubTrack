import { Link } from "react-router-dom";
import { Calendar, LayoutGrid } from "lucide-react";

const NAV_ITEMS = [
  { key: "subscriptions", label: "המנויים שלי", icon: LayoutGrid, to: "/" },
  { key: "renewals", label: "לוח חידושים", icon: Calendar, to: "/renewals" },
];

export default function Sidebar({
  activePage,
  bottomTitle,
  bottomValue,
  bottomValueColor = "#fff",
  bottomValueSize = "text-[22px]",
  bottomNote,
}) {
  return (
    <div className="flex flex-col gap-[26px] px-5 py-[26px] bg-[linear-gradient(180deg,#2a1258,#1b1033)]">
      <div className="flex items-center gap-2.5">
        <div className="w-[34px] h-[34px] rounded-[11px] flex items-center justify-center text-white font-bold text-[15px] bg-[linear-gradient(140deg,#a855f7,#ec4899)]">
          S
        </div>
        <p className="m-0 text-lg font-bold text-white">SubTrack</p>
      </div>

      <div className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ key, label, icon: Icon, to }) => {
          const active = key === activePage;
          return (
            <Link
              key={key}
              to={to}
              className={`flex items-center gap-2.5 px-3.5 py-[11px] rounded-xl text-sm ${
                active ? "bg-[rgba(168,85,247,.22)] text-white font-semibold" : "text-[#b6a8d6]"
              }`}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto rounded-2xl p-4 bg-[rgba(255,255,255,.07)]">
        <p className="m-0 text-xs text-[#c9bce6]">{bottomTitle}</p>
        <p
          className={`mt-1.5 mb-0 font-bold ${bottomValueSize}`}
          style={{ color: bottomValueColor }}
          dir="ltr"
        >
          <span style={{ textAlign: "right", display: "block" }}>{bottomValue}</span>
        </p>
        {bottomNote && <p className="mt-1.5 mb-0 text-[11px] text-[#9c8dc0]">{bottomNote}</p>}
      </div>
    </div>
  );
}
