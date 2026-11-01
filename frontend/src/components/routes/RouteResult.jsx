import { CircleDollarSign, MapPinned, Network } from 'lucide-react';

export function RouteResult({ route }) {
  if (!route) return <div className="empty-panel"><Network size={25} /><p>No route selected</p><small>Submit an origin and destination to use the C++ route planner.</small></div>;
  return <section className="route-result"><div className="route-result-top"><div><p className="eyebrow">SELECTED ROUTE</p><h2>{route.locationIds.length} locations</h2></div><div className="route-cost"><CircleDollarSign size={18} /><strong>{route.totalCost}</strong><small>total cost</small></div></div><div className="route-sequence">{route.locationIds.map((id, index) => <span key={id}><i>{index + 1}</i>{id}</span>)}</div><div className="route-breakdown"><p className="eyebrow">COST BREAKDOWN</p>{route.breakdown.map((segment) => <div key={segment.roadId} className="breakdown-row"><MapPinned size={15} /><span><strong>{segment.roadId}</strong><small>{segment.source} → {segment.destination}</small></span><b>{segment.totalCost}</b></div>)}</div></section>;
}
