import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient, apiErrorMessage } from '../services/api';

const NetworkContext = createContext(null);

export function NetworkProvider({ children }) {
  const [health, setHealth] = useState(null);
  const [locations, setLocations] = useState([]);
  const [roads, setRoads] = useState([]);
  const [roadGeometries, setRoadGeometries] = useState([]);
  const [geometryReady, setGeometryReady] = useState(false);
  const [geometryError, setGeometryError] = useState(null);
  const [risks, setRisks] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [route, setRoute] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedRoad, setSelectedRoad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 4200);
  }, []);

  const refreshEmergencies = useCallback(async () => {
    try {
      const data = await apiClient.emergencies();
      setEmergencies(data.emergencies || []);
      return data.emergencies;
    } catch (requestError) {
      console.warn('Failed to refresh emergencies:', apiErrorMessage(requestError));
    }
  }, []);

  const refreshNetwork = useCallback(async ({ quiet = false } = {}) => {
    if (!quiet) setLoading(true);
    try {
      const [healthData, locationData, roadData, riskData, emergencyData, resourceData, geometryResult] = await Promise.all([
        apiClient.health(),
        apiClient.locations(),
        apiClient.roads(),
        apiClient.risks(),
        apiClient.emergencies().catch(() => ({ emergencies: [] })),
        apiClient.resources().catch(() => ({ resources: [] })),
        apiClient.roadGeometry()
          .then((data) => ({ data }))
          .catch((requestError) => ({ error: apiErrorMessage(requestError) }))
      ]);
      setHealth(healthData);
      setLocations(locationData.locations || []);
      setRoads(roadData.roads || []);
      setRisks(riskData.risks || []);
      setEmergencies(emergencyData.emergencies || []);
      setResources(resourceData.resources || []);
      setRoadGeometries(geometryResult.data?.geometries || []);
      setGeometryReady(Boolean(geometryResult.data));
      setGeometryError(geometryResult.error || null);
      setLastUpdated(new Date());
      setError(null);
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  const refreshHealth = useCallback(async () => {
    try {
      setHealth(await apiClient.health());
      setError(null);
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    }
  }, []);

  const createEmergency = useCallback(async (payload) => {
    try {
      const result = await apiClient.createEmergency(payload);
      await refreshEmergencies();
      showToast(`Emergency ${result.emergency.emergencyId} registered successfully.`);
      return result.emergency;
    } catch (requestError) {
      const message = apiErrorMessage(requestError);
      showToast(message, 'error');
      throw new Error(message);
    }
  }, [refreshEmergencies, showToast]);

  const updateEmergency = useCallback(async (emergencyId, updates) => {
    try {
      const result = await apiClient.updateEmergency(emergencyId, updates);
      await refreshEmergencies();
      setSelectedEmergency((current) =>
        current?.emergencyId === emergencyId ? result.emergency : current
      );
      showToast(`Emergency ${emergencyId} updated.`);
      return result.emergency;
    } catch (requestError) {
      const message = apiErrorMessage(requestError);
      showToast(message, 'error');
      throw new Error(message);
    }
  }, [refreshEmergencies, showToast]);

  const updateEmergencyStatus = useCallback(async (emergencyId, status) => {
    try {
      const result = await apiClient.updateEmergencyStatus(emergencyId, status);
      await refreshEmergencies();
      setSelectedEmergency((current) =>
        current?.emergencyId === emergencyId ? result.emergency : current
      );
      showToast(`${emergencyId} status set to ${status}.`);
      return result.emergency;
    } catch (requestError) {
      const message = apiErrorMessage(requestError);
      showToast(message, 'error');
      throw new Error(message);
    }
  }, [refreshEmergencies, showToast]);

  const planRoute = useCallback(async (source, destination) => {
    try {
      const nextRoute = await apiClient.planRoute(source, destination);
      setRoute(nextRoute);
      showToast('Risk-aware route ready.');
      return nextRoute;
    } catch (requestError) {
      const message = apiErrorMessage(requestError);
      showToast(message, 'error');
      throw new Error(message);
    }
  }, [showToast]);

  const changeRoadStatus = useCallback(async (roadId, action) => {
    try {
      const result = action === 'block'
        ? await apiClient.blockRoad(roadId)
        : await apiClient.unblockRoad(roadId);
      await refreshNetwork({ quiet: true });
      setSelectedRoad((current) => current?.id === roadId
        ? { ...current, status: result.status }
        : current);
      showToast(`${roadId} is now ${result.status}.`);
      return result;
    } catch (requestError) {
      const message = apiErrorMessage(requestError);
      showToast(message, 'error');
      throw new Error(message);
    }
  }, [refreshNetwork, showToast]);

  useEffect(() => {
    refreshNetwork();
    const timer = window.setInterval(refreshHealth, 20000);
    return () => window.clearInterval(timer);
  }, [refreshNetwork, refreshHealth]);

  const value = useMemo(() => ({
    health,
    locations,
    roads,
    roadGeometries,
    geometryReady,
    geometryError,
    risks,
    emergencies,
    resources,
    selectedEmergency,
    setSelectedEmergency,
    refreshEmergencies,
    createEmergency,
    updateEmergency,
    updateEmergencyStatus,
    route,
    setRoute,
    selectedLocation,
    setSelectedLocation,
    selectedRoad,
    setSelectedRoad,
    loading,
    error,
    lastUpdated,
    toast,
    refreshNetwork,
    planRoute,
    changeRoadStatus
  }), [
    health,
    locations,
    roads,
    roadGeometries,
    geometryReady,
    geometryError,
    risks,
    emergencies,
    resources,
    selectedEmergency,
    refreshEmergencies,
    createEmergency,
    updateEmergency,
    updateEmergencyStatus,
    route,
    selectedLocation,
    selectedRoad,
    loading,
    error,
    lastUpdated,
    toast,
    refreshNetwork,
    planRoute,
    changeRoadStatus
  ]);

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) throw new Error('useNetwork must be used inside NetworkProvider.');
  return context;
}
