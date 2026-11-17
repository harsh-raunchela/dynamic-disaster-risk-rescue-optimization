import { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Edit2,
  ExternalLink,
  Flame,
  Info,
  MapPin,
  Save,
  Users,
  X
} from 'lucide-react';
import { formatNumber } from '../../utils/network';

const SEVERITY_COLORS = {
  Critical: '#e14949',
  High: '#e76f3c',
  Medium: '#d99a1d',
  Low: '#38a169'
};

const NEXT_STATUS_OPTIONS = {
  Reported: ['Prioritized', 'Assigned', 'Responding', 'Resolved'],
  Prioritized: ['Assigned', 'Responding', 'Resolved'],
  Assigned: ['Responding', 'Resolved'],
  Responding: ['Resolved'],
  Resolved: []
};

export function EmergencyDetailModal({
  emergency,
  locations,
  onClose,
  onUpdate,
  onStatusChange,
  onViewOnMap
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(emergency.title);
  const [description, setDescription] = useState(emergency.description || '');
  const [severity, setSeverity] = useState(emergency.severity);
  const [peopleAffected, setPeopleAffected] = useState(String(emergency.peopleAffected));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const loc = locations.find((l) => l.id === emergency.locationId);
  const nextStatuses = NEXT_STATUS_OPTIONS[emergency.status] || [];
  const severityColor = SEVERITY_COLORS[emergency.severity] || '#666';

  const handleSave = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onUpdate(emergency.emergencyId, {
        title: title.trim(),
        description: description.trim(),
        severity,
        peopleAffected: parseInt(peopleAffected, 10)
      });
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update emergency.');
    } finally {
      setBusy(false);
    }
  };

  const handleStatusTransition = async (nextStatus) => {
    setBusy(true);
    setError(null);
    try {
      await onStatusChange(emergency.emergencyId, nextStatus);
    } catch (err) {
      setError(err.message || 'Failed to transition status.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="emergency-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="dialog-close" onClick={onClose} aria-label="Close dialog">
          <X size={18} />
        </button>

        <div className="simulation-banner mb-3">
          <Info size={14} /> SIMULATED INCIDENT DATA · DISASTERX MANAGEMENT NETWORK
        </div>

        <div className="detail-modal-header">
          <div>
            <div className="detail-header-tags">
              <span className="font-mono text-xs font-bold bg-neutral-900 text-yellow-300 px-2 py-0.5">
                {emergency.emergencyId}
              </span>
              <span
                className="severity-pill"
                style={{
                  backgroundColor: `${severityColor}20`,
                  color: severityColor,
                  borderColor: severityColor
                }}
              >
                {emergency.severity} Severity
              </span>
              <span className="data-tag">{emergency.type}</span>
              {emergency.priority && (
                <span className="priority-badge">Priority #{emergency.priority}</span>
              )}
            </div>
            <h2>{emergency.title}</h2>
          </div>
        </div>

        {error && <p className="form-error mb-3">{error}</p>}

        {isEditing ? (
          <form onSubmit={handleSave} className="emergency-edit-form">
            <label>
              <span>INCIDENT TITLE</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={busy}
              />
            </label>

            <div className="form-row-2">
              <label>
                <span>SEVERITY</span>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  disabled={busy}
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </label>

              <label>
                <span>PEOPLE AFFECTED</span>
                <input
                  type="number"
                  min="0"
                  value={peopleAffected}
                  onChange={(e) => setPeopleAffected(e.target.value)}
                  disabled={busy}
                />
              </label>
            </div>

            <label>
              <span>DESCRIPTION</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                disabled={busy}
              />
            </label>

            <div className="edit-form-actions">
              <button
                type="button"
                className="button button-quiet"
                onClick={() => setIsEditing(false)}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="button button-primary"
                disabled={busy}
              >
                <Save size={14} />
                <span>{busy ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="detail-modal-body">
            <dl className="detail-grid">
              <div>
                <dt>LOCATION</dt>
                <dd>
                  <strong>{loc ? loc.name : emergency.locationId}</strong>
                  <br />
                  <small className="text-neutral-500 font-mono">
                    {emergency.locationId} · {loc ? `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}` : ''}
                  </small>
                </dd>
              </div>

              <div>
                <dt>PEOPLE AFFECTED</dt>
                <dd>
                  <span className="text-base font-bold">{formatNumber(emergency.peopleAffected)}</span>
                </dd>
              </div>

              <div>
                <dt>CURRENT STATUS</dt>
                <dd>
                  <strong className="status-label">{emergency.status}</strong>
                </dd>
              </div>

              <div>
                <dt>REPORTED AT</dt>
                <dd>
                  <small>{new Date(emergency.reportedAt).toLocaleString()}</small>
                </dd>
              </div>

              <div>
                <dt>LAST UPDATED</dt>
                <dd>
                  <small>{new Date(emergency.updatedAt).toLocaleString()}</small>
                </dd>
              </div>

              <div>
                <dt>PRIORITY QUEUE</dt>
                <dd>
                  {emergency.priority ? (
                    <span className="font-bold">Position #{emergency.priority}</span>
                  ) : (
                    <span className="text-neutral-500">Not in active queue (Resolved)</span>
                  )}
                </dd>
              </div>
            </dl>

            <div className="detail-description-section">
              <dt className="eyebrow mb-1">INCIDENT DESCRIPTION</dt>
              <p className="detail-description">
                {emergency.description || 'No additional incident description provided.'}
              </p>
            </div>

            <div className="status-transition-section">
              <p className="eyebrow mb-2">CONTROLLED STATUS TRANSITIONS</p>
              {nextStatuses.length > 0 ? (
                <div className="status-buttons-row">
                  {nextStatuses.map((status) => (
                    <button
                      key={status}
                      type="button"
                      className={`button ${status === 'Resolved' ? 'button-dark' : 'button-quiet'}`}
                      onClick={() => handleStatusTransition(status)}
                      disabled={busy}
                    >
                      <ArrowRight size={13} />
                      <span>Advance to {status}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="terminal-status-notice">
                  <CheckCircle2 size={16} className="text-emerald-600 inline mr-2" />
                  <span>Incident is Resolved. Terminal state reached; no further transitions allowed.</span>
                </div>
              )}
            </div>

            <div className="detail-modal-footer">
              <button
                type="button"
                className="button button-quiet"
                onClick={() => setIsEditing(true)}
                disabled={busy}
              >
                <Edit2 size={14} />
                <span>Edit Incident Details</span>
              </button>

              <button
                type="button"
                className="button button-primary"
                onClick={() => {
                  onViewOnMap(emergency);
                  onClose();
                }}
              >
                <ExternalLink size={14} />
                <span>Inspect Location on Map</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

