import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Info, RefreshCw } from 'lucide-react';
import { apiClient, apiErrorMessage } from '../services/api';
import { useNetwork } from '../context/NetworkContext';
import { ResourceStats } from '../components/resources/ResourceStats';
import { ResourceForm } from '../components/resources/ResourceForm';
import { ResourceList } from '../components/resources/ResourceList';
import { ResourceDetailModal } from '../components/resources/ResourceDetailModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export function ResourcesPage() {
  const { locations, showToast } = useNetwork();
  const navigate = useNavigate();

  const [resources, setResources] = useState([]);
  const [resourceTypes, setResourceTypes] = useState([]);
  const [resourceStatuses, setResourceStatuses] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeModal, setActiveModal] = useState(null);       // resource object for detail modal
  const [deleteTarget, setDeleteTarget] = useState(null);     // resource object for confirm dialog
  const [deleteBusy, setDeleteBusy] = useState(false);

  // ── Load all resources ──────────────────────────────────────────────────────
  const loadResources = useCallback(async () => {
    setLoadingResources(true);
    setLoadError(null);
    try {
      const [data, metadata] = await Promise.all([
        apiClient.resources(),
        apiClient.resourceMetadata()
      ]);
      setResources(data.resources || []);
      setResourceTypes(metadata.resourceTypes || []);
      setResourceStatuses(metadata.resourceStatuses || []);
    } catch (err) {
      const message = apiErrorMessage(err);
      setLoadError(message);
      showToast(message, 'error');
    } finally {
      setLoadingResources(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  // Keep modal resource up to date after mutations
  const currentModal = activeModal
    ? resources.find((r) => r.resourceId === activeModal.resourceId) || activeModal
    : null;

  // ── Register ────────────────────────────────────────────────────────────────
  const handleRegister = async (payload) => {
    setSubmitting(true);
    try {
      const data = await apiClient.createResource(payload);
      await loadResources();
      showToast(`${data.resource.resourceId} registered successfully.`);
    } catch (err) {
      const message = apiErrorMessage(err);
      showToast(message, 'error');
      throw new Error(message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Update fields ───────────────────────────────────────────────────────────
  const handleUpdate = async (resourceId, updates) => {
    try {
      const data = await apiClient.updateResource(resourceId, updates);
      await loadResources();
      showToast(`${resourceId} updated.`);
      return data.resource;
    } catch (err) {
      const message = apiErrorMessage(err);
      showToast(message, 'error');
      throw new Error(message);
    }
  };

  // ── Update status ───────────────────────────────────────────────────────────
  const handleStatusChange = async (resourceId, status) => {
    try {
      const data = await apiClient.updateResourceStatus(resourceId, status);
      await loadResources();
      showToast(`${resourceId} status → ${status}.`);
      return data.resource;
    } catch (err) {
      const message = apiErrorMessage(err);
      showToast(message, 'error');
      throw new Error(message);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDeleteRequest = (resource) => {
    setDeleteTarget(resource);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    try {
      await apiClient.deleteResource(deleteTarget.resourceId);
      await loadResources();
      showToast(`${deleteTarget.resourceId} deleted.`);
      setDeleteTarget(null);
      if (activeModal?.resourceId === deleteTarget.resourceId) {
        setActiveModal(null);
      }
    } catch (err) {
      showToast(apiErrorMessage(err), 'error');
    } finally {
      setDeleteBusy(false);
    }
  };

  // ── View on map ─────────────────────────────────────────────────────────────
  const handleViewOnMap = (resource) => {
    navigate(`/map?locationId=${encodeURIComponent(resource.locationId)}`);
  };

  return (
    <div className="page-content resources-page">
      {/* Simulation banner */}
      <div className="simulation-banner mb-4">
        <Info size={16} /> SIMULATED RESOURCE DATA · DISASTERX RESOURCE MANAGEMENT (NOT LIVE REAL-WORLD DATA)
      </div>

      {/* Page intro */}
      <div className="page-intro">
        <p className="eyebrow">PHASE 3.7.3 OPERATIONAL SUBSYSTEM</p>
        <h2>
          Resource Management<br />
          <em style={{ fontStyle: 'normal', color: '#e7ee1e', fontSize: '0.6em', letterSpacing: '0' }}>
            &amp; Fleet Status
          </em>
        </h2>
        <p>
          Register, track and manage emergency response resources across the disaster network.
          Monitor fleet status, trigger controlled status transitions, and inspect resource
          locations on the live map.
        </p>
      </div>

      {/* Stats row */}
      {loadingResources ? (
        <div style={{ padding: '20px 0', color: '#777', fontSize: '12px' }}>Loading resource metrics…</div>
      ) : (
        <ResourceStats resources={resources} />
      )}

      {loadError && (
        <div className="resource-load-error" role="alert">
          <AlertTriangle size={16} />
          <span>Resource data could not be loaded: {loadError}</span>
          <button type="button" className="button button-quiet" onClick={loadResources}>
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      )}

      {/* Two-column workspace */}
      <div className="resources-workspace-grid">
        <aside>
          <ResourceForm
            locations={locations}
            resourceTypes={resourceTypes}
            onSubmit={handleRegister}
            submitting={submitting}
          />
        </aside>

        <main>
          <ResourceList
            resources={resources}
            locations={locations}
            resourceTypes={resourceTypes}
            resourceStatuses={resourceStatuses}
            loading={loadingResources}
            error={loadError}
            onRetry={loadResources}
            onSelect={(resource) => setActiveModal(resource)}
            onViewOnMap={handleViewOnMap}
            onDelete={handleDeleteRequest}
          />
        </main>
      </div>

      {/* Detail modal */}
      {currentModal && (
        <ResourceDetailModal
          resource={currentModal}
          locations={locations}
          resourceTypes={resourceTypes}
          onClose={() => setActiveModal(null)}
          onUpdate={handleUpdate}
          onStatusChange={handleStatusChange}
          onDelete={handleDeleteRequest}
          onViewOnMap={handleViewOnMap}
        />
      )}

      {/* Deletion confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Resource"
        detail={`Permanently delete "${deleteTarget?.name}" (${deleteTarget?.resourceId})? This cannot be undone.`}
        confirmLabel="Delete Resource"
        busy={deleteBusy}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

