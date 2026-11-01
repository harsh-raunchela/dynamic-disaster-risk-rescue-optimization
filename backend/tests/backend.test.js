const assert = require('node:assert/strict');
const { once } = require('node:events');
const test = require('node:test');
const path = require('node:path');

const { createConfig } = require('../src/config/config');
const { startServer, stopServer } = require('../src/server');

let runtime;
let baseUrl;
let selectedRoadId;

async function request(pathname, options) {
  const response = await fetch(`${baseUrl}${pathname}`, options);
  return { response, body: await response.json() };
}

test.before(async () => {
  const config = createConfig({
    ...process.env,
    PORT: '0',
    WORKER_EXECUTABLE: path.join('build', 'disaster_jsonl_worker.exe')
  });
  runtime = await startServer(config);
  baseUrl = `http://127.0.0.1:${runtime.server.address().port}`;
});

test.after(async () => {
  if (runtime) await stopServer(runtime);
});

test('backend starts the worker and reports its health', { concurrency: false }, async () => {
  const { response, body } = await request('/api/health');
  assert.equal(response.status, 200);
  assert.equal(body.data.locationCount, 500);
  assert.equal(body.data.roadCount, 2500);
  assert.equal(body.data.riskPredictionCount, 2500);
});

test('location, road, and risk snapshots use the real datasets', { concurrency: false }, async () => {
  const [locations, roads, risks] = await Promise.all([
    request('/api/locations'),
    request('/api/roads'),
    request('/api/risks')
  ]);
  assert.equal(locations.response.status, 200);
  assert.equal(locations.body.data.locations.length, 500);
  assert.equal(roads.response.status, 200);
  assert.equal(roads.body.data.roads.length, 2500);
  assert.equal(risks.response.status, 200);
  assert.equal(risks.body.data.risks.length, 2500);
  assert.equal(typeof risks.body.data.risks[0].predictionConfidence, 'number');

  const openRoad = roads.body.data.roads.find((road) => road.status === 'Open');
  assert.ok(openRoad, 'expected an open road in the dataset');
  selectedRoadId = openRoad.id;
});

test('route planning and validation return correct HTTP semantics', { concurrency: false }, async () => {
  let result = await request('/api/routes/plan', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ sourceLocationId: 'LOC_0001', destinationLocationId: 'LOC_0010' })
  });
  assert.equal(result.response.status, 200);
  assert.ok(result.body.data.locationIds.length >= 2);
  assert.equal(result.body.data.roadIds.length + 1, result.body.data.locationIds.length);

  result = await request('/api/routes/plan', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ sourceLocationId: 'LOC_9999', destinationLocationId: 'LOC_0010' })
  });
  assert.equal(result.response.status, 404);
  assert.equal(result.body.error.code, 'INVALID_LOCATION_ID');
});

test('road mutations are serialized and change one selected road', { concurrency: false }, async () => {
  assert.ok(selectedRoadId);

  let result = await request(`/api/roads/${selectedRoadId}/block`, { method: 'POST' });
  assert.equal(result.response.status, 200);
  assert.equal(result.body.data.status, 'Closed');

  result = await request(`/api/roads/${selectedRoadId}/unblock`, { method: 'POST' });
  assert.equal(result.response.status, 200);
  assert.equal(result.body.data.status, 'Open');

  result = await request('/api/roads/ROAD_DOES_NOT_EXIST/block', { method: 'POST' });
  assert.equal(result.response.status, 404);
  assert.equal(result.body.error.code, 'INVALID_ROAD_ID');
});

test('simultaneous reads are correlated and a crash requires explicit restart', { concurrency: false }, async () => {
  const responses = await Promise.all(
    Array.from({ length: 8 }, () => request('/api/health'))
  );
  for (const item of responses) {
    assert.equal(item.response.status, 200);
    assert.equal(item.body.data.locationCount, 500);
  }

  const exited = once(runtime.manager, 'exit');
  runtime.manager.child.kill();
  await exited;

  let result = await request('/api/health');
  assert.equal(result.response.status, 503);
  assert.equal(result.body.error.code, 'WORKER_UNAVAILABLE');

  const restart = await runtime.manager.restart();
  assert.equal(restart.runtimeStateReset, true);

  result = await request('/api/health');
  assert.equal(result.response.status, 200);
  assert.equal(result.body.data.worker.runtimeStateReset, true);
});
