import { Plus } from "lucide-react";

export default function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-14 px-6">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-[#f3e8ff]">📦</div>
      <p className="m-0 text-sm font-medium text-[#6b5b8a]">עוד לא הוספת מנויים</p>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white bg-[linear-gradient(140deg,#7c3aed,#c026d3)]"
      >
        <Plus size={16} />
        מנוי חדש
      </button>
    </div>
  );
}
