import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { useNetwork } from '../../context/NetworkContext';

export function Toast() {
  const { toast } = useNetwork();
  if (!toast) return null;
  const isError = toast.type === 'error';
  return (
    <div className={`toast ${isError ? 'toast-error' : ''}`} role="status">
      {isError ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
      <span>{toast.message}</span><X size={16} aria-hidden="true" />
    </div>
  );
}
