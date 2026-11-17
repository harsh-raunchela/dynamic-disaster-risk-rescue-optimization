import { useState } from 'react';
import { ChevronDown, Crosshair, Layers3, MapPin, Route, Search, Siren, Sparkles, Truck, X } from 'lucide-react';

const layerOptions = (roadCount) => ({
  emergencies: { label: 'Incident beacons', icon: Siren, hint: 'Simulated active emergencies' },
  resources: { label: 'Resource beacons', icon: Truck, hint: 'Simulated operational resources' },
  roads: { label: 'Road network', icon: Layers3, hint: `${roadCount.toLocaleString()} real road geometries` },
  locations: { label: 'Location clusters', icon: MapPin, hint: 'Clusters below zoom 9' },
  risk: { label: 'Risk hotspots', icon: Sparkles, hint: 'High and critical at close zoom' },
  route: { label: 'Selected route', icon: Route, hint: 'C++ engine result only' }
});

export function MapControls({
  layers, onLayerChange, onFit, locations, roadCount, search, setSearch, onPick,
  emergencySeverityFilter, onSeverityFilterChange
}) {
  const [open, setOpen] = useState(true);
  const matches = search.trim() ? locations.filter((location) =>
    location.id.toLowerCase().includes(search.toLowerCase()) ||
    location.name.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 6) : [];

  return <>
    <div className="map-search">
      <Search size={17} />
      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find location ID or name" aria-label="Find a location" />
      {search && <button onClick={() => setSearch('')} aria-label="Clear location search"><X size={15} /></button>}
      {matches.length > 0 && <div className="search-results">
        {matches.map((location) => <button key={location.id} onClick={() => { onPick(location); setSearch(''); }}><MapPin size={14} /><span>{location.name}<small>{location.id} · {location.type}</small></span></button>)}
      </div>}
    </div>

    <div className={`map-layer-controls ${open ? 'is-open' : 'is-collapsed'}`}>
      <button className="layer-panel-heading" type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open}>
        <span><p className="control-title">MAP LAYERS</p><strong>Signal controls</strong></span>
        <span><Layers3 size={16} /><ChevronDown className="panel-chevron" size={15} /></span>
      </button>
      <div className="overlay-panel-body">
        {Object.entries(layerOptions(roadCount || 0)).map(([key, option]) => {
          const Icon = option.icon;
          return <label key={key}>
            <input type="checkbox" checked={layers[key] ?? true} onChange={(event) => onLayerChange(key, event.target.checked)} />
            <span><Icon size={14} /><b>{option.label}</b><small>{option.hint}</small></span>
          </label>;
        })}
        {layers.emergencies && onSeverityFilterChange && <div className="emergency-layer-filter">
          <span>Filter severity:</span>
          <select value={emergencySeverityFilter || 'All'} onChange={(event) => onSeverityFilterChange(event.target.value)}>
            <option value="All">All Incidents</option><option value="Critical">Critical Only</option><option value="High">High & Above</option><option value="Active">Active Only</option>
          </select>
        </div>}
        <button className="fit-button" onClick={onFit}><Crosshair size={15} /> Fit network bounds</button>
      </div>
    </div>
  </>;
}
