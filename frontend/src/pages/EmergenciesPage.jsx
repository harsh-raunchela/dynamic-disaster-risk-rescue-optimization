import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, Siren } from 'lucide-react';
import { useNetwork } from '../context/NetworkContext';
import { EmergencyStats } from '../components/emergencies/EmergencyStats';
import { EmergencyForm } from '../components/emergencies/EmergencyForm';
import { EmergencyList } from '../components/emergencies/EmergencyList';
import { EmergencyDetailModal } from '../components/emergencies/EmergencyDetailModal';

export function EmergenciesPage() {
  const {
    emergencies,
    locations,
    createEmergency,
    updateEmergency,
    updateEmergencyStatus,
    setSelectedLocation
  } = useNetwork();

  const [activeModalEmergency, setActiveModalEmergency] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (payload) => {
    setSubmitting(true);
    try {
      await createEmergency(payload);
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewOnMap = (emergency) => {
    const loc = locations.find((l) => l.id === emergency.locationId);
    if (loc) {
      setSelectedLocation(loc);
    }
    navigate(`/map?locationId=${encodeURIComponent(emergency.locationId)}&emergencyId=${encodeURIComponent(emergency.emergencyId)}`);
  };

  // Find updated instance if modal is open
  const currentModalEmergency = activeModalEmergency
    ? emergencies.find((e) => e.emergencyId === activeModalEmergency.emergencyId) || activeModalEmergency
    : null;

  return (
    <div className="page-content emergencies-page">
      <div className="simulation-banner mb-4">
        <Info size={16} /> SIMULATED INCIDENT DATA · EMERGENCY DISPATCH NETWORK (NOT LIVE REAL-WORLD INCIDENTS)
      </div>

      <div className="page-intro">
        <p className="eyebrow">PHASE 3.6 OPERATIONAL SUBSYSTEM</p>
        <h2>Emergency Incident Management & Priority Queue</h2>
        <p>
          Deterministic incident prioritization, live status workflow transitions, and
          synthetic network coordinate mapping for disaster emergency response operations.
        </p>
      </div>

      <EmergencyStats emergencies={emergencies} />

      <div className="emergencies-workspace-grid">
        <aside className="emergencies-sidebar">
          <EmergencyForm
            locations={locations}
            onSubmit={handleRegister}
            submitting={submitting}
          />
        </aside>

        <main className="emergencies-main">
          <EmergencyList
            emergencies={emergencies}
            locations={locations}
            onSelectEmergency={(emg) => setActiveModalEmergency(emg)}
            onViewOnMap={handleViewOnMap}
          />
        </main>
      </div>

      {currentModalEmergency && (
        <EmergencyDetailModal
          emergency={currentModalEmergency}
          locations={locations}
          onClose={() => setActiveModalEmergency(null)}
          onUpdate={updateEmergency}
          onStatusChange={updateEmergencyStatus}
          onViewOnMap={handleViewOnMap}
        />
      )}
    </div>
  );
}

