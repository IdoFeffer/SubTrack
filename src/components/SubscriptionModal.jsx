import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import FormFields from "./FormFields";
import "./SubscriptionModal.css";

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
    <div className="subscription-modal__scrim" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="subtrack-modal-title"
        className="subscription-modal__dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="subscription-modal__header">
          <p id="subtrack-modal-title" className="subscription-modal__title">
            {isEditing ? "עריכת מנוי" : "מנוי חדש"}
          </p>
          <button onClick={onClose} aria-label="סגור" className="subscription-modal__close">
            <X size={16} />
          </button>
        </div>
        <div className="subscription-modal__body">
          <FormFields form={form} setForm={setForm} errors={errors} />
          {saveError && <p className="subscription-modal__error">{saveError}</p>}
          <div className="subscription-modal__actions">
            <button onClick={onSave} className="subscription-modal__save">
              {isEditing ? "שמור שינויים" : "הוסף מנוי"}
            </button>
            <button onClick={onClose} className="subscription-modal__cancel">
              ביטול
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
