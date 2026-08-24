import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import FormFields from "./FormFields";

export default function SubscriptionModal({
  open,
  isEditing,
  form,
  setForm,
  errors,
  saveError,
  onClose,
  onSave,
  triggerRef,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const focusable = dialog?.querySelectorAll(
      'button, input, [href], select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.[0]?.focus();

    function handleKey(e) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && focusable && focusable.length > 0) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      triggerRef?.current?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center p-10 rounded-[20px]"
      style={{ background: "rgba(27,16,51,.45)", animation: "subtrack-scrim-in 150ms ease-out" }}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="subtrack-modal-title"
        className="w-[440px] max-w-full bg-white rounded-[22px] overflow-hidden"
        style={{
          boxShadow: "0 40px 80px -30px rgba(27,16,51,.7)",
          animation: "subtrack-dialog-in 180ms ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-6 py-5 text-white"
          style={{ background: "linear-gradient(140deg,#7c3aed,#c026d3)" }}
        >
          <p id="subtrack-modal-title" className="m-0 text-lg font-bold">
            {isEditing ? "עריכת מנוי" : "מנוי חדש"}
          </p>
          <button
            onClick={onClose}
            aria-label="סגור"
            className="w-8 h-8 rounded-full flex items-center justify-center bg-[rgba(255,255,255,.2)]"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
          <FormFields form={form} setForm={setForm} errors={errors} />
          {saveError && <p className="m-0 text-sm font-medium text-[#e11d48]">{saveError}</p>}
          <div className="flex gap-2.5 mt-1">
            <button
              onClick={onSave}
              className="flex-1 rounded-[13px] py-3.5 text-white text-[15px] font-bold"
              style={{ background: "linear-gradient(140deg,#7c3aed,#c026d3)" }}
            >
              {isEditing ? "שמור שינויים" : "הוסף מנוי"}
            </button>
            <button
              onClick={onClose}
              className="rounded-[13px] px-5 py-3.5 text-[15px] font-semibold border-[1.5px] border-[#ddd3f7] text-[#4c1d95]"
            >
              ביטול
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
