import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: { Accept: 'application/json' }
});

function unwrap(response) {
  return response.data.data;
}

export const apiClient = {
  health: () => api.get('/health').then(unwrap),
  locations: () => api.get('/locations').then(unwrap),
  roads: () => api.get('/roads').then(unwrap),
  roadGeometry: (params) => api.get('/roads/geometry', { params }).then(unwrap),
  risks: () => api.get('/risks').then(unwrap),
  planRoute: (sourceLocationId, destinationLocationId) =>
    api.post('/routes/plan', { sourceLocationId, destinationLocationId }).then(unwrap),
  blockRoad: (roadId) => api.post(`/roads/${encodeURIComponent(roadId)}/block`).then(unwrap),
  unblockRoad: (roadId) => api.post(`/roads/${encodeURIComponent(roadId)}/unblock`).then(unwrap),

  // Emergency Management (Phase 3.6)
  emergencies: (params) => api.get('/emergencies', { params }).then(unwrap),
  activeEmergencies: () => api.get('/emergencies/active').then(unwrap),
  priorityEmergencies: () => api.get('/emergencies/priority').then(unwrap),
  emergencyStats: () => api.get('/emergencies/stats').then(unwrap),
  getEmergency: (id) => api.get(`/emergencies/${encodeURIComponent(id)}`).then(unwrap),
  createEmergency: (data) => api.post('/emergencies', data).then(unwrap),
  updateEmergency: (id, updates) => api.patch(`/emergencies/${encodeURIComponent(id)}`, updates).then(unwrap),
  updateEmergencyStatus: (id, status) => api.patch(`/emergencies/${encodeURIComponent(id)}/status`, { status }).then(unwrap),

  // Resource Management (Phase 3.7)
  resourceMetadata: () => api.get('/resources/metadata').then(unwrap),
  resources: (params) => api.get('/resources', { params }).then(unwrap),
  availableResources: (params) => api.get('/resources/available', { params }).then(unwrap),
  getResource: (id) => api.get(`/resources/${encodeURIComponent(id)}`).then(unwrap),
  createResource: (data) => api.post('/resources', data).then(unwrap),
  updateResource: (id, updates) => api.patch(`/resources/${encodeURIComponent(id)}`, updates).then(unwrap),
  updateResourceStatus: (id, status) => api.patch(`/resources/${encodeURIComponent(id)}/status`, { status }).then(unwrap),
  deleteResource: (id) => api.delete(`/resources/${encodeURIComponent(id)}`).then(unwrap)
};

export function apiErrorMessage(error) {
  return error?.response?.data?.error?.message ||
    error?.message || 'The backend could not complete this operation.';
}
