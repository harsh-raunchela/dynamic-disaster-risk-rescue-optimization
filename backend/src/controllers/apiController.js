const { routeRequest, roadIdParam } = require('../validators/requestValidators');
const { BackendError } = require('../services/errors');

function asyncRoute(handler) {
  return (request, response, next) => {
    Promise.resolve(handler(request, response)).catch(next);
  };
}

function geometryIdsFromQuery(query) {
  if (!query.roadIds) return null;
  if (typeof query.roadIds !== 'string') {
    throw new BackendError('Query parameter "roadIds" must be a comma-separated string.', {
      status: 400,
      code: 'INVALID_ROAD_GEOMETRY_QUERY'
    });
  }

  const ids = [...new Set(query.roadIds.split(',').map((id) => id.trim()).filter(Boolean))];
  if (!ids.length) {
    throw new BackendError('Query parameter "roadIds" must include at least one road ID.', {
      status: 400,
      code: 'INVALID_ROAD_GEOMETRY_QUERY'
    });
  }
  return ids;
}

function createApiController(workerClient, roadGeometryService = null) {
  return {
    health: asyncRoute(async (_request, response) => {
      response.json({ ok: true, data: await workerClient.health() });
    }),
    locations: asyncRoute(async (_request, response) => {
      response.json({ ok: true, data: await workerClient.getLocations() });
    }),
    roads: asyncRoute(async (_request, response) => {
      response.json({ ok: true, data: await workerClient.getRoads() });
    }),
    roadGeometry: asyncRoute(async (request, response) => {
      if (!roadGeometryService) {
        throw new BackendError('Road geometry service is not configured.', {
          status: 503,
          code: 'ROAD_GEOMETRY_UNAVAILABLE'
        });
      }

      if (request.query.roadId && request.query.roadIds) {
        throw new BackendError('Use either "roadId" or "roadIds", not both.', {
          status: 400,
          code: 'INVALID_ROAD_GEOMETRY_QUERY'
        });
      }
      if (request.query.roadId !== undefined) {
        if (typeof request.query.roadId !== 'string' || !request.query.roadId.trim()) {
          throw new BackendError('Query parameter "roadId" must be a non-empty string.', {
            status: 400,
            code: 'INVALID_ROAD_GEOMETRY_QUERY'
          });
        }
        response.json({ ok: true, data: { geometry: await roadGeometryService.getOne(request.query.roadId.trim()) } });
        return;
      }

      const requestedIds = geometryIdsFromQuery(request.query);
      const geometries = requestedIds
        ? await roadGeometryService.getMany(requestedIds)
        : await roadGeometryService.getAll();
      response.json({ ok: true, data: { geometryCount: geometries.length, geometries } });
    }),
    risks: asyncRoute(async (_request, response) => {
      response.json({ ok: true, data: await workerClient.getRisks() });
    }),
    planRoute: asyncRoute(async (request, response) => {
      const { sourceLocationId, destinationLocationId } = routeRequest(request.body);
      response.json({
        ok: true,
        data: await workerClient.planRoute(sourceLocationId, destinationLocationId)
      });
    }),
    blockRoad: asyncRoute(async (request, response) => {
      response.json({
        ok: true,
        data: await workerClient.blockRoad(roadIdParam(request.params))
      });
    }),
    unblockRoad: asyncRoute(async (request, response) => {
      response.json({
        ok: true,
        data: await workerClient.unblockRoad(roadIdParam(request.params))
      });
    })
  };
}

module.exports = { createApiController };
