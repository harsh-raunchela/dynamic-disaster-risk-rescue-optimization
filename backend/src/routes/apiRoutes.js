const { Router } = require('express');
const { createApiController } = require('../controllers/apiController');
const { createEmergencyController } = require('../controllers/emergencyController');
const { createResourceController } = require('../controllers/resourceController');

function createApiRouter(workerClient, emergencyService = null, resourceService = null, roadGeometryService = null) {
  const router = Router();
  const controller = createApiController(workerClient, roadGeometryService);

  // Network & Routing Endpoints
  router.get('/health', controller.health);
  router.get('/locations', controller.locations);
  router.get('/roads', controller.roads);
  router.get('/roads/geometry', controller.roadGeometry);
  router.get('/risks', controller.risks);
  router.post('/routes/plan', controller.planRoute);
  router.post('/roads/:roadId/block', controller.blockRoad);
  router.post('/roads/:roadId/unblock', controller.unblockRoad);

  // Emergency Management Endpoints (Phase 3.6)
  if (emergencyService) {
    const emgController = createEmergencyController(emergencyService);

    router.get('/emergencies/active', emgController.getActive);
    router.get('/emergencies/priority', emgController.getPriority);
    router.get('/emergencies/stats', emgController.getStats);
    router.get('/emergencies', emgController.getAll);
    router.post('/emergencies', emgController.create);
    router.get('/emergencies/:emergencyId', emgController.getById);
    router.patch('/emergencies/:emergencyId/status', emgController.updateStatus);
    router.patch('/emergencies/:emergencyId', emgController.update);
  }

  // Resource Management Endpoints (Phase 3.7)
  if (resourceService) {
    const resController = createResourceController(resourceService);

    router.get('/resources/metadata', resController.getMetadata);
    router.get('/resources/available', resController.getAvailable);
    router.get('/resources', resController.getAll);
    router.post('/resources', resController.create);
    router.get('/resources/:resourceId', resController.getById);
    router.patch('/resources/:resourceId/status', resController.updateStatus);
    router.patch('/resources/:resourceId', resController.update);
    router.delete('/resources/:resourceId', resController.delete);
  }

  return router;
}

module.exports = { createApiRouter };
