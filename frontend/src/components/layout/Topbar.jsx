import { Menu, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useNetwork } from '../../context/NetworkContext';
import { IconButton } from '../common/IconButton';

const titles = {
  '/': ['Command Center', 'System overview'],
  '/map': ['Live Map', 'Synthetic road network'],
  '/routes': ['Route Planner', 'C++ risk-aware routing'],
  '/network': ['Network Monitoring', 'Road state operations'],
  '/risks': ['Risk Analytics', 'ML prediction output'],
  '/settings': ['Settings', 'Local integration details']
};

export function Topbar({ onOpenMobile }) {
  const { pathname } = useLocation();
  const { health, lastUpdated, loading, refreshNetwork } = useNetwork();
  const [title, subtitle] = titles[pathname] || titles['/'];
  const connected = health?.ready && health?.worker?.state === 'ready';
  return (
    <header className="topbar">
      <div className="topbar-title">
        <IconButton label="Open navigation" className="mobile-menu" onClick={onOpenMobile}><Menu size={20} /></IconButton>
        <div><p className="eyebrow">{subtitle}</p><h1>{title}</h1></div>
      </div>
      <div className="topbar-actions">
        <div className="synthetic-pill">SIMULATED NETWORK</div>
        <div className={`connection-status ${connected ? 'connection-live' : 'connection-down'}`} title={connected ? 'Backend and worker connected' : 'Backend unavailable'}>
          {connected ? <Wifi size={15} /> : <WifiOff size={15} />}<span>{connected ? 'Connected' : 'Offline'}</span>
        </div>
        <span className="refresh-time">{lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Not refreshed'}</span>
        <IconButton label="Refresh network data" onClick={() => refreshNetwork()} disabled={loading}>
          <RefreshCw size={18} className={loading ? 'spin' : ''} />
        </IconButton>
      </div>
    </header>
  );
}
