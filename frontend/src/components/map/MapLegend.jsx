import { riskColors, statusColors } from '../../utils/network';

export function MapLegend() {
  return <div className="map-legend"><p className="control-title">NETWORK LEGEND</p><div className="legend-group"><span>Road availability</span>{Object.entries(statusColors).map(([key, color]) => <p key={key}><i className={`legend-line ${key.toLowerCase()}`} style={{ '--legend-color': color }} />{key}</p>)}</div><div className="legend-group"><span>Location risk</span>{['Low', 'Medium', 'High', 'Critical'].map((key) => <p key={key}><i className="legend-point" style={{ background: riskColors[key] }} />{key}</p>)}</div><p className="legend-note">Numbered circles are clustered locations. Zoom in to inspect individual points.</p></div>;
}
