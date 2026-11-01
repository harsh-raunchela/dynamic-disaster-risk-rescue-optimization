import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { MapPage } from './pages/MapPage';
import { NetworkPage } from './pages/NetworkPage';
import { RiskPage } from './pages/RiskPage';
import { RoutePlannerPage } from './pages/RoutePlannerPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return <AppShell><Routes><Route path="/" element={<DashboardPage />} /><Route path="/map" element={<MapPage />} /><Route path="/routes" element={<RoutePlannerPage />} /><Route path="/network" element={<NetworkPage />} /><Route path="/risks" element={<RiskPage />} /><Route path="/settings" element={<SettingsPage />} /></Routes></AppShell>;
}
