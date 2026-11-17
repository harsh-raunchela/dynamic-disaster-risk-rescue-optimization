import { Boxes, CheckCircle, Package, RotateCcw, Truck, Wrench } from 'lucide-react';
import { formatNumber } from '../../utils/network';

export function ResourceStats({ resources }) {
  const total = resources.length;
  const available = resources.filter((r) => r.status === 'Available').length;
  const allocated = resources.filter((r) => r.status === 'Allocated').length;
  const operational = resources.filter((r) =>
    ['Dispatched', 'En Route', 'On Scene'].includes(r.status)
  ).length;
  const returning = resources.filter((r) => r.status === 'Returning').length;
  const maintenance = resources.filter((r) => r.status === 'Maintenance').length;

  return (
    <div className="metric-grid">
      <article className="metric-card metric-dark">
        <div className="metric-card-top">
          <span>TOTAL RESOURCES</span>
          <Package size={15} />
        </div>
        <strong>{formatNumber(total)}</strong>
        <small>All registered resources</small>
      </article>

      <article className="metric-card metric-green">
        <div className="metric-card-top">
          <span>AVAILABLE</span>
          <CheckCircle size={15} />
        </div>
        <strong>{formatNumber(available)}</strong>
        <small>Ready for dispatch</small>
      </article>

      <article className="metric-card">
        <div className="metric-card-top">
          <span>ALLOCATED</span>
          <Boxes size={15} />
        </div>
        <strong>{formatNumber(allocated)}</strong>
        <small>Assigned to incidents</small>
      </article>

      <article className="metric-card metric-red">
        <div className="metric-card-top">
          <span>OPERATIONAL</span>
          <Truck size={15} />
        </div>
        <strong>{formatNumber(operational)}</strong>
        <small>Dispatched, en route &amp; on scene</small>
      </article>

      <article className="metric-card">
        <div className="metric-card-top">
          <span>RETURNING</span>
          <RotateCcw size={15} />
        </div>
        <strong>{formatNumber(returning)}</strong>
        <small>Returning to base</small>
      </article>

      <article className="metric-card metric-dark">
        <div className="metric-card-top">
          <span>MAINTENANCE</span>
          <Wrench size={15} />
        </div>
        <strong>{formatNumber(maintenance)}</strong>
        <small>Under service or repair</small>
      </article>
    </div>
  );
}
