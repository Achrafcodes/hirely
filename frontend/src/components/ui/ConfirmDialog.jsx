import { useEffect, useRef } from 'react';

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', danger = true, onConfirm, onCancel }) {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (open) confirmRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />

      {/* Dialog */}
      <div className="relative w-full max-w-sm bg-surface border border-border rounded-lg p-6 shadow-xl animate-fade-in-up">
        <h3 className="text-h3 text-text-primary mb-2">{title}</h3>
        {message && <p className="text-sm text-text-secondary mb-6">{message}</p>}

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md text-sm font-medium text-text-secondary border border-border hover:border-text-disabled hover:text-text-primary transition-all duration-150"
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 active:scale-[0.97] ${
              danger
                ? 'bg-danger/10 border border-danger/30 text-danger hover:bg-danger/20'
                : 'bg-accent hover:bg-accent-hover text-base border border-transparent'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
