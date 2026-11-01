import { useState } from 'react';
import { Info, MapPinned } from 'lucide-react';
import { NetworkMap } from '../components/map/NetworkMap';
import { MapControls } from '../components/map/MapControls';
import { MapLegend } from '../components/map/MapLegend';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useNetwork } from '../context/NetworkContext';

export function MapPage() {
  const network = useNetwork();
  const [layers, setLayers] = useState({ roads: true, locations: true, risk: false, route: true });
  const [search, setSearch] = useState(''); const [fitKey, setFitKey] = useState(0); const [focus, setFocus] = useState(null);
  const [confirm, setConfirm] = useState(false); const [busy, setBusy] = useState(false);
  const road = network.selectedRoad;
  const mutate = async () => { setBusy(true); try { await network.changeRoadStatus(road.id, road.status === 'Closed' ? 'unblock' : 'block'); setConfirm(false); } finally { setBusy(false); } };
  const selectLocation = (location, shouldFocus = false) => { network.setSelectedLocation(location); network.setSelectedRoad(null); if (shouldFocus) setFocus({ location, key: Date.now() }); };
  return <div className="map-page"><div className="simulation-banner"><Info size={16} /> SIMULATED NETWORK · NOT LIVE REAL-WORLD INCIDENT DATA</div><div className="map-workspace"><NetworkMap {...network} layers={layers} fitKey={fitKey} focusLocation={focus?.location} focusKey={focus?.key} onLocationSelect={(location) => selectLocation(location)} onRoadSelect={(selected) => { network.setSelectedRoad(selected); network.setSelectedLocation(null); }} /><MapControls layers={layers} onLayerChange={(key, value) => setLayers((current) => ({ ...current, [key]: value }))} onFit={() => setFitKey((key) => key + 1)} locations={network.locations} search={search} setSearch={setSearch} onPick={(location) => selectLocation(location, true)} /><MapLegend /><aside className="map-detail-panel">{network.selectedLocation ? <><p className="eyebrow">SELECTED LOCATION</p><h2>{network.selectedLocation.name}</h2><dl><dt>ID</dt><dd>{network.selectedLocation.id}</dd><dt>Type</dt><dd>{network.selectedLocation.type}</dd><dt>Capacity</dt><dd>{network.selectedLocation.capacity}</dd><dt>Coordinates</dt><dd>{network.selectedLocation.latitude.toFixed(4)}, {network.selectedLocation.longitude.toFixed(4)}</dd></dl></> : road ? <><p className="eyebrow">SELECTED ROAD</p><h2>{road.id}</h2><dl><dt>Direction</dt><dd>{road.source} → {road.destination}</dd><dt>Status</dt><dd>{road.status}</dd><dt>Risk</dt><dd>{road.risk}</dd><dt>Condition</dt><dd>{road.roadCondition}</dd></dl><button className={`button ${road.status === 'Closed' ? 'button-primary' : 'button-danger'}`} onClick={() => setConfirm(true)}>{road.status === 'Closed' ? 'Unblock road' : 'Block road'}</button></> : <div className="empty-panel"><MapPinned size={25} /><p>Inspect the network</p><small>Clusters keep the overview readable. Search or zoom in to inspect a location.</small></div>}</aside></div><ConfirmDialog open={confirm} busy={busy} title={`${road?.status === 'Closed' ? 'Unblock' : 'Block'} ${road?.id}?`} detail="This changes live in the C++ worker for the current backend session." confirmLabel={road?.status === 'Closed' ? 'Unblock road' : 'Block road'} onCancel={() => setConfirm(false)} onConfirm={mutate} /></div>;
}
