import { useEffect, useMemo } from 'react';
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet';
import { riskColors, riskForLocation, statusColors } from '../../utils/network';

function FitNetwork({ locations, fitKey }) {
  const map = useMap();
  useEffect(() => {
    const bounds = locations.map((location) => [location.latitude, location.longitude]);
    if (bounds.length) map.fitBounds(bounds, { padding: [36, 36], maxZoom: 9 });
  }, [map, locations, fitKey]);
  return null;
}

export function NetworkMap({
  locations, roads, risks, route, selectedLocation, selectedRoad,
  onLocationSelect, onRoadSelect, layers, fitKey
}) {
  const locationsById = useMemo(() => new Map(locations.map((item) => [item.id, item])), [locations]);
  const routeLocations = useMemo(() => (route?.locationIds || [])
    .map((id) => locationsById.get(id))
    .filter(Boolean)
    .map((item) => [item.latitude, item.longitude]), [route, locationsById]);

  const center = locations.length ? [locations[0].latitude, locations[0].longitude] : [28.6, 78.8];
  return (
    <MapContainer center={center} zoom={7} className="network-map" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitNetwork locations={locations} fitKey={fitKey} />
      {layers.roads && roads.map((road) => {
        const source = locationsById.get(road.source);
        const destination = locationsById.get(road.destination);
        if (!source || !destination) return null;
        const selected = selectedRoad?.id === road.id;
        return <Polyline key={road.id} positions={[[source.latitude, source.longitude], [destination.latitude, destination.longitude]]}
          pathOptions={{ color: statusColors[road.status] || '#747474', weight: selected ? 5 : road.status === 'Closed' ? 2 : 1.8, opacity: road.status === 'Closed' ? 0.46 : 0.72, dashArray: road.status === 'Restricted' ? '7 6' : road.status === 'Closed' ? '3 7' : undefined }}
          eventHandlers={{ click: () => onRoadSelect(road) }}>
          <Tooltip sticky><strong>{road.id}</strong><br />{road.status} · {road.roadCondition}<br />{road.source} → {road.destination}</Tooltip>
        </Polyline>;
      })}
      {layers.route && routeLocations.length > 1 && <Polyline positions={routeLocations} pathOptions={{ color: '#111111', weight: 6, opacity: 0.9 }} />}
      {layers.locations && locations.map((location) => {
        const risk = riskForLocation(location.id, risks);
        const selected = selectedLocation?.id === location.id;
        return <CircleMarker key={location.id} center={[location.latitude, location.longitude]}
          radius={selected ? 8 : risk === 'Critical' ? 6 : 4.5}
          pathOptions={{ color: '#1b1b1b', weight: selected ? 3 : 1, fillColor: layers.risk ? riskColors[risk] : '#f4e821', fillOpacity: 1 }}
          eventHandlers={{ click: () => onLocationSelect(location) }}>
          <Popup><strong>{location.name}</strong><br />{location.id} · {location.type}<br />Capacity: {location.capacity}<br />Synthetic coordinates: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</Popup>
        </CircleMarker>;
      })}
    </MapContainer>
  );
}
