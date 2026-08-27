import { Pencil, Trash2 } from "lucide-react";
import { categoryColor, daysUntil, formatDate } from "../lib/subscriptions";
import "./SubscriptionRow.css";

function Avatar({ sub, tint, size }) {
  return (
    <div className={`sub-row-avatar sub-row-avatar--${size}`} style={{ background: tint }}>
      {sub.image ? <img src={sub.image} alt="" /> : sub.icon}
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
      <div className="sub-row-mobile">
        <button onClick={() => onEdit(sub)} className="sub-row-mobile__main" aria-label={`ערוך את ${sub.name}`}>
          <Avatar sub={sub} tint={cat.tint} size="md" />
          <div className="sub-row-mobile__info">
            <p className="sub-row-mobile__name">{sub.name}</p>
            <p className="sub-row-mobile__date" style={{ color: dateColor }}>
              {dateLabel}
            </p>
          </div>
        </button>
        <div className="sub-row-mobile__side">
          <p className="sub-row-mobile__price" dir="ltr">
            ₪{sub.price}
          </p>
          <button onClick={() => onEdit(sub)} aria-label={`ערוך את ${sub.name}`} className="sub-row-mobile__icon-btn">
            <span className="sub-row-icon-btn sub-row-icon-btn--edit">
              <Pencil size={14} />
            </span>
          </button>
          <button onClick={() => onDelete(sub.id)} aria-label={`מחק את ${sub.name}`} className="sub-row-mobile__icon-btn">
            <span className="sub-row-icon-btn sub-row-icon-btn--delete">
              <Trash2 size={15} />
            </span>
          </button>
        </div>
      </div>
    );
  }

  if (variant === "tablet") {
    return (
      <div className="sub-row-tablet">
        <button onClick={() => onEdit(sub)} className="sub-row-tablet__main" aria-label={`ערוך את ${sub.name}`}>
          <Avatar sub={sub} tint={cat.tint} size="lg" />
          <div className="sub-row-tablet__info">
            <p className="sub-row-tablet__name">{sub.name}</p>
            <p className="sub-row-tablet__date" style={{ color: dateColor }}>
              {dateLabel}
            </p>
          </div>
        </button>
        <div className="sub-row-tablet__side">
          <span className="sub-row-category" style={{ color: cat.color, background: cat.tint }}>
            {sub.category || "אחר"}
          </span>
          <p className="sub-row-tablet__price" dir="ltr">
            ₪{sub.price}
          </p>
          <button onClick={() => onEdit(sub)} aria-label={`ערוך את ${sub.name}`} className="sub-row-icon-btn sub-row-icon-btn--edit">
            <Pencil size={15} />
          </button>
          <button onClick={() => onDelete(sub.id)} aria-label={`מחק את ${sub.name}`} className="sub-row-icon-btn sub-row-icon-btn--delete">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sub-row-desktop">
      <button onClick={() => onEdit(sub)} className="sub-row-desktop__main" aria-label={`ערוך את ${sub.name}`}>
        <Avatar sub={sub} tint={cat.tint} size="sm" />
        <p className="sub-row-desktop__name">{sub.name}</p>
      </button>
      <div>
        <span className="sub-row-category" style={{ color: cat.color, background: cat.tint }}>
          {sub.category || "אחר"}
        </span>
      </div>
      <p className="sub-row-desktop__date" style={{ color: dateColor }}>
        {dateLabel}
      </p>
      <div className="sub-row-desktop__side">
        <p className="sub-row-desktop__price" dir="ltr">
          ₪{sub.price}
        </p>
        <button onClick={() => onEdit(sub)} aria-label={`ערוך את ${sub.name}`} className="sub-row-icon-btn sub-row-icon-btn--edit">
          <Pencil size={14} />
        </button>
        <button onClick={() => onDelete(sub.id)} aria-label={`מחק את ${sub.name}`} className="sub-row-icon-btn sub-row-icon-btn--delete">
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
