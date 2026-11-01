import { riskColors } from '../../utils/network';

export function RiskDistribution({ risks }) {
  const entries = ['Low', 'Medium', 'High', 'Critical'].map((risk) => [risk, risks.filter((item) => item.risk === risk).length]);
  const max = Math.max(...entries.map(([, count]) => count), 1);
  return <section className="panel chart-panel"><div className="panel-heading"><div><p className="eyebrow">ML OUTPUT</p><h2>Risk distribution</h2></div><span className="data-tag">ROAD PREDICTIONS</span></div><div className="risk-bars">{entries.map(([risk, count]) => <div className="risk-bar-row" key={risk}><span>{risk}</span><div><i style={{ width: `${(count / max) * 100}%`, background: riskColors[risk] }} /></div><b>{count}</b></div>)}</div></section>;
}
