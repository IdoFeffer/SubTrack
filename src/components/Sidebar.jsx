import { BarChart3, Calendar, LayoutGrid, Settings } from "lucide-react";

const NAV_ITEMS = [
  { label: "המנויים שלי", icon: LayoutGrid, active: true },
  { label: "לוח חידושים", icon: Calendar, active: false },
  { label: "הוצאות", icon: BarChart3, active: false },
  { label: "הגדרות", icon: Settings, active: false },
];

export default function Sidebar({ savings = 38 }) {
  return (
    <div className="flex flex-col gap-[26px] px-5 py-[26px] bg-[linear-gradient(180deg,#2a1258,#1b1033)]">
      <div className="flex items-center gap-2.5">
        <div className="w-[34px] h-[34px] rounded-[11px] flex items-center justify-center text-white font-bold text-[15px] bg-[linear-gradient(140deg,#a855f7,#ec4899)]">
          S
        </div>
        <p className="m-0 text-lg font-bold text-white">SubTrack</p>
      </div>

      <div className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ label, icon: Icon, active }) => (
          <div
            key={label}
            className={`flex items-center gap-2.5 px-3.5 py-[11px] rounded-xl text-sm ${
              active ? "bg-[rgba(168,85,247,.22)] text-white font-semibold" : "text-[#b6a8d6]"
            }`}
          >
            <Icon size={17} />
            {label}
          </div>
        ))}
      </div>

      <div className="mt-auto rounded-2xl p-4 bg-[rgba(255,255,255,.07)]">
        <p className="m-0 text-xs text-[#c9bce6]">חסכת החודש</p>
        <p className="mt-1.5 mb-0 text-[22px] font-bold text-[#34d399]" dir="ltr" style={{ textAlign: "right" }}>
          ₪{savings}
        </p>
        <p className="mt-1.5 mb-0 text-[11px] text-[#9c8dc0]">אחרי ביטול מנוי אחד</p>
      </div>
    </div>
  );
}
