const express = require('express');
const { createApiRouter } = require('./routes/apiRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

function createApp(workerClient, emergencyService = null, resourceService = null, roadGeometryService = null) {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '32kb', strict: true }));
  app.use('/api', createApiRouter(workerClient, emergencyService, resourceService, roadGeometryService));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
