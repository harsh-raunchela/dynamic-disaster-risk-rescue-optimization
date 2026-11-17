import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ExternalLink, Info, MapPinned, Siren } from 'lucide-react';
import { NetworkMap } from '../components/map/NetworkMap';
import { MapControls } from '../components/map/MapControls';
import { MapLegend } from '../components/map/MapLegend';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useNetwork } from '../context/NetworkContext';

export function MapPage() {
  const network = useNetwork();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [layers, setLayers] = useState({
    emergencies: true,
    resources: true,
    roads: true,
    locations: true,
    risk: false,
    route: true
  });
  const [emergencySeverityFilter, setEmergencySeverityFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [fitKey, setFitKey] = useState(0);
  const [focus, setFocus] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  const road = network.selectedRoad;
  const emergency = network.selectedEmergency;
  const missingGeometryCount = useMemo(() => {
    if (!network.geometryReady) return 0;
    const available = new Set(network.roadGeometries.map((geometry) => geometry.roadId));
    return network.roads.filter((item) => !available.has(item.id)).length;
  }, [network.geometryReady, network.roadGeometries, network.roads]);

  // React to URL search params (e.g. from Emergency Management "Inspect on Map")
  useEffect(() => {
    const locId = searchParams.get('locationId');
    const emgId = searchParams.get('emergencyId');

    if (locId && network.locations.length > 0) {
      const targetLoc = network.locations.find((l) => l.id === locId);
      if (targetLoc) {
        network.setSelectedLocation(targetLoc);
        network.setSelectedRoad(null);
        setFocus({ location: targetLoc, key: Date.now() });
      }
    }

    if (emgId && network.emergencies.length > 0) {
      const targetEmg = network.emergencies.find((e) => e.emergencyId === emgId);
      if (targetEmg) {
        network.setSelectedEmergency(targetEmg);
      }
    }
  }, [searchParams, network.locations, network.emergencies]);

  const filteredEmergencies = useMemo(() => {
    let list = network.emergencies || [];
    if (emergencySeverityFilter === 'Critical') {
      list = list.filter((e) => e.severity === 'Critical');
    } else if (emergencySeverityFilter === 'High') {
      list = list.filter((e) => e.severity === 'Critical' || e.severity === 'High');
    } else if (emergencySeverityFilter === 'Active') {
      list = list.filter((e) => e.status !== 'Resolved');
    }
    return list;
  }, [network.emergencies, emergencySeverityFilter]);

  const mutate = async () => {
    setBusy(true);
    try {
      await network.changeRoadStatus(road.id, road.status === 'Closed' ? 'unblock' : 'block');
      setConfirm(false);
    } finally {
      setBusy(false);
    }
  };

  const selectLocation = (location, shouldFocus = false) => {
    network.setSelectedLocation(location);
    network.setSelectedRoad(null);
    network.setSelectedEmergency(null);
    if (shouldFocus) setFocus({ location, key: Date.now() });
  };

  const selectEmergency = (emg) => {
    network.setSelectedEmergency(emg);
    network.setSelectedRoad(null);
    const loc = network.locations.find((l) => l.id === emg.locationId);
    if (loc) {
      network.setSelectedLocation(loc);
      setFocus({ location: loc, key: Date.now() });
    }
  };

  return (
    <div className="map-page">
      <div className="simulation-banner">
        <Info size={16} /> REAL ROAD NETWORK · SIMULATED EMERGENCIES AND RESOURCES · NOT LIVE REAL-WORLD INCIDENT DATA
      </div>
      {network.geometryError && <div className="geometry-warning"><Info size={15} /> Road geometry is unavailable: {network.geometryError}. Per-road endpoint fallbacks are shown.</div>}
      {network.geometryReady && missingGeometryCount > 0 && <div className="geometry-warning"><Info size={15} /> {missingGeometryCount} road geometries are missing; only those roads use endpoint fallbacks.</div>}

      <div className="map-workspace">
        <NetworkMap
          {...network}
          emergencies={filteredEmergencies}
          layers={layers}
          fitKey={fitKey}
          focusLocation={focus?.location}
          focusKey={focus?.key}
          onLocationSelect={(location) => selectLocation(location)}
          onRoadSelect={(selected) => {
            network.setSelectedRoad(selected);
            network.setSelectedLocation(null);
            network.setSelectedEmergency(null);
          }}
          onEmergencySelect={(emg) => selectEmergency(emg)}
        />

        <div className="map-overlay-rail">
          <MapControls
            layers={layers}
            onLayerChange={(key, value) => setLayers((current) => ({ ...current, [key]: value }))}
            onFit={() => setFitKey((key) => key + 1)}
            locations={network.locations}
            roadCount={network.roads.length}
            search={search}
            setSearch={setSearch}
            onPick={(location) => selectLocation(location, true)}
            emergencySeverityFilter={emergencySeverityFilter}
            onSeverityFilterChange={setEmergencySeverityFilter}
          />
          <MapLegend />
        </div>

        <aside className="map-detail-panel">
          {emergency ? (
            <>
              <p className="eyebrow" style={{ color: '#e7594b' }}>
                SIMULATED EMERGENCY INCIDENT
              </p>
              <h2>{emergency.title}</h2>
              <dl>
                <dt>Incident ID</dt>
                <dd className="font-mono">{emergency.emergencyId}</dd>
                <dt>Type</dt>
                <dd>{emergency.type}</dd>
                <dt>Severity</dt>
                <dd className="font-bold">{emergency.severity}</dd>
                <dt>Status</dt>
                <dd>{emergency.status}</dd>
                <dt>Location</dt>
                <dd>{emergency.locationId}</dd>
                <dt>Affected</dt>
                <dd>{emergency.peopleAffected} people</dd>
                {emergency.priority && (
                  <>
                    <dt>Priority</dt>
                    <dd>Queue #{emergency.priority}</dd>
                  </>
                )}
              </dl>
              <button
                type="button"
                className="button button-primary"
                style={{ width: '100%', marginTop: '10px' }}
                onClick={() => navigate('/emergencies')}
              >
                <ExternalLink size={14} />
                <span>Open Emergency Control</span>
              </button>
            </>
          ) : network.selectedLocation ? (
            <>
              <p className="eyebrow">SELECTED LOCATION</p>
              <h2>{network.selectedLocation.name}</h2>
              <dl>
                <dt>ID</dt>
                <dd>{network.selectedLocation.id}</dd>
                <dt>Type</dt>
                <dd>{network.selectedLocation.type}</dd>
                <dt>Capacity</dt>
                <dd>{network.selectedLocation.capacity}</dd>
                <dt>Coordinates</dt>
                <dd>
                  {network.selectedLocation.latitude.toFixed(4)},{' '}
                  {network.selectedLocation.longitude.toFixed(4)}
                </dd>
              </dl>
            </>
          ) : road ? (
            <>
              <p className="eyebrow">SELECTED ROAD</p>
              <h2>{road.id}</h2>
              <dl>
                <dt>Direction</dt>
                <dd>{road.source} → {road.destination}</dd>
                <dt>Status</dt>
                <dd>{road.status}</dd>
                <dt>Risk</dt>
                <dd>{road.risk}</dd>
                <dt>Condition</dt>
                <dd>{road.roadCondition}</dd>
              </dl>
              <button
                className={`button ${road.status === 'Closed' ? 'button-primary' : 'button-danger'}`}
                onClick={() => setConfirm(true)}
              >
                {road.status === 'Closed' ? 'Unblock road' : 'Block road'}
              </button>
            </>
          ) : (
            <div className="empty-panel">
              <MapPinned size={25} />
              <p>Inspect the network</p>
              <small>
                Click any emergency beacon, location cluster, or road to view live details.
              </small>
            </div>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={confirm}
        busy={busy}
        title={`${road?.status === 'Closed' ? 'Unblock' : 'Block'} ${road?.id}?`}
        detail="This changes live in the C++ worker for the current backend session."
        confirmLabel={road?.status === 'Closed' ? 'Unblock road' : 'Block road'}
        onCancel={() => setConfirm(false)}
        onConfirm={mutate}
      />
    </div>
  );
}
