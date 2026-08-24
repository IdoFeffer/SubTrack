import { Pencil, Trash2 } from "lucide-react";
import { categoryColor, daysUntil, formatDate } from "../lib/subscriptions";

function Avatar({ sub, tint, size, radius, fontSize }) {
  return (
    <div
      className={`${size} ${radius} flex items-center justify-center ${fontSize} overflow-hidden shrink-0`}
      style={{ background: tint }}
    >
      {sub.image ? <img src={sub.image} alt="" className="w-full h-full object-cover" /> : sub.icon}
    </div>
  );
}

export default function SubscriptionRow({ sub, variant, onEdit, onDelete }) {
  const days = daysUntil(sub.nextRenewal);
  const soon = days <= 3;
  const dateLabel = soon ? `בעוד ${days} ימים` : formatDate(sub.nextRenewal);
  const dateColor = soon ? "#e11d48" : "#8b7cae";
  const cat = categoryColor(sub.category);

  if (variant === "mobile") {
    return (
      <div
        className="flex items-center justify-between px-3.5 py-3 bg-white border border-[#ece7f7] rounded-2xl"
        style={{ boxShadow: "0 6px 16px -12px rgba(27,16,51,.35)" }}
      >
        <button
          onClick={() => onEdit(sub)}
          className="flex items-center gap-3 text-right min-w-0"
          aria-label={`ערוך את ${sub.name}`}
        >
          <Avatar sub={sub} tint={cat.tint} size="w-[42px] h-[42px]" radius="rounded-[13px]" fontSize="text-[19px]" />
          <div className="min-w-0">
            <p className="m-0 text-[15px] font-semibold text-[#1b1033] truncate">{sub.name}</p>
            <p className="mt-0.5 mb-0 text-xs font-medium" style={{ color: dateColor }}>
              {dateLabel}
            </p>
          </div>
        </button>
        <div className="flex items-center gap-1.5">
          <p className="m-0 text-[15px] font-bold text-[#1b1033]" dir="ltr">
            ₪{sub.price}
          </p>
          <button
            onClick={() => onEdit(sub)}
            aria-label={`ערוך את ${sub.name}`}
            className="w-11 h-11 -m-1.5 flex items-center justify-center"
          >
            <span className="w-[30px] h-[30px] rounded-full flex items-center justify-center bg-[#f6f3ff] text-[#7c3aed]">
              <Pencil size={14} />
            </span>
          </button>
          <button
            onClick={() => onDelete(sub.id)}
            aria-label={`מחק את ${sub.name}`}
            className="w-11 h-11 -m-1.5 flex items-center justify-center"
          >
            <span className="w-[30px] h-[30px] rounded-full flex items-center justify-center bg-[#fff1f2] text-[#e11d48]">
              <Trash2 size={15} />
            </span>
          </button>
        </div>
      </div>
    );
  }

  if (variant === "tablet") {
    return (
      <div
        className="flex items-center justify-between px-[18px] py-4 bg-white border border-[#ece7f7] rounded-[18px]"
        style={{ boxShadow: "0 10px 22px -18px rgba(27,16,51,.5)" }}
      >
        <button
          onClick={() => onEdit(sub)}
          className="flex items-center gap-3.5 text-right min-w-0"
          aria-label={`ערוך את ${sub.name}`}
        >
          <Avatar sub={sub} tint={cat.tint} size="w-[52px] h-[52px]" radius="rounded-2xl" fontSize="text-2xl" />
          <div className="min-w-0">
            <p className="m-0 text-[17px] font-semibold text-[#1b1033] truncate">{sub.name}</p>
            <p className="mt-0.5 mb-0 text-[13px] font-medium" style={{ color: dateColor }}>
              {dateLabel}
            </p>
          </div>
        </button>
        <div className="flex items-center gap-3">
          <span
            className="text-xs font-semibold rounded-full px-3 py-1.5"
            style={{ color: cat.color, background: cat.tint }}
          >
            {sub.category || "אחר"}
          </span>
          <p className="m-0 text-[17px] font-bold text-[#1b1033]" dir="ltr">
            ₪{sub.price}
          </p>
          <button
            onClick={() => onEdit(sub)}
            aria-label={`ערוך את ${sub.name}`}
            className="w-[34px] h-[34px] rounded-full flex items-center justify-center bg-[#f6f3ff] text-[#7c3aed]"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(sub.id)}
            aria-label={`מחק את ${sub.name}`}
            className="w-[34px] h-[34px] rounded-full flex items-center justify-center bg-[#fff1f2] text-[#e11d48]"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="grid items-center px-4 py-3.5 border-t border-[#f4f0fb] hover:bg-[#faf8ff]"
      style={{ gridTemplateColumns: "1fr 130px 120px 110px" }}
    >
      <button
        onClick={() => onEdit(sub)}
        className="flex items-center gap-3 text-right min-w-0"
        aria-label={`ערוך את ${sub.name}`}
      >
        <Avatar sub={sub} tint={cat.tint} size="w-11 h-11" radius="rounded-[14px]" fontSize="text-xl" />
        <p className="m-0 text-base font-semibold text-[#1b1033] truncate">{sub.name}</p>
      </button>
      <div>
        <span
          className="text-xs font-semibold rounded-full px-3 py-1.5"
          style={{ color: cat.color, background: cat.tint }}
        >
          {sub.category || "אחר"}
        </span>
      </div>
      <p className="m-0 text-sm font-medium" style={{ color: dateColor }}>
        {dateLabel}
      </p>
      <div className="flex items-center justify-end gap-2">
        <p className="m-0 text-base font-bold text-[#1b1033]" dir="ltr">
          ₪{sub.price}
        </p>
        <button
          onClick={() => onEdit(sub)}
          aria-label={`ערוך את ${sub.name}`}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-[#f6f3ff] text-[#7c3aed]"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDelete(sub.id)}
          aria-label={`מחק את ${sub.name}`}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-[#fff1f2] text-[#e11d48]"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
