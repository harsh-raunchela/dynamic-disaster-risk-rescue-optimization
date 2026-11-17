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
  const realDataDir = environment.REAL_DATA_DIR
    ? (path.isAbsolute(environment.REAL_DATA_DIR)
        ? environment.REAL_DATA_DIR
        : path.resolve(repositoryRoot, environment.REAL_DATA_DIR))
    : path.join(repositoryRoot, 'data', 'real');

  return {
    port: parsePort(environment.PORT, 3000),
    repositoryRoot,
    workerExecutable: path.isAbsolute(configuredExecutable)
      ? configuredExecutable
      : path.resolve(repositoryRoot, configuredExecutable),
    workerArgs: [
      ...(environment.WORKER_DATA_DIR ? ['--data-dir', environment.WORKER_DATA_DIR] : []),
      ...(environment.WORKER_RESTRICTED_ROAD_PENALTY
        ? ['--restricted-road-penalty', environment.WORKER_RESTRICTED_ROAD_PENALTY]
        : [])
    ],
    workerTimeoutMs: parsePositiveInteger(environment.WORKER_TIMEOUT_MS, 5000),
    workerStartupTimeoutMs: parsePositiveInteger(
      environment.WORKER_STARTUP_TIMEOUT_MS,
      10000
    ),
    realDataDir,
    riskPredictionsFile: environment.RISK_PREDICTIONS_FILE
      ? (path.isAbsolute(environment.RISK_PREDICTIONS_FILE)
          ? environment.RISK_PREDICTIONS_FILE
          : path.resolve(repositoryRoot, environment.RISK_PREDICTIONS_FILE))
      : path.join(realDataDir, 'risk_predictions.csv'),
    roadGeometryFile: environment.ROAD_GEOMETRY_FILE
      ? (path.isAbsolute(environment.ROAD_GEOMETRY_FILE)
          ? environment.ROAD_GEOMETRY_FILE
          : path.resolve(repositoryRoot, environment.ROAD_GEOMETRY_FILE))
      : path.join(realDataDir, 'road_geometry.json'),
    emergenciesFile: environment.EMERGENCIES_FILE
      ? (path.isAbsolute(environment.EMERGENCIES_FILE)
          ? environment.EMERGENCIES_FILE
          : path.resolve(repositoryRoot, environment.EMERGENCIES_FILE))
      : path.join(repositoryRoot, 'backend', 'data', 'emergencies.json'),
    resourcesFile: environment.RESOURCES_FILE
      ? (path.isAbsolute(environment.RESOURCES_FILE)
          ? environment.RESOURCES_FILE
          : path.resolve(repositoryRoot, environment.RESOURCES_FILE))
      : path.join(repositoryRoot, 'backend', 'data', 'resources.json')
  };
}

module.exports = { createConfig };
