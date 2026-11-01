import { RoutePlannerForm } from '../components/routes/RoutePlannerForm';
import { RouteResult } from '../components/routes/RouteResult';
import { NetworkMap } from '../components/map/NetworkMap';
import { useNetwork } from '../context/NetworkContext';

export function RoutePlannerPage() {
  const network = useNetwork();
  return <div className="route-page"><section className="route-intro"><p className="eyebrow">RISK-AWARE DECISION ENGINE</p><h2>Route through what the<br /><em>network knows now.</em></h2><p>The route is calculated by the C++ engine using current road state, ML risk category, traffic, and condition penalties.</p></section><div className="route-layout"><aside><RoutePlannerForm locations={network.locations} route={network.route} onPlan={network.planRoute} onClear={() => network.setRoute(null)} /><RouteResult route={network.route} /></aside><div className="route-map"><NetworkMap {...network} layers={{ roads: true, locations: true, risk: true, route: true }} fitKey={network.route?.totalCost || 0} onLocationSelect={network.setSelectedLocation} onRoadSelect={network.setSelectedRoad} /></div></div></div>;
}
