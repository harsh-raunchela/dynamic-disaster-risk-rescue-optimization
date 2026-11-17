import { AlertCircle, CheckCircle2, Flame, ShieldAlert } from 'lucide-react';
import { formatNumber } from '../../utils/network';

export function EmergencyStats({ emergencies }) {
  const total = emergencies.length;
  const resolved = emergencies.filter((e) => e.status === 'Resolved').length;
  const active = total - resolved;
  const critical = emergencies.filter((e) => e.status !== 'Resolved' && e.severity === 'Critical').length;

  return (
    <div className="metric-grid">
      <article className="metric-card metric-dark">
        <div className="metric-card-top">
          <span>TOTAL INCIDENTS</span>
          <ShieldAlert size={15} />
        </div>
        <strong>{formatNumber(total)}</strong>
        <small>Recorded simulated incidents</small>
      </article>

      <article className="metric-card">
        <div className="metric-card-top">
          <span>ACTIVE QUEUE</span>
          <AlertCircle size={15} />
        </div>
        <strong>{formatNumber(active)}</strong>
        <small>Pending, prioritized & responding</small>
      </article>

      <article className="metric-card metric-red">
        <div className="metric-card-top">
          <span>CRITICAL SEVERITY</span>
          <Flame size={15} />
        </div>
        <strong>{formatNumber(critical)}</strong>
        <small>Highest priority escalation</small>
      </article>

      <article className="metric-card metric-green">
        <div className="metric-card-top">
          <span>RESOLVED</span>
          <CheckCircle2 size={15} />
        </div>
        <strong>{formatNumber(resolved)}</strong>
        <small>Completed emergency operations</small>
      </article>
    </div>
  );
}

