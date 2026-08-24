import { Upload, X } from "lucide-react";
import { CATEGORY_OPTIONS, ICON_OPTIONS, categoryColor, fileToDataUrl } from "../lib/subscriptions";

export default function FormFields({ form, setForm, errors }) {
  return (
    <>
      <div>
        <label className="block text-xs font-semibold mb-2 text-[#6b5b8a]">תמונה</label>
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 rounded-[13px] flex items-center justify-center text-lg overflow-hidden shrink-0 bg-[#faf8ff] border-2 border-[#ece7f7]">
            {form.image ? (
              <img src={form.image} alt="" className="w-full h-full object-cover" />
            ) : (
              form.icon
            )}
          </div>
          <label className="flex items-center gap-1.5 text-sm rounded-xl px-3.5 py-2.5 cursor-pointer border-[1.5px] border-[#ddd3f7] text-[#4c1d95] bg-white">
            <Upload size={14} />
            העלה תמונה
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const dataUrl = await fileToDataUrl(file);
                setForm({ ...form, image: dataUrl });
                e.target.value = "";
              }}
            />
          </label>
          {form.image && (
            <button
              type="button"
              onClick={() => setForm({ ...form, image: null })}
              aria-label="הסר תמונה"
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#e11d48]"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-2 text-[#6b5b8a]">אייקון</label>
        <div className="flex flex-wrap gap-1.5">
          {ICON_OPTIONS.map((icon) => {
            const selected = form.icon === icon;
            return (
              <button
                key={icon}
                type="button"
                onClick={() => setForm({ ...form, icon })}
                aria-pressed={selected}
                aria-label={`בחר אייקון ${icon}`}
                className={`w-[42px] h-[42px] rounded-[13px] flex items-center justify-center text-lg border-2 ${
                  selected ? "bg-[#f3e8ff] border-[#7c3aed]" : "bg-[#faf8ff] border-[#ece7f7]"
                }`}
              >
                {icon}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-2 text-[#6b5b8a]">קטגוריה</label>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORY_OPTIONS.map((cat) => {
            const c = categoryColor(cat);
            const selected = form.category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setForm({ ...form, category: cat })}
                aria-pressed={selected}
                className="text-xs font-semibold rounded-full px-3 py-1.5"
                style={{
                  color: c.color,
                  background: c.tint,
                  border: selected ? `1.5px solid ${c.color}` : "1.5px solid transparent",
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <Field
        label="שם המנוי"
        placeholder="לדוגמה: Disney+"
        value={form.name}
        onChange={(v) => setForm({ ...form, name: v })}
        error={errors.name}
      />
      <Field
        label="מחיר חודשי (₪)"
        placeholder="45"
        value={form.price}
        onChange={(v) => setForm({ ...form, price: v })}
        error={errors.price}
        dir="ltr"
      />
      <Field
        label="תאריך חידוש הבא"
        type="date"
        value={form.date}
        onChange={(v) => setForm({ ...form, date: v })}
        error={errors.date}
        dir="ltr"
      />
    </>
  );
}

function Field({ label, placeholder, type = "text", value, onChange, error, dir }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5 text-[#6b5b8a]">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        dir={dir}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl px-3.5 py-3 text-sm border-[1.5px] border-[#ddd3f7] bg-[#faf8ff] text-[#1b1033] placeholder:text-[#a99cc4] outline-none focus:border-[#7c3aed] focus:bg-white ${
          dir === "ltr" ? "text-right" : ""
        }`}
      />
      {error && <p className="mt-1 mb-0 text-xs text-[#e11d48]">{error}</p>}
    </div>
  );
}
