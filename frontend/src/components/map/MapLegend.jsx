import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { riskColors, statusColors } from '../../utils/network';

export function MapLegend() {
  const [open, setOpen] = useState(true);
  return <div className={`map-legend ${open ? 'is-open' : 'is-collapsed'}`}>
    <button className="legend-heading" type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open}>
      <span className="control-title">NETWORK LEGEND</span><ChevronDown className="panel-chevron" size={15} />
    </button>
    <div className="overlay-panel-body">
      <div className="legend-group">
        <span>Simulated incidents</span>
        {['Critical', 'High', 'Medium', 'Low'].map((key) => <p key={key}><i className="legend-diamond" style={{ background: riskColors[key] }} />{key}</p>)}
      </div>
      <div className="legend-group">
        <span>Road availability</span>
        {Object.entries(statusColors).map(([key, color]) => <p key={key}><i className={`legend-line ${key.toLowerCase()}`} style={{ '--legend-color': color }} />{key}</p>)}
      </div>
      <div className="legend-group">
        <span>Location risk</span>
        {['Low', 'Medium', 'High', 'Critical'].map((key) => <p key={key}><i className="legend-point" style={{ background: riskColors[key] }} />{key}</p>)}
      </div>
      <p className="legend-note">Diamonds represent simulated incidents; cyan rings represent simulated resources. Numbered circles are clustered real locations.</p>
    </div>
  </div>;
}
