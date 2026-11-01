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
  risks: () => api.get('/risks').then(unwrap),
  planRoute: (sourceLocationId, destinationLocationId) =>
    api.post('/routes/plan', { sourceLocationId, destinationLocationId }).then(unwrap),
  blockRoad: (roadId) => api.post(`/roads/${encodeURIComponent(roadId)}/block`).then(unwrap),
  unblockRoad: (roadId) => api.post(`/roads/${encodeURIComponent(roadId)}/unblock`).then(unwrap)
};

export function apiErrorMessage(error) {
  return error?.response?.data?.error?.message ||
    error?.message || 'The backend could not complete this operation.';
}
