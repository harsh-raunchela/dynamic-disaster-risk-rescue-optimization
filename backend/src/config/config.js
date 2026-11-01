const path = require('node:path');

const repositoryRoot = path.resolve(__dirname, '../../..');

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function parsePort(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

function createConfig(environment = process.env) {
  const configuredExecutable = environment.WORKER_EXECUTABLE ||
    path.join('build', 'disaster_jsonl_worker.exe');

  return {
    port: parsePort(environment.PORT, 3000),
    repositoryRoot,
    workerExecutable: path.isAbsolute(configuredExecutable)
      ? configuredExecutable
      : path.resolve(repositoryRoot, configuredExecutable),
    workerArgs: environment.WORKER_RESTRICTED_ROAD_PENALTY
      ? ['--restricted-road-penalty', environment.WORKER_RESTRICTED_ROAD_PENALTY]
      : [],
    workerTimeoutMs: parsePositiveInteger(environment.WORKER_TIMEOUT_MS, 5000),
    workerStartupTimeoutMs: parsePositiveInteger(
      environment.WORKER_STARTUP_TIMEOUT_MS,
      10000
    ),
    riskPredictionsFile: path.join(repositoryRoot, 'data', 'risk_predictions.csv')
  };
}

module.exports = { createConfig };
