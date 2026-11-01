const { Router } = require('express');
const { createApiController } = require('../controllers/apiController');

function createApiRouter(workerClient) {
  const router = Router();
  const controller = createApiController(workerClient);

  router.get('/health', controller.health);
  router.get('/locations', controller.locations);
  router.get('/roads', controller.roads);
  router.get('/risks', controller.risks);
  router.post('/routes/plan', controller.planRoute);
  router.post('/roads/:roadId/block', controller.blockRoad);
  router.post('/roads/:roadId/unblock', controller.unblockRoad);

  return router;
}

module.exports = { createApiRouter };
