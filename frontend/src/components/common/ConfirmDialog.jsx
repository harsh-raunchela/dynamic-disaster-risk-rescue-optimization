import { AlertTriangle, X } from 'lucide-react';

export function ConfirmDialog({ open, title, detail, confirmLabel, busy, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <button className="dialog-close" onClick={onCancel} aria-label="Cancel"><X size={18} /></button>
        <div className="dialog-icon"><AlertTriangle size={22} /></div>
        <p className="eyebrow">Network mutation</p>
        <h2 id="confirm-title">{title}</h2>
        <p>{detail}</p>
        <div className="dialog-actions">
          <button className="button button-quiet" onClick={onCancel} disabled={busy}>Cancel</button>
          <button className="button button-danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Applying…' : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
