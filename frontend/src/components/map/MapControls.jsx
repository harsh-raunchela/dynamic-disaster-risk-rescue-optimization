import { Crosshair, MapPin, Route, Search, X } from 'lucide-react';

export function MapControls({ layers, onLayerChange, onFit, locations, search, setSearch, onPick }) {
  const matches = search.trim() ? locations.filter((location) =>
    location.id.toLowerCase().includes(search.toLowerCase()) ||
    location.name.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 6) : [];
  return <>
    <div className="map-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find location ID or name" aria-label="Find a location" />{search && <button onClick={() => setSearch('')} aria-label="Clear location search"><X size={15} /></button>}
      {matches.length > 0 && <div className="search-results">{matches.map((location) => <button key={location.id} onClick={() => { onPick(location); setSearch(''); }}><MapPin size={14} /><span>{location.name}<small>{location.id}</small></span></button>)}</div>}
    </div>
    <div className="map-layer-controls">
      <p className="control-title">LAYERS</p>
      {Object.entries({ roads: 'Road network', locations: 'Locations', risk: 'Risk markers', route: 'Selected route' }).map(([key, label]) => <label key={key}><input type="checkbox" checked={layers[key]} onChange={(event) => onLayerChange(key, event.target.checked)} /><span>{key === 'route' ? <Route size={14} /> : <Crosshair size={14} />}{label}</span></label>)}
      <button className="fit-button" onClick={onFit}><Crosshair size={15} /> Fit network bounds</button>
    </div>
  </>;
}
