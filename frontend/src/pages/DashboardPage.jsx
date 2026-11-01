import { Activity, AlertTriangle, Map, Network, Route } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MetricCard } from '../components/dashboard/MetricCard';
import { RiskDistribution } from '../components/dashboard/RiskDistribution';
import { useNetwork } from '../context/NetworkContext';
import { formatNumber, networkMetrics } from '../utils/network';

export function DashboardPage() {
  const { locations, roads, risks, health, loading } = useNetwork();
  const metrics = networkMetrics(locations, roads, risks);
  const conditions = ['Good', 'Fair', 'Poor', 'Damaged'].map((condition) => [condition, roads.filter((road) => road.roadCondition === condition).length]);
  return <div className="dashboard-page"><section className="hero-band"><div><p className="eyebrow">DISASTERX / PHASE 3.4</p><h2>Operational clarity<br /><em>under pressure.</em></h2><p className="hero-copy">A local command surface for a simulated disaster network. Every route, risk, and road state below comes from the C++ decision engine.</p></div><div className="hero-actions"><Link className="button button-primary" to="/map"><Map size={17} />Open live map</Link><Link className="button button-dark" to="/routes"><Route size={17} />Plan a route</Link></div><span className="hero-code">DX//SIM-03</span></section>
    <section className="metric-grid" aria-label="Network metrics"><MetricCard label="Total locations" value={formatNumber(metrics.totalLocations)} detail="Graph vertices loaded" icon={Map} /><MetricCard label="Total roads" value={formatNumber(metrics.totalRoads)} detail="Directed network edges" icon={Network} accent="dark" /><MetricCard label="High-risk roads" value={formatNumber(metrics.highRiskRoads)} detail="High + critical ML predictions" icon={AlertTriangle} accent="red" /><MetricCard label="Network available" value={`${metrics.available}%`} detail={`${formatNumber(metrics.blockedRoads)} roads currently closed`} icon={Activity} accent="green" /></section>
    <section className="dashboard-grid"><RiskDistribution risks={risks} /><section className="panel network-summary"><div className="panel-heading"><div><p className="eyebrow">NETWORK OVERVIEW</p><h2>Road conditions</h2></div><span className={health?.ready ? 'live-dot' : 'offline-dot'}>{health?.ready ? 'WORKER READY' : 'WORKER OFFLINE'}</span></div><div className="condition-list">{conditions.map(([condition, count]) => <div key={condition}><span>{condition}</span><b>{formatNumber(count)}</b></div>)}</div><div className="network-note"><span>SIMULATED NETWORK</span><p>{loading ? 'Refreshing operational snapshot…' : `${metrics.restrictedRoads} restricted roads are still routable with the configured C++ penalty.`}</p></div></section></section>
    <section className="event-strip"><span className="eyebrow">DATA SOURCE</span><p>Current view is generated from the local C++ worker and prediction CSV. External incidents, emergencies, and live traffic are not represented.</p></section>
  </div>;
}
