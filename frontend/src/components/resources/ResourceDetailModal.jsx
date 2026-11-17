import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Edit2,
  ExternalLink,
  Info,
  MapPin,
  Save,
  Search,
  Trash2,
  X
} from 'lucide-react';

const STATUS_COLORS = {
  Available: '#38a169',
  Allocated: '#3b82f6',
  Dispatched: '#e76f3c',
  'En Route': '#d99a1d',
  'On Scene': '#e14949',
  Returning: '#8b5cf6',
  Maintenance: '#6b7280'
};

const TYPE_COLORS = {
  Ambulance: '#e14949',
  'Rescue Team': '#e76f3c',
  'Fire Unit': '#d99a1d',
  'Relief Unit': '#38a169'
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString();
}

export function ResourceDetailModal({
  resource,
  locations,
  resourceTypes,
  onClose,
  onUpdate,
  onStatusChange,
  onDelete,
  onViewOnMap
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // Edit state
  const [editName, setEditName] = useState(resource.name);
  const [editType, setEditType] = useState(resource.type);
  const [editLocationId, setEditLocationId] = useState(resource.locationId);
  const [editLocationSearch, setEditLocationSearch] = useState('');
  const [editCapacity, setEditCapacity] = useState(String(resource.capacity));
  const [editCapabilityInput, setEditCapabilityInput] = useState('');
  const [editCapabilities, setEditCapabilities] = useState(
    Array.isArray(resource.capabilities) ? [...resource.capabilities] : []
  );
  const [editContactName, setEditContactName] = useState(resource.contact?.name || '');
  const [editContactPhone, setEditContactPhone] = useState(resource.contact?.phone || '');
  const [editContactRadio, setEditContactRadio] = useState(resource.contact?.radioChannel || '');

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape' && !busy) onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [busy, onClose]);

  const loc = locations.find((l) => l.id === resource.locationId);
  const editLoc = locations.find((l) => l.id === editLocationId);
  const nextStatuses = (resource.allowedStatusTransitions || []).filter(
    (status) => status !== resource.status
  );
  const statusColor = STATUS_COLORS[resource.status] || '#666';
  const typeColor = TYPE_COLORS[resource.type] || '#888';
  const canDelete = resource.canDelete === true;

  const matchedEditLocations = editLocationSearch.trim()
    ? locations
        .filter(
          (l) =>
            l.id.toLowerCase().includes(editLocationSearch.toLowerCase()) ||
            l.name.toLowerCase().includes(editLocationSearch.toLowerCase())
        )
        .slice(0, 8)
    : [];

  const addEditCapability = () => {
    const parts = editCapabilityInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    setEditCapabilities((prev) => {
      const existing = new Set(prev);
      return [...prev, ...parts.filter((p) => !existing.has(p))];
    });
    setEditCapabilityInput('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      setError('Resource name is required.');
      return;
    }
    if (!resourceTypes.includes(editType)) {
      setError('Select a valid resource type.');
      return;
    }
    if (!locations.some((location) => location.id === editLocationId)) {
      setError('Select a valid network location.');
      return;
    }
    const capacity = Number(editCapacity);
    if (!Number.isInteger(capacity) || capacity < 1) {
      setError('Capacity must be a whole number of at least 1.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onUpdate(resource.resourceId, {
        name: editName.trim(),
        type: editType,
        locationId: editLocationId,
        capacity,
        capabilities: editCapabilities,
        contact: {
          name: editContactName.trim(),
          phone: editContactPhone.trim(),
          radioChannel: editContactRadio.trim()
        }
      });
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update resource.');
    } finally {
      setBusy(false);
    }
  };

  const handleStatusTransition = async (nextStatus) => {
    setBusy(true);
    setError(null);
    try {
      await onStatusChange(resource.resourceId, nextStatus);
    } catch (err) {
      setError(err.message || 'Failed to transition status.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    onDelete(resource);
  };

  const beginEditing = () => {
    setEditName(resource.name);
    setEditType(resource.type);
    setEditLocationId(resource.locationId);
    setEditLocationSearch('');
    setEditCapacity(String(resource.capacity));
    setEditCapabilityInput('');
    setEditCapabilities(Array.isArray(resource.capabilities) ? [...resource.capabilities] : []);
    setEditContactName(resource.contact?.name || '');
    setEditContactPhone(resource.contact?.phone || '');
    setEditContactRadio(resource.contact?.radioChannel || '');
    setError(null);
    setIsEditing(true);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="resource-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="dialog-close" onClick={onClose} aria-label="Close dialog">
          <X size={18} />
        </button>

        <div className="simulation-banner mb-3">
          <Info size={14} /> SIMULATED RESOURCE DATA · DISASTERX MANAGEMENT NETWORK
        </div>

        <div className="detail-modal-header">
          <div className="detail-header-tags">
            <span
              className="font-mono text-xs font-bold"
              style={{ background: '#181818', color: '#e7ee1e', padding: '2px 8px' }}
            >
              {resource.resourceId}
            </span>
            <span
              className="data-tag"
              style={{ color: typeColor, borderColor: typeColor, background: `${typeColor}15` }}
            >
              {resource.type}
            </span>
            <span
              className="resource-status-pill"
              style={{
                backgroundColor: `${statusColor}20`,
                color: statusColor,
                borderColor: statusColor
              }}
            >
              {resource.status}
            </span>
          </div>
          <h2 style={{ fontFamily: 'Georgia, serif', margin: '8px 0 0', fontSize: '22px' }}>
            {resource.name}
          </h2>
        </div>

        {error && <p className="form-error mb-3">{error}</p>}

        {isEditing ? (
          <form onSubmit={handleSave} className="emergency-edit-form">
            <label>
              <span>RESOURCE NAME</span>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                disabled={busy}
              />
            </label>

            <label>
              <span>RESOURCE TYPE</span>
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
                disabled={busy}
              >
                {resourceTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>

            <label>
              <span>NETWORK LOCATION</span>
              {editLoc ? (
                <div className="selected-location-pill">
                  <div>
                    <strong>{editLoc.name}</strong>
                    <small>
                      {editLoc.id} · {editLoc.type}
                    </small>
                  </div>
                  <button
                    type="button"
                    className="clear-location-button"
                    onClick={() => {
                      setEditLocationId('');
                      setEditLocationSearch('');
                    }}
                    disabled={busy}
                    aria-label="Change location"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="location-picker">
                  <div className="location-search-box">
                    <Search size={14} />
                    <input
                      type="text"
                      value={editLocationSearch}
                      onChange={(e) => setEditLocationSearch(e.target.value)}
                      placeholder="Search locations..."
                      disabled={busy}
                    />
                  </div>
                  {matchedEditLocations.length > 0 && (
                    <div className="location-picker-results">
                      {matchedEditLocations.map((l) => (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => {
                            setEditLocationId(l.id);
                            setEditLocationSearch('');
                          }}
                        >
                          <MapPin size={13} />
                          <span>
                            <strong>{l.name}</strong>
                            <small>
                              {l.id} · {l.type}
                            </small>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </label>

            <div className="form-row-2">
              <label>
                <span>CAPACITY</span>
                <input
                  type="number"
                  min="1"
                  value={editCapacity}
                  onChange={(e) => setEditCapacity(e.target.value)}
                  disabled={busy}
                />
              </label>
              <label>
                <span>CONTACT NAME</span>
                <input
                  type="text"
                  value={editContactName}
                  onChange={(e) => setEditContactName(e.target.value)}
                  disabled={busy}
                />
              </label>
            </div>

            <div className="form-row-2">
              <label>
                <span>CONTACT PHONE</span>
                <input
                  type="text"
                  value={editContactPhone}
                  onChange={(e) => setEditContactPhone(e.target.value)}
                  disabled={busy}
                />
              </label>
              <label>
                <span>RADIO CHANNEL</span>
                <input
                  type="text"
                  value={editContactRadio}
                  onChange={(e) => setEditContactRadio(e.target.value)}
                  disabled={busy}
                />
              </label>
            </div>

            <label>
              <span>CAPABILITIES</span>
              <div className="capabilities-input-row">
                <input
                  type="text"
                  value={editCapabilityInput}
                  onChange={(e) => setEditCapabilityInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addEditCapability();
                    }
                  }}
                  placeholder="Add capability..."
                  disabled={busy}
                />
                <button
                  type="button"
                  className="button button-quiet"
                  onClick={addEditCapability}
                  disabled={busy}
                  style={{ minWidth: '52px', fontSize: '11px' }}
                >
                  Add
                </button>
              </div>
              {editCapabilities.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '6px' }}>
                  {editCapabilities.map((cap) => (
                    <span key={cap} className="capability-tag">
                      {cap}
                      <button
                        type="button"
                        onClick={() =>
                          setEditCapabilities((prev) => prev.filter((c) => c !== cap))
                        }
                        disabled={busy}
                        aria-label={`Remove ${cap}`}
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
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
              <button type="submit" className="button button-primary" disabled={busy}>
                <Save size={14} />
                <span>{busy ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="detail-modal-body">
            <dl className="resource-detail-grid">
              <div>
                <dt>NAME</dt>
                <dd>
                  <strong>{resource.name}</strong>
                </dd>
              </div>
              <div>
                <dt>TYPE</dt>
                <dd>
                  <span style={{ color: typeColor, fontWeight: 700 }}>{resource.type}</span>
                </dd>
              </div>
              <div>
                <dt>LOCATION</dt>
                <dd>
                  <strong>{loc ? loc.name : resource.locationId}</strong>
                  <br />
                  <small className="text-neutral-500 font-mono">{resource.locationId}</small>
                </dd>
              </div>
              <div>
                <dt>CAPACITY</dt>
                <dd>
                  <span className="text-base font-bold">{resource.capacity}</span>
                </dd>
              </div>
              {resource.capabilities && resource.capabilities.length > 0 && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <dt>CAPABILITIES</dt>
                  <dd>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '4px' }}>
                      {resource.capabilities.map((cap) => (
                        <span key={cap} className="capability-tag" style={{ cursor: 'default' }}>
                          {cap}
                        </span>
                      ))}
                    </div>
                  </dd>
                </div>
              )}
              {resource.contact && (
                <>
                  <div>
                    <dt>CONTACT</dt>
                    <dd>
                      {resource.contact.name || '—'}
                      {resource.contact.phone && (
                        <>
                          <br />
                          <small>{resource.contact.phone}</small>
                        </>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>RADIO CHANNEL</dt>
                    <dd>{resource.contact.radioChannel || '—'}</dd>
                  </div>
                </>
              )}
              <div>
                <dt>CREATED AT</dt>
                <dd>
                  <small>{formatDate(resource.createdAt)}</small>
                </dd>
              </div>
              <div>
                <dt>LAST UPDATED</dt>
                <dd>
                  <small>{formatDate(resource.updatedAt)}</small>
                </dd>
              </div>
            </dl>

            <div className="resource-status-transition-section">
              <p className="eyebrow mb-2">STATUS TRANSITIONS</p>
              {nextStatuses.length > 0 ? (
                <div className="resource-status-buttons-row">
                  {nextStatuses.map((status) => {
                    const color = STATUS_COLORS[status] || '#666';
                    return (
                      <button
                        key={status}
                        type="button"
                        className="button button-quiet"
                        onClick={() => handleStatusTransition(status)}
                        disabled={busy}
                        style={{ fontSize: '11px' }}
                      >
                        <ArrowRight size={13} />
                        <span style={{ color }}>→ {status}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div
                  style={{
                    padding: '10px 14px',
                    background: '#f1f0e9',
                    border: '1px solid #d3d0c6',
                    fontSize: '11px',
                    color: '#5f5b52'
                  }}
                >
                  No further status transitions available from {resource.status}.
                </div>
              )}
            </div>

            <div className="detail-modal-footer">
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="button button-quiet"
                  onClick={beginEditing}
                  disabled={busy}
                >
                  <Edit2 size={14} />
                  <span>Edit Details</span>
                </button>

                {canDelete && (
                  <button
                    type="button"
                    className="button button-danger"
                    onClick={handleDelete}
                    disabled={busy}
                  >
                    <Trash2 size={14} />
                    <span>Delete Resource</span>
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => {
                    onViewOnMap(resource);
                    onClose();
                  }}
                  disabled={busy}
                >
                  <ExternalLink size={14} />
                  <span>Inspect Location on Map</span>
                </button>

                <button
                  type="button"
                  className="button button-dark"
                  onClick={onClose}
                  disabled={busy}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
