const { routeRequest, roadIdParam } = require('../validators/requestValidators');

function asyncRoute(handler) {
  return (request, response, next) => {
    Promise.resolve(handler(request, response)).catch(next);
  };
}

function createApiController(workerClient) {
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
