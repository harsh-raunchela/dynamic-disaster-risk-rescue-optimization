import { useMemo, useState } from 'react';
import { ArrowUpDown, Eye, Filter, Map as MapIcon, Search, ShieldAlert, Sparkles } from 'lucide-react';
import { formatNumber, riskColors } from '../../utils/network';

const SEVERITY_COLORS = {
  Critical: '#e14949',
  High: '#e76f3c',
  Medium: '#d99a1d',
  Low: '#38a169'
};

const STATUS_BADGES = {
  Reported: { bg: '#edebe2', text: '#55524b', label: 'Reported' },
  Prioritized: { bg: '#fef3c7', text: '#92400e', label: 'Prioritized' },
  Assigned: { bg: '#e0e7ff', text: '#3730a3', label: 'Assigned' },
  Responding: { bg: '#fef08a', text: '#854d0e', label: 'Responding' },
  Resolved: { bg: '#dcfce7', text: '#166534', label: 'Resolved' }
};

export function EmergencyList({
  emergencies,
  locations,
  onSelectEmergency,
  onViewOnMap
}) {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortByPriority, setSortByPriority] = useState(true);

  const locationsById = useMemo(() => new globalThis.Map(locations.map((loc) => [loc.id, loc])), [locations]);

  const filteredEmergencies = useMemo(() => {
    let result = [...emergencies];

    if (severityFilter !== 'All') {
      result = result.filter((e) => e.severity === severityFilter);
    }

    if (typeFilter !== 'All') {
      result = result.filter((e) => e.type === typeFilter);
    }

    if (statusFilter !== 'All') {
      if (statusFilter === 'Active') {
        result = result.filter((e) => e.status !== 'Resolved');
      } else {
        result = result.filter((e) => e.status === statusFilter);
      }
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((e) =>
        e.emergencyId.toLowerCase().includes(q) ||
        e.title.toLowerCase().includes(q) ||
        e.locationId.toLowerCase().includes(q) ||
        (locationsById.get(e.locationId)?.name || '').toLowerCase().includes(q)
      );
    }

    if (sortByPriority) {
      result.sort((a, b) => {
        // Active priority ranks first
        if (a.priority && b.priority) return a.priority - b.priority;
        if (a.priority && !b.priority) return -1;
        if (!a.priority && b.priority) return 1;
        // Resolved or unranked: newest first
        return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
      });
    }

    return result;
  }, [emergencies, severityFilter, typeFilter, statusFilter, search, sortByPriority, locationsById]);

  return (
    <div className="panel emergency-list-panel">
      <div className="emergency-list-header">
        <div>
          <p className="eyebrow">DISASTER INCIDENT REGISTRY</p>
          <h2>Emergency Priority Queue & Records</h2>
        </div>
        <div className="view-mode-toggle">
          <button
            type="button"
            className={`toggle-button ${sortByPriority ? 'active' : ''}`}
            onClick={() => setSortByPriority(true)}
          >
            <Sparkles size={13} />
            <span>Priority Queue Order</span>
          </button>
          <button
            type="button"
            className={`toggle-button ${!sortByPriority ? 'active' : ''}`}
            onClick={() => setSortByPriority(false)}
          >
            <ArrowUpDown size={13} />
            <span>Chronological</span>
          </button>
        </div>
      </div>

      <div className="emergency-filters-bar">
        <div className="emergency-search-input">
          <Search size={14} />
          <input
            type="text"
            placeholder="Search by ID, title, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filters-group">
          <label>
            <Filter size={12} />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </label>

          <label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="Flood">Flood</option>
              <option value="Fire">Fire</option>
              <option value="Earthquake">Earthquake</option>
              <option value="Landslide">Landslide</option>
              <option value="Road Accident">Road Accident</option>
              <option value="Building Collapse">Building Collapse</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Reported">Reported</option>
              <option value="Prioritized">Prioritized</option>
              <option value="Assigned">Assigned</option>
              <option value="Responding">Responding</option>
              <option value="Resolved">Resolved</option>
            </select>
          </label>
        </div>
      </div>

      <div className="emergency-table-container">
        <table>
          <thead>
            <tr>
              <th style={{ width: '70px' }}>PRIORITY</th>
              <th style={{ width: '100px' }}>INCIDENT ID</th>
              <th>INCIDENT TITLE & TYPE</th>
              <th style={{ width: '90px' }}>SEVERITY</th>
              <th>LOCATION</th>
              <th style={{ width: '75px', textAlign: 'right' }}>AFFECTED</th>
              <th style={{ width: '130px' }}>REPORTED AT</th>
              <th style={{ width: '100px' }}>STATUS</th>
              <th style={{ width: '90px', textAlign: 'center' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmergencies.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-8 text-neutral-500">
                  No emergencies match the selected search or filters.
                </td>
              </tr>
            ) : (
              filteredEmergencies.map((emg) => {
                const loc = locationsById.get(emg.locationId);
                const statusMeta = STATUS_BADGES[emg.status] || STATUS_BADGES.Reported;
                const severityColor = SEVERITY_COLORS[emg.severity] || '#666';

                return (
                  <tr
                    key={emg.emergencyId}
                    onClick={() => onSelectEmergency(emg)}
                    className="emergency-row cursor-pointer"
                  >
                    <td>
                      {emg.priority ? (
                        <span className="priority-badge">#{emg.priority}</span>
                      ) : (
                        <span className="priority-badge priority-resolved">—</span>
                      )}
                    </td>
                    <td>
                      <strong className="font-mono text-xs">{emg.emergencyId}</strong>
                    </td>
                    <td>
                      <div className="title-type-cell">
                        <strong>{emg.title}</strong>
                        <small className="data-tag">{emg.type}</small>
                      </div>
                    </td>
                    <td>
                      <span
                        className="severity-pill"
                        style={{
                          backgroundColor: `${severityColor}20`,
                          color: severityColor,
                          borderColor: severityColor
                        }}
                      >
                        {emg.severity}
                      </span>
                    </td>
                    <td>
                      <div className="location-cell">
                        <strong>{loc ? loc.name : emg.locationId}</strong>
                        <small>{emg.locationId}</small>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="font-bold">{formatNumber(emg.peopleAffected)}</span>
                    </td>
                    <td>
                      <small className="text-neutral-500 text-xs">
                        {new Date(emg.reportedAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </small>
                    </td>
                    <td>
                      <span
                        className="status-pill"
                        style={{
                          backgroundColor: statusMeta.bg,
                          color: statusMeta.text
                        }}
                      >
                        {statusMeta.label}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons-cell" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="icon-button"
                          title="View Emergency Details"
                          onClick={() => onSelectEmergency(emg)}
                          aria-label="View details"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          type="button"
                          className="icon-button"
                          title="View Location on Live Map"
                          onClick={() => onViewOnMap(emg)}
                          aria-label="View on map"
                        >
                          <MapIcon size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

