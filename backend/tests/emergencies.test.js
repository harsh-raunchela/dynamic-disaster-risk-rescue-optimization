const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const { EmergencyPriorityQueue, compareEmergencies } = require('../src/services/emergencyPriorityQueue');
const { EmergencyStore } = require('../src/services/emergencyStore');
const { createConfig } = require('../src/config/config');
const { startServer, stopServer } = require('../src/server');

// ============================================================================
// 1. UNIT TESTS: Priority Queue & Deterministic Ordering
// ============================================================================

test('EmergencyPriorityQueue: severity priority ordering (Critical > High > Medium > Low)', () => {
  const queue = new EmergencyPriorityQueue();

  queue.enqueue({ emergencyId: 'E-LOW', severity: 'Low', reportedAt: '2026-11-05T10:00:00Z', status: 'Reported' });
  queue.enqueue({ emergencyId: 'E-CRIT', severity: 'Critical', reportedAt: '2026-11-05T10:00:00Z', status: 'Reported' });
  queue.enqueue({ emergencyId: 'E-MED', severity: 'Medium', reportedAt: '2026-11-05T10:00:00Z', status: 'Reported' });
  queue.enqueue({ emergencyId: 'E-HIGH', severity: 'High', reportedAt: '2026-11-05T10:00:00Z', status: 'Reported' });

  assert.equal(queue.size(), 4);

  const array = queue.toArray();
  assert.equal(array[0].emergencyId, 'E-CRIT');
  assert.equal(array[0].priority, 1);
  assert.equal(array[1].emergencyId, 'E-HIGH');
  assert.equal(array[1].priority, 2);
  assert.equal(array[2].emergencyId, 'E-MED');
  assert.equal(array[2].priority, 3);
  assert.equal(array[3].emergencyId, 'E-LOW');
  assert.equal(array[3].priority, 4);

  assert.equal(queue.dequeue().emergencyId, 'E-CRIT');
  assert.equal(queue.dequeue().emergencyId, 'E-HIGH');
  assert.equal(queue.dequeue().emergencyId, 'E-MED');
  assert.equal(queue.dequeue().emergencyId, 'E-LOW');
  assert.equal(queue.isEmpty(), true);
});

test('EmergencyPriorityQueue: equal-severity older timestamp receives priority', () => {
  const queue = new EmergencyPriorityQueue();

  queue.enqueue({ emergencyId: 'NEWER', severity: 'High', reportedAt: '2026-11-05T10:30:00Z', status: 'Reported' });
  queue.enqueue({ emergencyId: 'OLDER', severity: 'High', reportedAt: '2026-11-05T09:00:00Z', status: 'Reported' });
  queue.enqueue({ emergencyId: 'MIDDLE', severity: 'High', reportedAt: '2026-11-05T09:45:00Z', status: 'Reported' });

  const array = queue.toArray();
  assert.equal(array[0].emergencyId, 'OLDER');
  assert.equal(array[1].emergencyId, 'MIDDLE');
  assert.equal(array[2].emergencyId, 'NEWER');
});

test('EmergencyPriorityQueue: deterministic tie-breaker when severity and timestamp match', () => {
  const queue = new EmergencyPriorityQueue();

  queue.enqueue({ emergencyId: 'EMG-0020', severity: 'Critical', reportedAt: '2026-11-05T10:00:00Z', status: 'Reported' });
  queue.enqueue({ emergencyId: 'EMG-0005', severity: 'Critical', reportedAt: '2026-11-05T10:00:00Z', status: 'Reported' });
  queue.enqueue({ emergencyId: 'EMG-0010', severity: 'Critical', reportedAt: '2026-11-05T10:00:00Z', status: 'Reported' });

  const array = queue.toArray();
  assert.equal(array[0].emergencyId, 'EMG-0005');
  assert.equal(array[1].emergencyId, 'EMG-0010');
  assert.equal(array[2].emergencyId, 'EMG-0020');
});

test('EmergencyPriorityQueue: resolved emergencies are excluded and cannot be enqueued', () => {
  const queue = new EmergencyPriorityQueue();

  queue.enqueue({ emergencyId: 'E1', severity: 'High', reportedAt: '2026-11-05T10:00:00Z', status: 'Reported' });
  queue.enqueue({ emergencyId: 'E2', severity: 'Critical', reportedAt: '2026-11-05T10:00:00Z', status: 'Resolved' });

  assert.equal(queue.size(), 1);
  assert.equal(queue.peek().emergencyId, 'E1');

  // Updating existing to Resolved removes it
  queue.update({ emergencyId: 'E1', severity: 'High', reportedAt: '2026-11-05T10:00:00Z', status: 'Resolved' });
  assert.equal(queue.size(), 0);
  assert.equal(queue.isEmpty(), true);
});

test('EmergencyPriorityQueue: severity update re-prioritizes emergency dynamically', () => {
  const queue = new EmergencyPriorityQueue();

  queue.enqueue({ emergencyId: 'E1', severity: 'Low', reportedAt: '2026-11-05T10:00:00Z', status: 'Reported' });
  queue.enqueue({ emergencyId: 'E2', severity: 'Medium', reportedAt: '2026-11-05T10:00:00Z', status: 'Reported' });

  assert.equal(queue.peek().emergencyId, 'E2');

  // Escalate E1 to Critical
  queue.update({ emergencyId: 'E1', severity: 'Critical', reportedAt: '2026-11-05T10:00:00Z', status: 'Reported' });
  assert.equal(queue.peek().emergencyId, 'E1');
  assert.equal(queue.toArray()[0].emergencyId, 'E1');
});

test('EmergencyPriorityQueue: prevent duplicate entries on repeated enqueue', () => {
  const queue = new EmergencyPriorityQueue();

  queue.enqueue({ emergencyId: 'E1', severity: 'Low', reportedAt: '2026-11-05T10:00:00Z', status: 'Reported' });
  queue.enqueue({ emergencyId: 'E1', severity: 'Critical', reportedAt: '2026-11-05T10:00:00Z', status: 'Reported' });

  assert.equal(queue.size(), 1);
  assert.equal(queue.peek().severity, 'Critical');
});

// ============================================================================
// 2. UNIT TESTS: Store Persistence & File Handling
// ============================================================================

test('EmergencyStore: handles missing file and creates parent directory safely', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dx-store-test-'));
  const targetFile = path.join(tmpDir, 'nested', 'emergencies.json');

  const store = new EmergencyStore(targetFile, { autoSeed: false });
  await store.init();

  assert.equal(fs.existsSync(targetFile), true);
  assert.deepEqual(store.getAll(), []);

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('EmergencyStore: handles empty file (0 bytes) gracefully without throwing', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dx-store-test-'));
  const targetFile = path.join(tmpDir, 'empty.json');
  fs.writeFileSync(targetFile, '', 'utf8');

  const store = new EmergencyStore(targetFile, { autoSeed: false });
  await store.init();

  assert.deepEqual(store.getAll(), []);

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ============================================================================
// 3. INTEGRATION TESTS: HTTP API Endpoints, Validation & Worker Verification
// ============================================================================

let runtime;
let baseUrl;
let testEmergenciesFile;
let testTmpDir;

async function request(pathname, options) {
  const response = await fetch(`${baseUrl}${pathname}`, options);
  const body = await response.json().catch(() => null);
  return { response, body };
}

test.before(async () => {
  testTmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dx-api-test-'));
  testEmergenciesFile = path.join(testTmpDir, 'emergencies.json');

  const config = createConfig({
    ...process.env,
    PORT: '0',
    WORKER_EXECUTABLE: path.join('build', 'disaster_jsonl_worker.exe'),
    EMERGENCIES_FILE: testEmergenciesFile
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

test('API: retrieve all emergencies, active, priority and stats', { concurrency: false }, async () => {
  const [allRes, activeRes, priorityRes, statsRes] = await Promise.all([
    request('/api/emergencies'),
    request('/api/emergencies/active'),
    request('/api/emergencies/priority'),
    request('/api/emergencies/stats')
  ]);

  assert.equal(allRes.response.status, 200);
  assert.ok(Array.isArray(allRes.body.data.emergencies));

  assert.equal(activeRes.response.status, 200);
  assert.ok(Array.isArray(activeRes.body.data.emergencies));

  assert.equal(priorityRes.response.status, 200);
  assert.ok(Array.isArray(priorityRes.body.data.emergencies));

  assert.equal(statsRes.response.status, 200);
  assert.equal(typeof statsRes.body.data.stats.total, 'number');
  assert.equal(typeof statsRes.body.data.stats.active, 'number');
  assert.equal(typeof statsRes.body.data.stats.critical, 'number');
  assert.equal(typeof statsRes.body.data.stats.resolved, 'number');
});

test('API: emergency registration with valid fields returns 201 and persists', { concurrency: false }, async () => {
  const payload = {
    title: 'Bridge Structural Scour Incident',
    description: 'High water volume caused erosion at bridge foundation pier 3.',
    type: 'Flood',
    severity: 'High',
    locationId: 'LOC_0010',
    peopleAffected: 45
  };

  const { response, body } = await request('/api/emergencies', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });

  assert.equal(response.status, 201);
  assert.equal(body.ok, true);
  const emg = body.data.emergency;
  assert.ok(emg.emergencyId.startsWith('EMG-'));
  assert.equal(emg.title, payload.title);
  assert.equal(emg.severity, 'High');
  assert.equal(emg.status, 'Reported');
  assert.equal(emg.locationId, 'LOC_0010');
  assert.equal(typeof emg.priority, 'number');
  assert.ok(emg.reportedAt);
  assert.ok(emg.updatedAt);
});

test('API: reject invalid location ID not in network', { concurrency: false }, async () => {
  const payload = {
    title: 'Incident with Unknown Location',
    type: 'Fire',
    severity: 'Medium',
    locationId: 'LOC_9999_DOES_NOT_EXIST',
    peopleAffected: 10
  };

  const { response, body } = await request('/api/emergencies', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });

  assert.equal(response.status, 404);
  assert.equal(body.ok, false);
  assert.equal(body.error.code, 'INVALID_LOCATION_ID');
});

test('API: reject invalid severity', { concurrency: false }, async () => {
  const payload = {
    title: 'Incident with Bad Severity',
    type: 'Fire',
    severity: 'Catastrophic', // Invalid
    locationId: 'LOC_0010',
    peopleAffected: 5
  };

  const { response, body } = await request('/api/emergencies', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });

  assert.equal(response.status, 400);
  assert.equal(body.ok, false);
  assert.equal(body.error.code, 'INVALID_SEVERITY');
});

test('API: reject invalid emergency type', { concurrency: false }, async () => {
  const payload = {
    title: 'Incident with Bad Type',
    type: 'Cyber Attack', // Not in permitted list
    severity: 'Critical',
    locationId: 'LOC_0010',
    peopleAffected: 5
  };

  const { response, body } = await request('/api/emergencies', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });

  assert.equal(response.status, 400);
  assert.equal(body.ok, false);
  assert.equal(body.error.code, 'INVALID_EMERGENCY_TYPE');
});

test('API: retrieve single emergency by ID', { concurrency: false }, async () => {
  // First register one
  const created = await request('/api/emergencies', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      title: 'Chemical Spill Incident',
      type: 'Other',
      severity: 'Medium',
      locationId: 'LOC_0050',
      peopleAffected: 12
    })
  });
  const id = created.body.data.emergency.emergencyId;

  const { response, body } = await request(`/api/emergencies/${id}`);
  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.data.emergency.emergencyId, id);
  assert.equal(body.data.emergency.title, 'Chemical Spill Incident');

  // Non-existent ID returns 404
  const missing = await request('/api/emergencies/EMG-NON-EXISTENT');
  assert.equal(missing.response.status, 404);
  assert.equal(missing.body.error.code, 'EMERGENCY_NOT_FOUND');
});

test('API: permitted field updates and severity escalation', { concurrency: false }, async () => {
  const created = await request('/api/emergencies', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      title: 'Localized Minor Wildfire',
      type: 'Fire',
      severity: 'Low',
      locationId: 'LOC_0085',
      peopleAffected: 2
    })
  });
  const id = created.body.data.emergency.emergencyId;

  // Escalate to Critical and update description
  const { response, body } = await request(`/api/emergencies/${id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      severity: 'Critical',
      description: 'Winds shifted rapidly; fire threatening residential ridge.',
      peopleAffected: 35
    })
  });

  assert.equal(response.status, 200);
  assert.equal(body.data.emergency.severity, 'Critical');
  assert.equal(body.data.emergency.peopleAffected, 35);
  assert.equal(body.data.emergency.description, 'Winds shifted rapidly; fire threatening residential ridge.');

  // Verify in priority queue it is prioritized
  const priorityRes = await request('/api/emergencies/priority');
  const found = priorityRes.body.data.emergencies.find((e) => e.emergencyId === id);
  assert.ok(found);
  assert.equal(found.severity, 'Critical');
});

test('API: status transitions and invalid transition rejection', { concurrency: false }, async () => {
  const created = await request('/api/emergencies', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      title: 'Tunnel Gas Leak Incident',
      type: 'Other',
      severity: 'High',
      locationId: 'LOC_0091',
      peopleAffected: 18
    })
  });
  const id = created.body.data.emergency.emergencyId;

  // Transition Reported -> Prioritized
  let res = await request(`/api/emergencies/${id}/status`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ status: 'Prioritized' })
  });
  assert.equal(res.response.status, 200);
  assert.equal(res.body.data.emergency.status, 'Prioritized');

  // Transition Prioritized -> Responding
  res = await request(`/api/emergencies/${id}/status`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ status: 'Responding' })
  });
  assert.equal(res.response.status, 200);
  assert.equal(res.body.data.emergency.status, 'Responding');

  // Transition Responding -> Resolved
  res = await request(`/api/emergencies/${id}/status`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ status: 'Resolved' })
  });
  assert.equal(res.response.status, 200);
  assert.equal(res.body.data.emergency.status, 'Resolved');

  // Resolved emergency must NOT appear in active priority queue
  const priorityRes = await request('/api/emergencies/priority');
  const inPriority = priorityRes.body.data.emergencies.some((e) => e.emergencyId === id);
  assert.equal(inPriority, false, 'Resolved emergency must be excluded from priority queue');

  // Invalid transition: Resolved cannot return to Responding
  const invalidRes = await request(`/api/emergencies/${id}/status`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ status: 'Responding' })
  });
  assert.equal(invalidRes.response.status, 400);
  assert.equal(invalidRes.body.error.code, 'INVALID_STATUS_TRANSITION');
});

test('API: persistence across backend restarts', { concurrency: false }, async () => {
  // Register an incident
  const created = await request('/api/emergencies', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      title: 'Persistent Landslide Scenario',
      type: 'Landslide',
      severity: 'Critical',
      locationId: 'LOC_0048',
      peopleAffected: 55
    })
  });
  const id = created.body.data.emergency.emergencyId;

  // Stop server
  await stopServer(runtime);

  // Restart new server pointing to same file
  const config = createConfig({
    ...process.env,
    PORT: '0',
    WORKER_EXECUTABLE: path.join('build', 'disaster_jsonl_worker.exe'),
    EMERGENCIES_FILE: testEmergenciesFile
  });
  runtime = await startServer(config);
  baseUrl = `http://127.0.0.1:${runtime.server.address().port}`;

  // Verify incident exists after restart
  const { response, body } = await request(`/api/emergencies/${id}`);
  assert.equal(response.status, 200);
  assert.equal(body.data.emergency.emergencyId, id);
  assert.equal(body.data.emergency.title, 'Persistent Landslide Scenario');
  assert.equal(body.data.emergency.severity, 'Critical');

  // Verify priority queue reconstructed
  const priorityRes = await request('/api/emergencies/priority');
  assert.ok(priorityRes.body.data.emergencies.some((e) => e.emergencyId === id));
});

