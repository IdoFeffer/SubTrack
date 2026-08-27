import { Plus } from "lucide-react";
import "./EmptyState.css";

export default function EmptyState({ onAdd }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">📦</div>
      <p className="empty-state__text">עוד לא הוספת מנויים</p>
      <button onClick={onAdd} className="empty-state__button">
        <Plus size={16} />
        מנוי חדש
      </button>
    </div>
  );
}
