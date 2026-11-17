import { useEffect, useMemo, useRef, useState } from 'react';
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import { riskColors, riskRank, statusColors } from '../../utils/network';

const DEHRADUN_CENTER = [30.3165, 78.0322];

function isValidPolyline(coordinates) {
  return Array.isArray(coordinates) && coordinates.length >= 2 && coordinates.every((point) =>
    Array.isArray(point) && point.length === 2 && Number.isFinite(point[0]) && Number.isFinite(point[1])
  );
}

function squaredDistance(first, second) {
  return (first[0] - second[0]) ** 2 + (first[1] - second[1]) ** 2;
}

// The graph direction remains authoritative. This only aligns the supplied
// coordinate ordering with its directed source/destination endpoints.
function orientGeometry(coordinates, source, destination) {
  if (!isValidPolyline(coordinates) || !source || !destination) return coordinates;
  const sourcePoint = [source.latitude, source.longitude];
  const destinationPoint = [destination.latitude, destination.longitude];
  const forward = squaredDistance(coordinates[0], sourcePoint) + squaredDistance(coordinates.at(-1), destinationPoint);
  const reverse = squaredDistance(coordinates[0], destinationPoint) + squaredDistance(coordinates.at(-1), sourcePoint);
  return reverse < forward ? [...coordinates].reverse() : coordinates;
}

function FitNetwork({ locations, fitKey }) {
  const map = useMap();
  const lastFitKey = useRef();
  useEffect(() => {
    if (!locations.length || lastFitKey.current === fitKey) return;
    map.fitBounds(locations.map((location) => [location.latitude, location.longitude]), { padding: [54, 54], maxZoom: 11 });
    lastFitKey.current = fitKey;
  }, [map, locations, fitKey]);
  return null;
}

function FocusLocation({ location, focusKey }) {
  const map = useMap();
  useEffect(() => {
    if (location) map.flyTo([location.latitude, location.longitude], Math.max(map.getZoom(), 10), { duration: 0.55 });
  }, [map, location, focusKey]);
  return null;
}

function ZoomObserver({ onZoomChange }) {
  const map = useMapEvents({ zoomend: () => onZoomChange(map.getZoom()) });
  useEffect(() => onZoomChange(map.getZoom()), [map, onZoomChange]);
  return null;
}

function locationRisks(locations, risks) {
  const values = new Map(locations.map((location) => [location.id, 'Low']));
  for (const risk of risks) {
    for (const id of [risk.source, risk.destination]) {
      const current = values.get(id) || 'Low';
      if ((riskRank[risk.risk] || 0) > (riskRank[current] || 0)) values.set(id, risk.risk);
    }
  }
  return values;
}

function clusterLocations(locations, risks, gridSize) {
  const groups = new Map();
  for (const location of locations) {
    const key = `${Math.floor(location.latitude / gridSize)}:${Math.floor(location.longitude / gridSize)}`;
    const group = groups.get(key) || { locations: [], latitude: 0, longitude: 0, risk: 'Low' };
    group.locations.push(location);
    group.latitude += location.latitude;
    group.longitude += location.longitude;
    const risk = risks.get(location.id) || 'Low';
    if ((riskRank[risk] || 0) > (riskRank[group.risk] || 0)) group.risk = risk;
    groups.set(key, group);
  }
  return [...groups.values()].map((group) => ({ ...group, latitude: group.latitude / group.locations.length, longitude: group.longitude / group.locations.length }));
}

function routeLocations(route, locationsById) {
  return (route?.locationIds || []).map((id) => locationsById.get(id)).filter(Boolean);
}

function routeSegments(route, locationsById, geometryByRoadId) {
  const breakdown = route?.breakdown?.length ? route.breakdown : (route?.roadIds || []).map((roadId, index) => ({
    roadId, source: route?.locationIds?.[index], destination: route?.locationIds?.[index + 1]
  }));
  return breakdown.map((segment) => {
    const source = locationsById.get(segment.source);
    const destination = locationsById.get(segment.destination);
    const geometry = geometryByRoadId.get(segment.roadId);
    if (isValidPolyline(geometry)) return { ...segment, positions: orientGeometry(geometry, source, destination), hasGeometry: true };
    // This intentional fallback stays within one directed route segment; it never joins unrelated roads.
    if (!source || !destination) return null;
    return { ...segment, positions: [[source.latitude, source.longitude], [destination.latitude, destination.longitude]], hasGeometry: false };
  }).filter(Boolean);
}

function LocationLayer({ locations, riskByLocation, selectedLocation, onLocationSelect, zoom }) {
  const map = useMap();
  const clustered = zoom < 9;
  const gridSize = zoom < 7 ? 0.58 : zoom < 8 ? 0.36 : 0.2;
  const clusters = useMemo(() => clustered ? clusterLocations(locations, riskByLocation, gridSize) : [], [clustered, gridSize, locations, riskByLocation]);
  if (clustered) return clusters.map((cluster) => {
    const count = cluster.locations.length;
    const bounds = cluster.locations.map((location) => [location.latitude, location.longitude]);
    return <CircleMarker key={`${cluster.latitude}:${cluster.longitude}`} center={[cluster.latitude, cluster.longitude]} radius={Math.min(15, 6 + Math.sqrt(count) * 1.65)}
      pathOptions={{ color: '#fffdf6', weight: 1.5, fillColor: riskColors[cluster.risk], fillOpacity: 0.9 }} eventHandlers={{ click: () => map.fitBounds(bounds, { padding: [46, 46], maxZoom: 10 }) }}>
      <Tooltip permanent direction="center" className="cluster-count">{count}</Tooltip>
      <Popup><strong>{count} locations</strong><br />Highest connected risk: {cluster.risk}<br />Zoom in to inspect individual locations.</Popup>
    </CircleMarker>;
  });
  return locations.map((location) => {
    const risk = riskByLocation.get(location.id) || 'Low';
    const selected = selectedLocation?.id === location.id;
    return <CircleMarker key={location.id} center={[location.latitude, location.longitude]} radius={selected ? 7 : risk === 'Critical' ? 4.8 : 3.7}
      pathOptions={{ color: selected ? '#151515' : '#fffdf6', weight: selected ? 2.5 : 1, fillColor: riskColors[risk], fillOpacity: 0.92 }} eventHandlers={{ click: () => onLocationSelect(location) }}>
      <Popup><strong>{location.name}</strong><br />{location.id} · {location.type}<br />Capacity: {location.capacity}<br />Connected risk: {risk}<br />Coordinates: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</Popup>
    </CircleMarker>;
  });
}

function EmergencyLayer({ emergencies, locationsById, onEmergencySelect, selectedEmergency }) {
  return emergencies.map((emergency) => {
    const location = locationsById.get(emergency.locationId);
    if (!location) return null;
    const color = riskColors[emergency.severity] || '#e14949';
    const selected = selectedEmergency?.emergencyId === emergency.emergencyId;
    return <span key={`emergency-${emergency.emergencyId}`}>
      <CircleMarker center={[location.latitude, location.longitude]} radius={selected ? 16 : emergency.severity === 'Critical' ? 13 : 10} interactive={false}
        pathOptions={{ color, weight: selected ? 2.5 : 1.5, fillColor: color, fillOpacity: selected ? 0.35 : 0.2, dashArray: emergency.severity === 'Critical' ? '3 3' : undefined }} />
      <CircleMarker center={[location.latitude, location.longitude]} radius={selected ? 8 : emergency.severity === 'Critical' ? 6.5 : 5.5}
        pathOptions={{ color: '#151515', weight: selected ? 3 : 2, fillColor: color, fillOpacity: 1 }} eventHandlers={{ click: () => onEmergencySelect?.(emergency) }}>
        <Tooltip direction="top" className="route-tooltip">SIMULATED INCIDENT · {emergency.emergencyId} · {emergency.severity}</Tooltip>
        <Popup><strong>SIMULATED INCIDENT</strong><br />{emergency.title}<br />{emergency.emergencyId} · {emergency.type}<br />{emergency.severity} · {emergency.status}</Popup>
      </CircleMarker>
    </span>;
  });
}

function ResourceLayer({ resources, locationsById }) {
  return resources.map((resource) => {
    const location = locationsById.get(resource.locationId);
    if (!location) return null;
    return <span key={`resource-${resource.resourceId}`}>
      <CircleMarker center={[location.latitude, location.longitude]} radius={8} interactive={false} pathOptions={{ color: '#155e75', weight: 1.5, fillColor: '#67e8f9', fillOpacity: 0.28 }} />
      <CircleMarker center={[location.latitude, location.longitude]} radius={3.8} pathOptions={{ color: '#083344', weight: 1.5, fillColor: '#67e8f9', fillOpacity: 1 }}>
        <Tooltip direction="top" className="route-tooltip">SIMULATED RESOURCE · {resource.resourceId}</Tooltip>
        <Popup><strong>SIMULATED RESOURCE</strong><br />{resource.resourceId} · {resource.type}<br />{resource.status}<br />{location.name}</Popup>
      </CircleMarker>
    </span>;
  });
}

function RouteLayer({ locations, segments, route }) {
  if (!segments.length) return null;
  return <>
    {segments.map((segment) => <span key={`route-${segment.roadId}`}>
      <Polyline positions={segment.positions} pathOptions={{ color: '#fffdf6', weight: 7, opacity: 0.92 }} />
      <Polyline positions={segment.positions} pathOptions={{ color: '#161616', weight: 3.2, opacity: 1, dashArray: '10 5' }}>
        <Tooltip sticky className="route-tooltip">{segment.roadId} · C++ route · total cost {route.totalCost}{segment.hasGeometry ? '' : ' · endpoint fallback'}</Tooltip>
      </Polyline>
    </span>)}
    {locations.map((location, index) => {
      const endpoint = index === 0 || index === locations.length - 1;
      const fillColor = index === 0 ? '#3f9a66' : index === locations.length - 1 ? '#df4a46' : '#e7ee1e';
      const label = index === 0 ? 'Start' : index === locations.length - 1 ? 'Destination' : `Waypoint ${index}`;
      return <CircleMarker key={`${location.id}:${label}`} center={[location.latitude, location.longitude]} radius={endpoint ? 7.5 : 4.7} pathOptions={{ color: '#151515', weight: 2, fillColor, fillOpacity: 1 }}><Tooltip direction="top">{label} · {location.id}</Tooltip></CircleMarker>;
    })}
  </>;
}

export function NetworkMap({
  locations, roads, risks, emergencies = [], resources = [], roadGeometries = [], geometryReady = false, geometryError = null,
  route, selectedLocation, selectedRoad, selectedEmergency, onLocationSelect, onRoadSelect, onEmergencySelect, layers, fitKey, focusLocation, focusKey
}) {
  const [zoom, setZoom] = useState(7);
  const locationsById = useMemo(() => new Map(locations.map((item) => [item.id, item])), [locations]);
  const geometryByRoadId = useMemo(() => new Map(roadGeometries.map(({ roadId, coordinates }) => [roadId, coordinates])), [roadGeometries]);
  const riskByLocation = useMemo(() => locationRisks(locations, risks), [locations, risks]);
  const displayedRouteLocations = useMemo(() => routeLocations(route, locationsById), [route, locationsById]);
  const displayedRouteSegments = useMemo(() => routeSegments(route, locationsById, geometryByRoadId), [route, locationsById, geometryByRoadId]);
  const routeRoadIds = useMemo(() => new Set(route?.roadIds || route?.breakdown?.map((segment) => segment.roadId) || []), [route]);
  const roadLines = useMemo(() => roads.map((road) => {
    const source = locationsById.get(road.source);
    const destination = locationsById.get(road.destination);
    const geometry = geometryByRoadId.get(road.id);
    if (isValidPolyline(geometry)) return { road, positions: orientGeometry(geometry, source, destination), hasGeometry: true };
    if (!source || !destination) return null;
    return { road, positions: [[source.latitude, source.longitude], [destination.latitude, destination.longitude]], hasGeometry: false };
  }).filter(Boolean), [roads, locationsById, geometryByRoadId]);
  const roadOpacity = zoom < 7 ? 0.12 : zoom < 8 ? 0.2 : 0.32;

  return <MapContainer center={DEHRADUN_CENTER} zoom={9} className="network-map" scrollWheelZoom>
    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <FitNetwork locations={locations} fitKey={fitKey} />
    <FocusLocation location={focusLocation} focusKey={focusKey} />
    <ZoomObserver onZoomChange={setZoom} />
    {layers.roads && (geometryReady || geometryError) && roadLines.filter(({ road }) => !(layers.route && routeRoadIds.has(road.id))).map(({ road, positions, hasGeometry }) => {
      const selected = selectedRoad?.id === road.id;
      return <Polyline key={road.id} positions={positions} pathOptions={{ color: statusColors[road.status] || '#747474', weight: selected ? 4 : zoom < 8 ? 0.65 : 1.1, opacity: selected ? 0.95 : roadOpacity, dashArray: road.status === 'Restricted' ? '4 6' : road.status === 'Closed' ? '1 7' : undefined, lineCap: 'round' }} eventHandlers={{ click: () => onRoadSelect?.(road) }}>
        <Tooltip sticky><strong>{road.id}</strong><br />{road.status} · {road.roadCondition}<br />{road.source} → {road.destination}{hasGeometry ? '' : <><br />Geometry unavailable: endpoint fallback</>}</Tooltip>
      </Polyline>;
    })}
    {layers.risk && zoom >= 8 && locations.filter((location) => ['High', 'Critical'].includes(riskByLocation.get(location.id))).map((location) => {
      const risk = riskByLocation.get(location.id);
      return <CircleMarker key={`risk:${location.id}`} center={[location.latitude, location.longitude]} radius={risk === 'Critical' ? 10 : 7} interactive={false} pathOptions={{ color: riskColors[risk], weight: 1, fillColor: riskColors[risk], fillOpacity: 0.1, opacity: 0.62 }} />;
    })}
    {layers.locations && <LocationLayer locations={locations} riskByLocation={riskByLocation} selectedLocation={selectedLocation} onLocationSelect={onLocationSelect} zoom={zoom} />}
    {layers.emergencies && <EmergencyLayer emergencies={emergencies} locationsById={locationsById} onEmergencySelect={onEmergencySelect} selectedEmergency={selectedEmergency} />}
    {layers.resources && <ResourceLayer resources={resources} locationsById={locationsById} />}
    {layers.route && (geometryReady || geometryError) && <RouteLayer locations={displayedRouteLocations} segments={displayedRouteSegments} route={route} />}
  </MapContainer>;
}
