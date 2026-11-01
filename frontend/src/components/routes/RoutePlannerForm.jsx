import { ArrowDownUp, Navigation, X } from 'lucide-react';
import { useState } from 'react';

export function RoutePlannerForm({ locations, route, onPlan, onClear, compact = false }) {
  const [source, setSource] = useState('LOC_0001');
  const [destination, setDestination] = useState('LOC_0010');
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setFormError('');
    try { await onPlan(source, destination); } catch (error) { setFormError(error.message); } finally { setBusy(false); }
  };
  return <form className={`route-form ${compact ? 'route-form-compact' : ''}`} onSubmit={submit}>
    <div className="form-heading"><div><p className="eyebrow">C++ DECISION ENGINE</p><h2>Plan a route</h2></div>{route && <button type="button" className="text-button" onClick={onClear}><X size={15} /> Clear</button>}</div>
    <label>Origin<input list="locations" value={source} onChange={(event) => setSource(event.target.value)} placeholder="LOC_0001" required /></label>
    <button type="button" className="swap-button" onClick={() => { setSource(destination); setDestination(source); }} aria-label="Swap route locations"><ArrowDownUp size={16} /></button>
    <label>Destination<input list="locations" value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="LOC_0010" required /></label>
    <datalist id="locations">{locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}</datalist>
    {formError && <p className="form-error">{formError}</p>}
    <button className="button button-primary" disabled={busy}><Navigation size={17} />{busy ? 'Calculating…' : 'Plan risk-aware route'}</button>
  </form>;
}
