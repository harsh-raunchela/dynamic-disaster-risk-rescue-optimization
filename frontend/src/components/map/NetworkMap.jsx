import { useEffect, useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import { riskColors, riskRank, statusColors } from '../../utils/network';

function FitNetwork({ locations, fitKey }) {
  const map = useMap();
  useEffect(() => {
    const bounds = locations.map((location) => [location.latitude, location.longitude]);
    if (bounds.length) map.fitBounds(bounds, { padding: [54, 54], maxZoom: 8 });
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
  return [...groups.values()].map((group) => ({
    ...group,
    latitude: group.latitude / group.locations.length,
    longitude: group.longitude / group.locations.length
  }));
}

function orderedRoute(route, locationsById) {
  const breakdown = route?.breakdown || [];
  if (breakdown.length) {
    const ids = [breakdown[0].source];
    for (const segment of breakdown) {
      if (ids.at(-1) !== segment.source) return [];
      ids.push(segment.destination);
    }
    return ids.map((id) => locationsById.get(id)).filter(Boolean);
  }
  return (route?.locationIds || []).map((id) => locationsById.get(id)).filter(Boolean);
}

function LocationLayer({ locations, riskByLocation, selectedLocation, onLocationSelect, zoom }) {
  const map = useMap();
  const clustered = zoom < 9;
  const gridSize = zoom < 7 ? 0.58 : zoom < 8 ? 0.36 : 0.2;
  const clusters = useMemo(() => clustered ? clusterLocations(locations, riskByLocation, gridSize) : [], [clustered, gridSize, locations, riskByLocation]);

  if (clustered) return clusters.map((cluster) => {
    const count = cluster.locations.length;
    const bounds = cluster.locations.map((location) => [location.latitude, location.longitude]);
    return <CircleMarker key={`${cluster.latitude}:${cluster.longitude}`} center={[cluster.latitude, cluster.longitude]}
      radius={Math.min(15, 6 + Math.sqrt(count) * 1.65)}
      pathOptions={{ color: '#fffdf6', weight: 1.5, fillColor: riskColors[cluster.risk], fillOpacity: 0.9 }}
      eventHandlers={{ click: () => map.fitBounds(bounds, { padding: [46, 46], maxZoom: 10 }) }}>
      <Tooltip permanent direction="center" className="cluster-count">{count}</Tooltip>
      <Popup><strong>{count} locations</strong><br />Highest connected risk: {cluster.risk}<br />Zoom in to inspect individual locations.</Popup>
    </CircleMarker>;
  });

  return locations.map((location) => {
    const risk = riskByLocation.get(location.id) || 'Low';
    const selected = selectedLocation?.id === location.id;
    return <CircleMarker key={location.id} center={[location.latitude, location.longitude]}
      radius={selected ? 7 : risk === 'Critical' ? 4.8 : 3.7}
      pathOptions={{ color: selected ? '#151515' : '#fffdf6', weight: selected ? 2.5 : 1, fillColor: riskColors[risk], fillOpacity: 0.92 }}
      eventHandlers={{ click: () => onLocationSelect(location) }}>
      <Popup><strong>{location.name}</strong><br />{location.id} · {location.type}<br />Capacity: {location.capacity}<br />Connected risk: {risk}<br />Synthetic coordinates: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</Popup>
    </CircleMarker>;
  });
}

function RouteLayer({ routeLocations, route }) {
  if (routeLocations.length < 2) return null;
  const positions = routeLocations.map((location) => [location.latitude, location.longitude]);
  return <>
    <Polyline positions={positions} pathOptions={{ color: '#fffdf6', weight: 7, opacity: 0.92 }} />
    <Polyline positions={positions} pathOptions={{ color: '#161616', weight: 3.2, opacity: 1, dashArray: '10 5' }}>
      <Tooltip sticky className="route-tooltip">C++ route · total cost {route.totalCost}</Tooltip>
    </Polyline>
    {routeLocations.map((location, index) => {
      const endpoint = index === 0 || index === routeLocations.length - 1;
      const fillColor = index === 0 ? '#3f9a66' : index === routeLocations.length - 1 ? '#df4a46' : '#e7ee1e';
      const label = index === 0 ? 'Start' : index === routeLocations.length - 1 ? 'Destination' : `Waypoint ${index}`;
      return <CircleMarker key={`${location.id}:${label}`} center={[location.latitude, location.longitude]}
        radius={endpoint ? 7.5 : 4.7} pathOptions={{ color: '#151515', weight: 2, fillColor, fillOpacity: 1 }}>
        <Tooltip direction="top">{label} · {location.id}</Tooltip>
      </CircleMarker>;
    })}
  </>;
}

export function NetworkMap({
  locations, roads, risks, route, selectedLocation, selectedRoad,
  onLocationSelect, onRoadSelect, layers, fitKey, focusLocation, focusKey
}) {
  const [zoom, setZoom] = useState(7);
  const locationsById = useMemo(() => new Map(locations.map((item) => [item.id, item])), [locations]);
  const riskByLocation = useMemo(() => locationRisks(locations, risks), [locations, risks]);
  const routeLocations = useMemo(() => orderedRoute(route, locationsById), [route, locationsById]);
  const routeRoadIds = useMemo(() => new Set(route?.roadIds || route?.breakdown?.map((segment) => segment.roadId) || []), [route]);
  const center = locations.length ? [locations[0].latitude, locations[0].longitude] : [28.6, 78.8];
  const roadOpacity = zoom < 7 ? 0.12 : zoom < 8 ? 0.2 : 0.32;

  return <MapContainer center={center} zoom={7} className="network-map" scrollWheelZoom>
    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <FitNetwork locations={locations} fitKey={fitKey} />
    <FocusLocation location={focusLocation} focusKey={focusKey} />
    <ZoomObserver onZoomChange={setZoom} />
    {layers.roads && roads.filter((road) => !(layers.route && routeRoadIds.has(road.id))).map((road) => {
      const source = locationsById.get(road.source);
      const destination = locationsById.get(road.destination);
      if (!source || !destination) return null;
      const selected = selectedRoad?.id === road.id;
      return <Polyline key={road.id} positions={[[source.latitude, source.longitude], [destination.latitude, destination.longitude]]}
        pathOptions={{ color: statusColors[road.status] || '#747474', weight: selected ? 4 : zoom < 8 ? 0.65 : 1.1, opacity: selected ? 0.95 : roadOpacity, dashArray: road.status === 'Restricted' ? '4 6' : road.status === 'Closed' ? '1 7' : undefined, lineCap: 'round' }}
        eventHandlers={{ click: () => onRoadSelect(road) }}>
        <Tooltip sticky><strong>{road.id}</strong><br />{road.status} · {road.roadCondition}<br />{road.source} → {road.destination}</Tooltip>
      </Polyline>;
    })}
    {layers.risk && zoom >= 8 && locations.filter((location) => ['High', 'Critical'].includes(riskByLocation.get(location.id))).map((location) => {
      const risk = riskByLocation.get(location.id);
      return <CircleMarker key={`risk:${location.id}`} center={[location.latitude, location.longitude]} radius={risk === 'Critical' ? 10 : 7}
        interactive={false} pathOptions={{ color: riskColors[risk], weight: 1, fillColor: riskColors[risk], fillOpacity: 0.1, opacity: 0.62 }} />;
    })}
    {layers.locations && <LocationLayer locations={locations} riskByLocation={riskByLocation} selectedLocation={selectedLocation} onLocationSelect={onLocationSelect} zoom={zoom} />}
    {layers.route && <RouteLayer routeLocations={routeLocations} route={route} />}
  </MapContainer>;
}
