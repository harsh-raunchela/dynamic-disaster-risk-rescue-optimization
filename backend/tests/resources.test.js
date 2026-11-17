const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const { ResourceStore } = require('../src/services/resourceStore');
const { createConfig } = require('../src/config/config');
const { startServer, stopServer } = require('../src/server');

// ============================================================================
// 1. UNIT TESTS: ResourceStore Persistence & Concurrency
// ============================================================================

test('ResourceStore: handles missing file and creates parent directory safely', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dx-res-store-'));
  const targetFile = path.join(tmpDir, 'nested', 'resources.json');

  const store = new ResourceStore(targetFile, { autoSeed: false });
  await store.init();

  assert.equal(fs.existsSync(targetFile), true);
  assert.deepEqual(store.getAll(), []);

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('ResourceStore: handles empty file (0 bytes) gracefully without throwing', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dx-res-store-'));
  const targetFile = path.join(tmpDir, 'empty.json');
  fs.writeFileSync(targetFile, '', 'utf8');

  const store = new ResourceStore(targetFile, { autoSeed: false });
  await store.init();

  assert.deepEqual(store.getAll(), []);

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('ResourceStore: serializes concurrent writes without corruption', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dx-res-store-'));
  const targetFile = path.join(tmpDir, 'concurrent.json');

  const store = new ResourceStore(targetFile, { autoSeed: false });
  await store.init();

  // Fire 15 concurrent saves
  const tasks = Array.from({ length: 15 }, (_, i) =>
    store.save({
      resourceId: `RES-${String(i + 1).padStart(4, '0')}`,
      name: `Resource Unit ${i + 1}`,
      type: 'Ambulance',
      locationId: 'LOC_0001',
      capacity: 4,
      status: 'Available'
    })
  );

  await Promise.all(tasks);

  assert.equal(store.getAll().length, 15);

  // Read file from disk directly to verify JSON valid and complete
  const diskContent = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
  assert.equal(diskContent.length, 15);

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ============================================================================
// 2. INTEGRATION TESTS: HTTP API Endpoints, Validation & Worker Verification
// ============================================================================

let runtime;
let baseUrl;
let testEmergenciesFile;
let testResourcesFile;
let testTmpDir;

async function request(pathname, options) {
  const response = await fetch(`${baseUrl}${pathname}`, options);
  const body = await response.json().catch(() => null);
  return { response, body };
}

test.before(async () => {
  testTmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dx-res-api-'));
  testEmergenciesFile = path.join(testTmpDir, 'emergencies.json');
  testResourcesFile = path.join(testTmpDir, 'resources.json');

  const config = createConfig({
    ...process.env,
    PORT: '0',
    WORKER_EXECUTABLE: path.join('build', 'disaster_jsonl_worker.exe'),
    EMERGENCIES_FILE: testEmergenciesFile,
    RESOURCES_FILE: testResourcesFile
  });

  runtime = await startServer(config);
  baseUrl = `http://127.0.0.1:${runtime.server.address().port}`;
});

test.after(async () => {
  if (runtime) await stopServer(runtime);
  if (testTmpDir && fs.existsSync(testTmpDir)) {
    fs.rmSync(testTmpDir, { recursive: true, force: true });
  }
});

test('API: retrieve all resources and available resources', { concurrency: false }, async () => {
  const [allRes, availRes] = await Promise.all([
    request('/api/resources'),
    request('/api/resources/available')
  ]);

  assert.equal(allRes.response.status, 200);
  assert.ok(Array.isArray(allRes.body.data.resources));
  assert.ok(allRes.body.data.resources.length >= 1);

  assert.equal(availRes.response.status, 200);
  assert.ok(Array.isArray(availRes.body.data.resources));
  // All items in available endpoint must have status === 'Available'
  for (const r of availRes.body.data.resources) {
    assert.equal(r.status, 'Available');
  }
});

test('API: resource metadata and operational permissions come from the backend', { concurrency: false }, async () => {
  const [metadataRes, resourcesRes] = await Promise.all([
    request('/api/resources/metadata'),
    request('/api/resources')
  ]);

  assert.equal(metadataRes.response.status, 200);
  assert.deepEqual(metadataRes.body.data.resourceTypes, [
    'Ambulance', 'Rescue Team', 'Fire Unit', 'Relief Unit'
  ]);
  assert.ok(metadataRes.body.data.resourceStatuses.includes('Available'));
  assert.ok(metadataRes.body.data.resourceStatuses.includes('Maintenance'));

  assert.equal(resourcesRes.response.status, 200);
  for (const resource of resourcesRes.body.data.resources) {
    assert.ok(Array.isArray(resource.allowedStatusTransitions));
    assert.equal(typeof resource.canDelete, 'boolean');
  }
});

test('API: resource creation with valid fields returns 201 and persists', { concurrency: false }, async () => {
  const payload = {
    name: 'Tactical Rescue Squad 9',
    type: 'Rescue Team',
    locationId: 'LOC_0010',
    capacity: 6,
    capabilities: ['Trench Rescue', 'Confined Space Operations'],
    contact: { name: 'Sgt. Miller', phone: '555-9011', radioChannel: 'TAC-5' }
  };

  const { response, body } = await request('/api/resources', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });

  assert.equal(response.status, 201);
  assert.equal(body.ok, true);
  const res = body.data.resource;
  assert.ok(res.resourceId.startsWith('RES-'));
  assert.equal(res.name, payload.name);
  assert.equal(res.type, 'Rescue Team');
  assert.equal(res.locationId, 'LOC_0010');
  assert.equal(res.capacity, 6);
  assert.deepEqual(res.capabilities, payload.capabilities);
  assert.equal(res.status, 'Available');
  assert.equal(res.contact.radioChannel, 'TAC-5');
  assert.ok(res.createdAt);
  assert.ok(res.updatedAt);
});

test('API: duplicate resource ID protection', { concurrency: false }, async () => {
  const payload = {
    resourceId: 'RES-UNIQUE-001',
    name: 'First Dedicated Ambulance',
    type: 'Ambulance',
    locationId: 'LOC_0001',
    capacity: 4
  };

  const first = await request('/api/resources', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });
  assert.equal(first.response.status, 201);

  // Second creation with identical ID must be rejected
  const duplicate = await request('/api/resources', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });

  assert.equal(duplicate.response.status, 409);
  assert.equal(duplicate.body.ok, false);
  assert.equal(duplicate.body.error.code, 'DUPLICATE_RESOURCE_ID');
});

test('API: reject invalid resource type', { concurrency: false }, async () => {
  const payload = {
    name: 'Autonomous Drone Swarm',
    type: 'Drone Unit', // Invalid
    locationId: 'LOC_0001',
    capacity: 2
  };

  const { response, body } = await request('/api/resources', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });

  assert.equal(response.status, 400);
  assert.equal(body.ok, false);
  assert.equal(body.error.code, 'INVALID_RESOURCE_TYPE');
});

test('API: reject invalid location ID not in network', { concurrency: false }, async () => {
  const payload = {
    name: 'Regional Fire Engine',
    type: 'Fire Unit',
    locationId: 'LOC_9999_NON_EXISTENT', // Invalid
    capacity: 5
  };

  const { response, body } = await request('/api/resources', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });

  assert.equal(response.status, 404);
  assert.equal(body.ok, false);
  assert.equal(body.error.code, 'INVALID_LOCATION_ID');
});

test('API: reject invalid capacity', { concurrency: false }, async () => {
  const testCases = [0, -4, 'ten', null];

  for (const cap of testCases) {
    const { response, body } = await request('/api/resources', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'Relief Depot Unit',
        type: 'Relief Unit',
        locationId: 'LOC_0001',
        capacity: cap
      })
    });

    assert.equal(response.status, 400);
    assert.equal(body.ok, false);
    assert.equal(body.error.code, 'INVALID_CAPACITY');
  }
});

test('API: retrieve single resource by ID and handle 404', { concurrency: false }, async () => {
  const created = await request('/api/resources', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      name: 'Single Resource Test Engine',
      type: 'Fire Unit',
      locationId: 'LOC_0054',
      capacity: 6
    })
  });
  const id = created.body.data.resource.resourceId;

  const { response, body } = await request(`/api/resources/${id}`);
  assert.equal(response.status, 200);
  assert.equal(body.data.resource.resourceId, id);
  assert.equal(body.data.resource.name, 'Single Resource Test Engine');

  const missing = await request('/api/resources/RES-DOES-NOT-EXIST');
  assert.equal(missing.response.status, 404);
  assert.equal(missing.body.error.code, 'RESOURCE_NOT_FOUND');
});

test('API: update permitted resource fields', { concurrency: false }, async () => {
  const created = await request('/api/resources', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      name: 'Initial Ambulance Name',
      type: 'Ambulance',
      locationId: 'LOC_0001',
      capacity: 2,
      capabilities: ['Basic Life Support']
    })
  });
  const id = created.body.data.resource.resourceId;

  const { response, body } = await request(`/api/resources/${id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      name: 'Upgraded Mobile ICU Alpha',
      capacity: 4,
      capabilities: ['Advanced Life Support', 'Critical Pediatric Care'],
      contact: { phone: '555-8888' }
    })
  });

  assert.equal(response.status, 200);
  assert.equal(body.data.resource.name, 'Upgraded Mobile ICU Alpha');
  assert.equal(body.data.resource.capacity, 4);
  assert.deepEqual(body.data.resource.capabilities, ['Advanced Life Support', 'Critical Pediatric Care']);
  assert.equal(body.data.resource.contact.phone, '555-8888');
});

test('API: status transitions and invalid transition rejection', { concurrency: false }, async () => {
  const created = await request('/api/resources', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      name: 'Status Cycle Unit',
      type: 'Ambulance',
      locationId: 'LOC_0001',
      capacity: 2
    })
  });
  const id = created.body.data.resource.resourceId;

  // Available -> Allocated
  let res = await request(`/api/resources/${id}/status`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ status: 'Allocated' })
  });
  assert.equal(res.response.status, 200);
  assert.equal(res.body.data.resource.status, 'Allocated');

  // Allocated -> Dispatched
  res = await request(`/api/resources/${id}/status`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ status: 'Dispatched' })
  });
  assert.equal(res.response.status, 200);
  assert.equal(res.body.data.resource.status, 'Dispatched');

  // Dispatched -> En Route
  res = await request(`/api/resources/${id}/status`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ status: 'En Route' })
  });
  assert.equal(res.response.status, 200);
  assert.equal(res.body.data.resource.status, 'En Route');

  // En Route -> On Scene
  res = await request(`/api/resources/${id}/status`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ status: 'On Scene' })
  });
  assert.equal(res.response.status, 200);
  assert.equal(res.body.data.resource.status, 'On Scene');

  // On Scene -> Returning
  res = await request(`/api/resources/${id}/status`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ status: 'Returning' })
  });
  assert.equal(res.response.status, 200);
  assert.equal(res.body.data.resource.status, 'Returning');

  // Returning -> Available
  res = await request(`/api/resources/${id}/status`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ status: 'Available' })
  });
  assert.equal(res.response.status, 200);
  assert.equal(res.body.data.resource.status, 'Available');

  // Available -> Maintenance
  res = await request(`/api/resources/${id}/status`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ status: 'Maintenance' })
  });
  assert.equal(res.response.status, 200);
  assert.equal(res.body.data.resource.status, 'Maintenance');

  // Invalid transition: Maintenance cannot jump straight to En Route
  const invalidRes = await request(`/api/resources/${id}/status`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ status: 'En Route' })
  });
  assert.equal(invalidRes.response.status, 400);
  assert.equal(invalidRes.body.error.code, 'INVALID_STATUS_TRANSITION');
});

test('API: resource filtering by type, status, and location', { concurrency: false }, async () => {
  // Query by type
  const ambRes = await request('/api/resources?type=Ambulance');
  assert.equal(ambRes.response.status, 200);
  for (const r of ambRes.body.data.resources) {
    assert.equal(r.type, 'Ambulance');
  }

  // Query by status
  const maintRes = await request('/api/resources?status=Maintenance');
  assert.equal(maintRes.response.status, 200);
  for (const r of maintRes.body.data.resources) {
    assert.equal(r.status, 'Maintenance');
  }

  // Query by location
  const locRes = await request('/api/resources?locationId=LOC_0001');
  assert.equal(locRes.response.status, 200);
  for (const r of locRes.body.data.resources) {
    assert.equal(r.locationId, 'LOC_0001');
  }
});

test('API: deletion restrictions on allocated or dispatched resources', { concurrency: false }, async () => {
  const created = await request('/api/resources', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      name: 'Deletion Protected Rescue Unit',
      type: 'Rescue Team',
      locationId: 'LOC_0010',
      capacity: 8
    })
  });
  const id = created.body.data.resource.resourceId;

  // Change to Allocated
  await request(`/api/resources/${id}/status`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ status: 'Allocated' })
  });

  // Attempt delete while Allocated: must be blocked with 409
  let delRes = await request(`/api/resources/${id}`, { method: 'DELETE' });
  assert.equal(delRes.response.status, 409);
  assert.equal(delRes.body.error.code, 'RESOURCE_IN_OPERATION');

  // Change to Dispatched
  await request(`/api/resources/${id}/status`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ status: 'Dispatched' })
  });

  // Attempt delete while Dispatched: must be blocked with 409
  delRes = await request(`/api/resources/${id}`, { method: 'DELETE' });
  assert.equal(delRes.response.status, 409);
  assert.equal(delRes.body.error.code, 'RESOURCE_IN_OPERATION');

  // Return to Available
  await request(`/api/resources/${id}/status`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ status: 'Available' })
  });

  // Deletion while Available: must succeed
  delRes = await request(`/api/resources/${id}`, { method: 'DELETE' });
  assert.equal(delRes.response.status, 200);
  assert.equal(delRes.body.data.deleted, true);

  // Verifying it is gone
  const getRes = await request(`/api/resources/${id}`);
  assert.equal(getRes.response.status, 404);
});

test('API: persistence across backend restarts', { concurrency: false }, async () => {
  // Register new resource
  const created = await request('/api/resources', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      name: 'Persistent Rescue Alpha',
      type: 'Relief Unit',
      locationId: 'LOC_0048',
      capacity: 40,
      capabilities: ['Field Hospital Tent', 'Water Filtration']
    })
  });
  const id = created.body.data.resource.resourceId;

  // Stop server
  await stopServer(runtime);

  // Restart new server pointing to same file
  const config = createConfig({
    ...process.env,
    PORT: '0',
    WORKER_EXECUTABLE: path.join('build', 'disaster_jsonl_worker.exe'),
    EMERGENCIES_FILE: testEmergenciesFile,
    RESOURCES_FILE: testResourcesFile
  });
  runtime = await startServer(config);
  baseUrl = `http://127.0.0.1:${runtime.server.address().port}`;

  // Verify resource persisted with exact properties
  const { response, body } = await request(`/api/resources/${id}`);
  assert.equal(response.status, 200);
  assert.equal(body.data.resource.resourceId, id);
  assert.equal(body.data.resource.name, 'Persistent Rescue Alpha');
  assert.equal(body.data.resource.type, 'Relief Unit');
  assert.equal(body.data.resource.capacity, 40);
  assert.deepEqual(body.data.resource.capabilities, ['Field Hospital Tent', 'Water Filtration']);
});

test('API Regression: Emergency APIs continue to function normally', { concurrency: false }, async () => {
  const [emergenciesRes, activeRes, priorityRes, statsRes] = await Promise.all([
    request('/api/emergencies'),
    request('/api/emergencies/active'),
    request('/api/emergencies/priority'),
    request('/api/emergencies/stats')
  ]);

  assert.equal(emergenciesRes.response.status, 200);
  assert.ok(Array.isArray(emergenciesRes.body.data.emergencies));

  assert.equal(activeRes.response.status, 200);
  assert.ok(Array.isArray(activeRes.body.data.emergencies));

  assert.equal(priorityRes.response.status, 200);
  assert.ok(Array.isArray(priorityRes.body.data.emergencies));

  assert.equal(statsRes.response.status, 200);
  assert.equal(typeof statsRes.body.data.stats.total, 'number');
  assert.equal(typeof statsRes.body.data.stats.active, 'number');
});

