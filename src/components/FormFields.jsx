import { Upload, X } from "lucide-react";
import { CATEGORY_OPTIONS, ICON_OPTIONS, categoryColor, fileToDataUrl } from "../lib/subscriptions";
import "./FormFields.css";

export default function FormFields({ form, setForm, errors }) {
  return (
    <>
      <div>
        <label className="field-label">תמונה</label>
        <div className="field-row">
          <div className="field-image-preview">
            {form.image ? <img src={form.image} alt="" /> : form.icon}
          </div>
          <label className="field-upload-label">
            <Upload size={14} />
            העלה תמונה
            <input
              type="file"
              accept="image/*"
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
              className="field-remove-image"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="field-label">אייקון</label>
        <div className="field-chip-group">
          {ICON_OPTIONS.map((icon) => {
            const selected = form.icon === icon;
            return (
              <button
                key={icon}
                type="button"
                onClick={() => setForm({ ...form, icon })}
                aria-pressed={selected}
                aria-label={`בחר אייקון ${icon}`}
                className={`icon-chip ${selected ? "icon-chip--selected" : ""}`}
              >
                {icon}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="field-label">קטגוריה</label>
        <div className="field-chip-group">
          {CATEGORY_OPTIONS.map((cat) => {
            const c = categoryColor(cat);
            const selected = form.category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setForm({ ...form, category: cat })}
                aria-pressed={selected}
                className="category-chip"
                style={{
                  color: c.color,
                  background: c.tint,
                  borderColor: selected ? c.color : "transparent",
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
      <label className="field-label">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        dir={dir}
        onChange={(e) => onChange(e.target.value)}
        className={`field-input ${dir === "ltr" ? "field-input--ltr" : ""}`}
      />
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
