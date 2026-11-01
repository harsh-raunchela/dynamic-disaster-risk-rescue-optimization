export const riskRank = { Low: 1, Medium: 2, High: 3, Critical: 4 };

export const riskColors = {
  Low: '#38a169',
  Medium: '#d99a1d',
  High: '#e76f3c',
  Critical: '#e14949',
  Unknown: '#747474'
};

export const statusColors = {
  Open: '#9ee76c',
  Restricted: '#f1b738',
  Closed: '#e14949'
};

export function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value || 0);
}

export function riskForLocation(locationId, risks) {
  return risks.reduce((highest, item) => {
    if (item.source !== locationId && item.destination !== locationId) return highest;
    return (riskRank[item.risk] || 0) > (riskRank[highest] || 0) ? item.risk : highest;
  }, 'Low');
}

export function locationIndex(locations) {
  return new Map(locations.map((location) => [location.id, location]));
}

export function networkMetrics(locations, roads, risks) {
  const blockedRoads = roads.filter((road) => road.status === 'Closed').length;
  const restrictedRoads = roads.filter((road) => road.status === 'Restricted').length;
  const highRiskRoads = risks.filter((risk) => ['High', 'Critical'].includes(risk.risk)).length;
  const available = roads.length ? Math.round(((roads.length - blockedRoads) / roads.length) * 100) : 0;
  return { blockedRoads, restrictedRoads, highRiskRoads, available, totalLocations: locations.length, totalRoads: roads.length };
}
