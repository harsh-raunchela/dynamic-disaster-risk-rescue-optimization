const { createConfig } = require('./config/config');
const { WorkerManager } = require('./services/workerManager');
const { WorkerClient } = require('./services/workerClient');
const { createApp } = require('./app');

async function startServer(config = createConfig()) {
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

  const app = createApp(new WorkerClient(manager, config));
  const server = await new Promise((resolve, reject) => {
    const instance = app.listen(config.port, () => resolve(instance));
    instance.once('error', reject);
  });

  return { app, server, manager, config };
}

async function stopServer(runtime) {
  if (runtime.server.listening) {
    await new Promise((resolve, reject) => {
      runtime.server.close((error) => error ? reject(error) : resolve());
    });
  }
  await runtime.manager.stop();
}

if (require.main === module) {
  let runtime;
  let stopping = false;

  const shutdown = async () => {
    if (stopping) return;
    stopping = true;
    try {
      if (runtime) await stopServer(runtime);
      process.exitCode = 0;
    } catch (error) {
      console.error('Backend shutdown failed:', error.message);
      process.exitCode = 1;
    }
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);

  startServer().then((startedRuntime) => {
    runtime = startedRuntime;
    const address = runtime.server.address();
    console.log(`DisasterX backend listening on port ${address.port}.`);
  }).catch((error) => {
    console.error('Backend startup failed:', error.message);
    process.exitCode = 1;
  });
}

module.exports = { startServer, stopServer };
