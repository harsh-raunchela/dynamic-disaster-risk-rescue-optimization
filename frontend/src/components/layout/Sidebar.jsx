import { NavLink } from 'react-router-dom';
import { Activity, ChartNoAxesCombined, ChevronLeft, Command, Map, Network, Route, Settings, X } from 'lucide-react';
import { useNetwork } from '../../context/NetworkContext';

const links = [
  ['/', 'Command Center', Command],
  ['/map', 'Live Map', Map],
  ['/routes', 'Route Planner', Route],
  ['/network', 'Network Monitoring', Network],
  ['/risks', 'Risk Analytics', ChartNoAxesCombined],
  ['/settings', 'Settings', Settings]
];

export function Sidebar({ collapsed, mobileOpen, onToggle, onCloseMobile }) {
  const { health } = useNetwork();
  const connected = health?.ready && health?.worker?.state === 'ready';
  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'sidebar-mobile-open' : ''}`}>
      <div className="brand-row">
        <div className="brand-mark" aria-hidden="true"><span>DX</span></div>
        <div className="brand-copy"><strong>DisasterX</strong><small>COMMAND NETWORK</small></div>
        <button className="mobile-close" onClick={onCloseMobile} aria-label="Close navigation"><X size={19} /></button>
      </div>
      <nav aria-label="Main navigation">
        {links.map(([path, label, Icon]) => (
          <NavLink key={path} to={path} end={path === '/'} className="nav-link" onClick={onCloseMobile}>
            <Icon size={19} strokeWidth={1.8} /><span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className={`worker-pill ${connected ? 'worker-online' : 'worker-offline'}`}>
          <Activity size={15} /><span>{connected ? 'Worker connected' : 'Worker unavailable'}</span>
        </div>
        <button className="collapse-button" onClick={onToggle} aria-label="Collapse sidebar">
          <ChevronLeft size={17} /><span>Collapse</span>
        </button>
      </div>
    </aside>
  );
}
