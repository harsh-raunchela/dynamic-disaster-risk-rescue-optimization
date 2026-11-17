import { useMemo, useState } from 'react';
import { Eye, Filter, Map as MapIcon, Search, Trash2 } from 'lucide-react';

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
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function ResourceList({
  resources,
  locations,
  resourceTypes,
  resourceStatuses,
  loading,
  error,
  onRetry,
  onSelect,
  onViewOnMap,
  onDelete
}) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');

  const locationsById = useMemo(
    () => new globalThis.Map(locations.map((loc) => [loc.id, loc])),
    [locations]
  );

  const filtered = useMemo(() => {
    let result = [...resources];

    if (typeFilter !== 'All') {
      result = result.filter((r) => r.type === typeFilter);
    }
    if (statusFilter !== 'All') {
      result = result.filter((r) => r.status === statusFilter);
    }
    if (locationFilter.trim()) {
      const q = locationFilter.trim().toLowerCase();
      result = result.filter(
        (r) =>
          r.locationId.toLowerCase().includes(q) ||
          (locationsById.get(r.locationId)?.name || '').toLowerCase().includes(q)
      );
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (r) =>
          r.resourceId.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q) ||
          (r.capabilities || []).some((capability) => capability.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return 0;
    });

    return result;
  }, [resources, typeFilter, statusFilter, locationFilter, search, sortBy, locationsById]);

  return (
    <div className="panel resource-list-panel">
      <div className="emergency-list-header">
        <div>
          <p className="eyebrow">RESOURCE REGISTRY</p>
          <h2>Resource Fleet &amp; Status</h2>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <label style={{ fontSize: '10px', fontWeight: 800, color: '#5f5b52', display: 'flex', alignItems: 'center', gap: '5px' }}>
            Sort:
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ border: '1px solid #bdb9af', background: '#fdfcf6', padding: '4px 7px', fontSize: '10px' }}
            >
              <option value="name">Name</option>
              <option value="status">Status</option>
            </select>
          </label>
        </div>
      </div>

      <div className="emergency-filters-bar">
        <div className="emergency-search-input">
          <Search size={14} />
          <input
            type="text"
            placeholder="Search by ID or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filters-group">
          <label>
            <Filter size={12} />
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="All">All Types</option>
              {resourceTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              {resourceStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <div className="emergency-search-input" style={{ minWidth: '160px' }}>
            <Search size={12} />
            <input
              type="text"
              placeholder="Filter by location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="resource-table-container">
        <table>
          <thead>
            <tr>
              <th style={{ width: '110px' }}>RESOURCE ID</th>
              <th>NAME &amp; TYPE</th>
              <th>LOCATION</th>
              <th style={{ width: '80px', textAlign: 'right' }}>CAPACITY</th>
              <th style={{ width: '110px' }}>STATUS</th>
              <th style={{ width: '130px' }}>LAST UPDATED</th>
              <th style={{ width: '90px', textAlign: 'center' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-neutral-500">
                  Loading resources…
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-neutral-500">
                  <div className="resource-table-error">
                    <span>Unable to load the resource registry.</span>
                    <button type="button" className="button button-quiet" onClick={onRetry}>Retry</button>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-neutral-500">
                  No resources match the selected search or filters.
                </td>
              </tr>
            ) : (
              filtered.map((resource) => {
                const loc = locationsById.get(resource.locationId);
                const statusColor = STATUS_COLORS[resource.status] || '#666';
                const typeColor = TYPE_COLORS[resource.type] || '#888';
                const canDelete = resource.canDelete === true;

                return (
                  <tr
                    key={resource.resourceId}
                    onClick={() => onSelect(resource)}
                    className="resource-row"
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <strong className="font-mono text-xs">{resource.resourceId}</strong>
                    </td>
                    <td>
                      <div className="title-type-cell">
                        <strong>{resource.name}</strong>
                        <small style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span
                            className="resource-type-dot"
                            style={{ background: typeColor }}
                          />
                          {resource.type}
                        </small>
                      </div>
                    </td>
                    <td>
                      <div className="location-cell">
                        <strong>{loc ? loc.name : resource.locationId}</strong>
                        <small>{resource.locationId}</small>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="font-bold">{resource.capacity}</span>
                    </td>
                    <td>
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
                    </td>
                    <td>
                      <small className="text-neutral-500 text-xs">
                        {formatDate(resource.updatedAt)}
                      </small>
                    </td>
                    <td>
                      <div className="action-buttons-cell" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="icon-button"
                          title="View Resource Details"
                          onClick={() => onSelect(resource)}
                          aria-label="View details"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          type="button"
                          className="icon-button"
                          title="View Location on Live Map"
                          onClick={() => onViewOnMap(resource)}
                          aria-label="View on map"
                        >
                          <MapIcon size={13} />
                        </button>
                        <button
                          type="button"
                          className="icon-button"
                          title={
                            canDelete
                              ? 'Delete Resource'
                              : 'Cannot delete operational resource'
                          }
                          onClick={() => canDelete && onDelete(resource)}
                          disabled={!canDelete}
                          aria-label="Delete resource"
                          style={canDelete ? { color: '#e14949', borderColor: '#e14949' } : {}}
                        >
                          <Trash2 size={13} />
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
