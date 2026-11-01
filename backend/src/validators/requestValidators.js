const { BackendError } = require('../services/errors');

function requiredIdentifier(body, field, label) {
  const value = body?.[field];
  if (typeof value !== 'string' || value.trim() === '' || value.length > 100) {
    throw new BackendError(`${label} is required and must be a short string.`, {
      status: 400,
      code: 'INVALID_INPUT'
    });
  }
  return value.trim();
}

function routeRequest(body) {
  return {
    sourceLocationId: requiredIdentifier(body, 'sourceLocationId', 'Source location ID'),
    destinationLocationId: requiredIdentifier(body, 'destinationLocationId', 'Destination location ID')
  };
}

function roadIdParam(params) {
  return requiredIdentifier(params, 'roadId', 'Road ID');
}

module.exports = { routeRequest, roadIdParam };
