import { Crosshair, Layers3, MapPin, Route, Search, Sparkles, X } from 'lucide-react';

const layerOptions = {
  roads: { label: 'Road network', icon: Layers3, hint: '2,500 live graph edges' },
  locations: { label: 'Location clusters', icon: MapPin, hint: 'Clusters below zoom 9' },
  risk: { label: 'Risk hotspots', icon: Sparkles, hint: 'High and critical at close zoom' },
  route: { label: 'Selected route', icon: Route, hint: 'C++ engine result only' }
};

export function MapControls({ layers, onLayerChange, onFit, locations, search, setSearch, onPick }) {
  const matches = search.trim() ? locations.filter((location) =>
    location.id.toLowerCase().includes(search.toLowerCase()) ||
    location.name.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 6) : [];
  return <>
    <div className="map-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find location ID or name" aria-label="Find a location" />{search && <button onClick={() => setSearch('')} aria-label="Clear location search"><X size={15} /></button>}
      {matches.length > 0 && <div className="search-results">{matches.map((location) => <button key={location.id} onClick={() => { onPick(location); setSearch(''); }}><MapPin size={14} /><span>{location.name}<small>{location.id} · {location.type}</small></span></button>)}</div>}
    </div>
    <div className="map-layer-controls">
      <div className="layer-panel-heading"><div><p className="control-title">MAP LAYERS</p><strong>Signal controls</strong></div><Layers3 size={16} /></div>
      {Object.entries(layerOptions).map(([key, option]) => { const Icon = option.icon; return <label key={key}><input type="checkbox" checked={layers[key]} onChange={(event) => onLayerChange(key, event.target.checked)} /><span><Icon size={14} /><b>{option.label}</b><small>{option.hint}</small></span></label>; })}
      <button className="fit-button" onClick={onFit}><Crosshair size={15} /> Fit network bounds</button>
    </div>
  </>;
}
