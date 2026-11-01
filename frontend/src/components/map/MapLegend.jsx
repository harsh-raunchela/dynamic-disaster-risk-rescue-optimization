import { riskColors, statusColors } from '../../utils/network';

export function MapLegend() {
  return <div className="map-legend"><p className="control-title">NETWORK LEGEND</p><div className="legend-group"><span>Road state</span>{Object.entries(statusColors).map(([key, color]) => <p key={key}><i style={{ background: color }} />{key}</p>)}</div><div className="legend-group"><span>Location risk</span>{['Low', 'Medium', 'High', 'Critical'].map((key) => <p key={key}><i style={{ background: riskColors[key] }} />{key}</p>)}</div></div>;
}
