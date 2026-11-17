const { createConfig } = require('./config/config');
const { WorkerManager } = require('./services/workerManager');
const { WorkerClient } = require('./services/workerClient');
const { EmergencyStore } = require('./services/emergencyStore');
const { EmergencyService } = require('./services/emergencyService');
const { ResourceStore } = require('./services/resourceStore');
const { ResourceService } = require('./services/resourceService');
const { RoadGeometryService } = require('./services/roadGeometryService');
const { createApp } = require('./app');

async function startServer(config = createConfig(), options = {}) {
  const manager = new WorkerManager(config);
  manager.on('diagnostic', (message) => {
    process.stderr.write(`[DisasterX C++ worker] ${message}`);
  });
  manager.on('protocolError', (error) => {
    console.error(`[DisasterX backend] worker protocol error: ${error.message}`);
  });
  manager.on('exit', ({ code, signal, wasStopping }) => {
    if (!wasStopping) {
      console.error(
        `[DisasterX backend] worker exited unexpectedly (code ${code}, signal ${signal || 'none'}).`
      );
    }
  });

  await manager.start();

  let workerClient;
  let emergencyStore;
  let emergencyService;
  let resourceStore;
  let resourceService;
  let roadGeometryService;
  let app;
  let server;

  try {
    workerClient = new WorkerClient(manager, config);

    emergencyStore = options.emergencyStore || new EmergencyStore(config.emergenciesFile);
    await emergencyStore.init();

    emergencyService = options.emergencyService || new EmergencyService(emergencyStore, workerClient);
    await emergencyService.init();

    resourceStore = options.resourceStore || new ResourceStore(config.resourcesFile);
    await resourceStore.init();

    resourceService = options.resourceService || new ResourceService(resourceStore, workerClient);
    await resourceService.init();

    roadGeometryService = options.roadGeometryService || new RoadGeometryService(config.roadGeometryFile);
    await roadGeometryService.init();

    app = createApp(workerClient, emergencyService, resourceService, roadGeometryService);

    server = await new Promise((resolve, reject) => {
      const instance = app.listen(config.port, () => resolve(instance));
      instance.once('error', reject);
    });
  } catch (startupError) {
    // Prevent orphaned C++ worker if server listen or service init fails
    try {
      await manager.stop();
    } catch {
      // Ignore secondary stop error during startup failure cleanup
    }
    throw startupError;
  }

  return {
    app,
    server,
    manager,
    config,
    emergencyService,
    emergencyStore,
    resourceService,
    resourceStore,
    roadGeometryService
  };
}

async function stopServer(runtime) {
  if (!runtime) return;

  if (runtime.server && runtime.server.listening) {
    if (typeof runtime.server.closeAllConnections === 'function') {
      runtime.server.closeAllConnections();
    }
    await new Promise((resolve) => {
      runtime.server.close(() => resolve());
    });
  }

  if (runtime.manager) {
    await runtime.manager.stop();
  }
}

if (require.main === module) {
  let runtime;
  let stopping = false;

  const shutdown = async (signal) => {
    if (stopping) return;
    stopping = true;
    console.log(`\n[DisasterX backend] Received ${signal || 'shutdown signal'}, stopping cleanly...`);
    try {
      if (runtime) await stopServer(runtime);
      console.log('[DisasterX backend] Server and worker stopped.');
      process.exit(0);
    } catch (error) {
      console.error('[DisasterX backend] Shutdown error:', error.message);
      process.exit(1);
    }
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));

  startServer().then((startedRuntime) => {
    runtime = startedRuntime;
    const address = runtime.server ? runtime.server.address() : null;
    const port = (address && typeof address === 'object') ? address.port : runtime.config.port;
    console.log(`DisasterX backend listening on port ${port}.`);
  }).catch((error) => {
    console.error('Backend startup failed:', error.message || error);
    process.exit(1);
  });
}

module.exports = { startServer, stopServer };
