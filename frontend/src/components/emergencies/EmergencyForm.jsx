import { useState } from 'react';
import { AlertTriangle, MapPin, Plus, Search, X } from 'lucide-react';

const EMERGENCY_TYPES = [
  'Flood',
  'Fire',
  'Earthquake',
  'Landslide',
  'Road Accident',
  'Building Collapse',
  'Other'
];

const SEVERITIES = ['Critical', 'High', 'Medium', 'Low'];

export function EmergencyForm({ locations, onSubmit, submitting }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Flood');
  const [severity, setSeverity] = useState('High');
  const [locationId, setLocationId] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [peopleAffected, setPeopleAffected] = useState('10');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});

  const matchedLocations = locationSearch.trim()
    ? locations.filter((loc) =>
        loc.id.toLowerCase().includes(locationSearch.toLowerCase()) ||
        loc.name.toLowerCase().includes(locationSearch.toLowerCase())
      ).slice(0, 8)
    : [];

  const selectedLoc = locations.find((loc) => loc.id === locationId);

  const validate = () => {
    const nextErrors = {};
    if (!title.trim()) nextErrors.title = 'Incident title is required.';
    else if (title.trim().length > 150) nextErrors.title = 'Title must be 150 characters or less.';

    if (!locationId) nextErrors.locationId = 'A valid network location must be selected.';
    else if (!locations.some((l) => l.id === locationId)) {
      nextErrors.locationId = 'Selected location does not exist in the disaster network.';
    }

    const people = parseInt(peopleAffected, 10);
    if (isNaN(people) || people < 0) {
      nextErrors.peopleAffected = 'People affected must be a non-negative integer.';
    }

    if (description.length > 1000) {
      nextErrors.description = 'Description cannot exceed 1000 characters.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await onSubmit({
        title: title.trim(),
        type,
        severity,
        locationId,
        peopleAffected: parseInt(peopleAffected, 10),
        description: description.trim()
      });

      // Clear form on success
      setTitle('');
      setLocationId('');
      setLocationSearch('');
      setDescription('');
      setPeopleAffected('10');
      setSeverity('High');
      setType('Flood');
      setErrors({});
    } catch (err) {
      setErrors((prev) => ({ ...prev, submit: err.message || 'Registration failed.' }));
    }
  };

  return (
    <div className="panel emergency-form-panel">
      <div className="form-heading">
        <div>
          <p className="eyebrow">INCIDENT REGISTRATION</p>
          <h2>Report Emergency</h2>
        </div>
        <AlertTriangle size={18} className="text-amber-500" />
      </div>

      <form onSubmit={handleSubmit} className="emergency-form">
        <label>
          <span>INCIDENT TITLE *</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Flash Flood Inundation near Sector Alpha"
            disabled={submitting}
          />
          {errors.title && <p className="form-error">{errors.title}</p>}
        </label>

        <div className="form-row-2">
          <label>
            <span>INCIDENT TYPE *</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={submitting}
            >
              {EMERGENCY_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>

          <label>
            <span>SEVERITY LEVEL *</span>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              disabled={submitting}
            >
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>

        <label>
          <span>NETWORK LOCATION * ({locations.length} available)</span>
          {selectedLoc ? (
            <div className="selected-location-pill">
              <div>
                <strong>{selectedLoc.name}</strong>
                <small>{selectedLoc.id} · {selectedLoc.type}</small>
              </div>
              <button
                type="button"
                className="clear-location-button"
                onClick={() => { setLocationId(''); setLocationSearch(''); }}
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
                  placeholder={`Search ${locations.length || 'network'} locations by name or ID (e.g. LOC_0010)...`}
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
                        <small>{loc.id} · {loc.type}</small>
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
          <span>ESTIMATED PEOPLE AFFECTED</span>
          <input
            type="number"
            min="0"
            value={peopleAffected}
            onChange={(e) => setPeopleAffected(e.target.value)}
            placeholder="0"
            disabled={submitting}
          />
          {errors.peopleAffected && <p className="form-error">{errors.peopleAffected}</p>}
        </label>

        <label>
          <span>INCIDENT DESCRIPTION</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Provide operational context, hazards, or immediate road access constraints..."
            disabled={submitting}
          />
          {errors.description && <p className="form-error">{errors.description}</p>}
        </label>

        {errors.submit && <p className="form-error">{errors.submit}</p>}

        <button
          type="submit"
          className="button button-primary submit-emergency-button"
          disabled={submitting}
        >
          <Plus size={15} />
          <span>{submitting ? 'Registering Incident...' : 'Register Simulated Incident'}</span>
        </button>
      </form>
    </div>
  );
}

