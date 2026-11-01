import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient, apiErrorMessage } from '../services/api';

const NetworkContext = createContext(null);

export function NetworkProvider({ children }) {
  const [health, setHealth] = useState(null);
  const [locations, setLocations] = useState([]);
  const [roads, setRoads] = useState([]);
  const [risks, setRisks] = useState([]);
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

  const refreshNetwork = useCallback(async ({ quiet = false } = {}) => {
    if (!quiet) setLoading(true);
    try {
      const [healthData, locationData, roadData, riskData] = await Promise.all([
        apiClient.health(), apiClient.locations(), apiClient.roads(), apiClient.risks()
      ]);
      setHealth(healthData);
      setLocations(locationData.locations || []);
      setRoads(roadData.roads || []);
      setRisks(riskData.risks || []);
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
    health, locations, roads, risks, route, setRoute, selectedLocation, setSelectedLocation,
    selectedRoad, setSelectedRoad, loading, error, lastUpdated, toast, refreshNetwork,
    planRoute, changeRoadStatus
  }), [health, locations, roads, risks, route, selectedLocation, selectedRoad, loading,
    error, lastUpdated, toast, refreshNetwork, planRoute, changeRoadStatus]);

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) throw new Error('useNetwork must be used inside NetworkProvider.');
  return context;
}
