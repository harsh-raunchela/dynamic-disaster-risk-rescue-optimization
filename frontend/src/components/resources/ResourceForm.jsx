import { useEffect, useState } from 'react';
import { MapPin, Package, Plus, Search, X } from 'lucide-react';

export function ResourceForm({ locations, resourceTypes, onSubmit, submitting }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [locationId, setLocationId] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [capacity, setCapacity] = useState('1');
  const [capabilityInput, setCapabilityInput] = useState('');
  const [capabilities, setCapabilities] = useState([]);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRadio, setContactRadio] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (resourceTypes.length > 0 && !resourceTypes.includes(type)) {
      setType(resourceTypes[0]);
    }
  }, [resourceTypes, type]);

  const matchedLocations = locationSearch.trim()
    ? locations
        .filter(
          (loc) =>
            loc.id.toLowerCase().includes(locationSearch.toLowerCase()) ||
            loc.name.toLowerCase().includes(locationSearch.toLowerCase())
        )
        .slice(0, 8)
    : [];

  const selectedLoc = locations.find((loc) => loc.id === locationId);

  const addCapability = () => {
    const parts = capabilityInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    setCapabilities((prev) => {
      const existing = new Set(prev);
      return [...prev, ...parts.filter((p) => !existing.has(p))];
    });
    setCapabilityInput('');
  };

  const removeCapability = (cap) => {
    setCapabilities((prev) => prev.filter((c) => c !== cap));
  };

  const handleCapabilityKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCapability();
    }
  };

  const validate = () => {
    const nextErrors = {};
    if (!name.trim()) nextErrors.name = 'Resource name is required.';
    if (!resourceTypes.includes(type)) nextErrors.type = 'Select a valid resource type.';
    if (!locationId) nextErrors.locationId = 'A valid network location must be selected.';
    else if (!locations.some((l) => l.id === locationId)) {
      nextErrors.locationId = 'Selected location does not exist in the network.';
    }
    const cap = parseInt(capacity, 10);
    if (isNaN(cap) || cap < 1) nextErrors.capacity = 'Capacity must be at least 1.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await onSubmit({
        name: name.trim(),
        type,
        locationId,
        capacity: parseInt(capacity, 10),
        capabilities,
        contact: {
          name: contactName.trim(),
          phone: contactPhone.trim(),
          radioChannel: contactRadio.trim()
        }
      });

      // Clear form on success
      setName('');
      setType(resourceTypes[0] || '');
      setLocationId('');
      setLocationSearch('');
      setCapacity('1');
      setCapabilityInput('');
      setCapabilities([]);
      setContactName('');
      setContactPhone('');
      setContactRadio('');
      setErrors({});
    } catch (err) {
      setErrors((prev) => ({ ...prev, submit: err.message || 'Registration failed.' }));
    }
  };

  return (
    <div className="panel resource-form-panel">
      <div className="form-heading">
        <div>
          <p className="eyebrow">RESOURCE REGISTRATION</p>
          <h2>Register Resource</h2>
        </div>
        <Package size={18} />
      </div>

      <form onSubmit={handleSubmit} className="resource-form">
        <label>
          <span>RESOURCE NAME *</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ambulance Unit Alpha-1"
            disabled={submitting}
          />
          {errors.name && <p className="form-error">{errors.name}</p>}
        </label>

        <label>
          <span>RESOURCE TYPE *</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            disabled={submitting || resourceTypes.length === 0}
          >
            {resourceTypes.length === 0 && <option value="">Loading resource types…</option>}
            {resourceTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {errors.type && <p className="form-error">{errors.type}</p>}
        </label>

        <label>
          <span>NETWORK LOCATION * ({locations.length} available)</span>
          {selectedLoc ? (
            <div className="selected-location-pill">
              <div>
                <strong>{selectedLoc.name}</strong>
                <small>
                  {selectedLoc.id} · {selectedLoc.type}
                </small>
              </div>
              <button
                type="button"
                className="clear-location-button"
                onClick={() => {
                  setLocationId('');
                  setLocationSearch('');
                }}
                disabled={submitting}
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
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  placeholder="Search locations by name or ID..."
                  disabled={submitting}
                />
              </div>
              {matchedLocations.length > 0 && (
                <div className="location-picker-results">
                  {matchedLocations.map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => {
                        setLocationId(loc.id);
                        setLocationSearch('');
                      }}
                    >
                      <MapPin size={13} />
                      <span>
                        <strong>{loc.name}</strong>
                        <small>
                          {loc.id} · {loc.type}
                        </small>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {errors.locationId && <p className="form-error">{errors.locationId}</p>}
        </label>

        <label>
          <span>CAPACITY *</span>
          <input
            type="number"
            min="1"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="1"
            disabled={submitting}
          />
          {errors.capacity && <p className="form-error">{errors.capacity}</p>}
        </label>

        <label>
          <span>CAPABILITIES (comma-separated, press Enter to add)</span>
          <div className="capabilities-input-row">
            <input
              type="text"
              value={capabilityInput}
              onChange={(e) => setCapabilityInput(e.target.value)}
              onKeyDown={handleCapabilityKeyDown}
              placeholder="e.g. Advanced Life Support, Defibrillator"
              disabled={submitting}
            />
            <button
              type="button"
              className="button button-quiet"
              onClick={addCapability}
              disabled={submitting}
              style={{ minWidth: '52px', fontSize: '11px' }}
            >
              Add
            </button>
          </div>
          {capabilities.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '6px' }}>
              {capabilities.map((cap) => (
                <span key={cap} className="capability-tag">
                  {cap}
                  <button
                    type="button"
                    onClick={() => removeCapability(cap)}
                    aria-label={`Remove ${cap}`}
                    disabled={submitting}
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </label>

        <div className="form-row-2">
          <label>
            <span>CONTACT NAME</span>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Operator name"
              disabled={submitting}
            />
          </label>
          <label>
            <span>CONTACT PHONE</span>
            <input
              type="text"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+1 555-0100"
              disabled={submitting}
            />
          </label>
        </div>

        <label>
          <span>RADIO CHANNEL</span>
          <input
            type="text"
            value={contactRadio}
            onChange={(e) => setContactRadio(e.target.value)}
            placeholder="e.g. CH-7"
            disabled={submitting}
          />
        </label>

        {errors.submit && <p className="form-error">{errors.submit}</p>}

        <button
          type="submit"
          className="button button-primary"
          disabled={submitting}
          style={{ width: '100%', marginTop: '6px' }}
        >
          <Plus size={15} />
          <span>{submitting ? 'Registering...' : 'Register Resource'}</span>
        </button>
      </form>
    </div>
  );
}
