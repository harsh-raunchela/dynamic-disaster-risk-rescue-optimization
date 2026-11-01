export function MetricCard({ label, value, detail, accent = 'yellow', icon: Icon }) {
  return <article className={`metric-card metric-${accent}`}><div className="metric-card-top"><span>{label}</span>{Icon && <Icon size={18} />}</div><strong>{value}</strong><small>{detail}</small></article>;
}
