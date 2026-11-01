# DisasterX backend — Phase 3.3

This Express backend is an HTTP adapter for the persistent DisasterX C++ JSONL
worker. JavaScript does not load graph data, calculate routes, or reproduce
risk scoring. Those operations remain in the C++ worker.

## Prerequisites

- Node.js 20 or later (the audited environment uses Node 25)
- npm
- MinGW-w64 C++17 compiler
- The C++ worker binary built at `../build/disaster_jsonl_worker.exe`

## Install and run

From the repository root, first build the worker:

```powershell
g++ -std=c++17 -Iinclude worker/jsonl_worker_main.cpp src/Graph.cpp src/Location.cpp src/Edge.cpp src/RiskPredictionLoader.cpp src/RouteDecisionEngine.cpp src/JsonlWorkerAdapter.cpp -o build/disaster_jsonl_worker.exe
```

Then install and start the backend:

```powershell
cd backend
npm install
npm start
```

The default listener is `http://localhost:3000`. `.env.example` lists the
supported environment keys. Set them through your local shell or process
manager before starting Node; no dotenv runtime dependency is used in Phase 3.3.

## API

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Worker readiness and loaded counts |
| GET | `/api/locations` | All C++ graph locations |
| GET | `/api/roads` | All C++ graph roads and current state |
| GET | `/api/risks` | Current C++ road risk plus CSV confidence |
| POST | `/api/routes/plan` | Risk-aware C++ route plan |
| POST | `/api/roads/:roadId/block` | Block exactly one road ID |
| POST | `/api/roads/:roadId/unblock` | Unblock exactly one road ID |

Example route request:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/routes/plan -ContentType application/json -Body '{"sourceLocationId":"LOC_0001","destinationLocationId":"LOC_0010"}'
```

Responses use `{ "ok": true, "data": ... }`; failures use
`{ "ok": false, "error": { "code", "message" } }`.

HTTP error mapping: `400` invalid input, `404` unknown road/location, `409` no
route, `502` invalid worker response, `503` unavailable worker, and `504`
worker timeout.

## Worker lifecycle

`WorkerManager` starts one child process using `spawn(executable, args, {
shell: false })`, with repository-root working directory and stdio pipes. It
generates UUID request IDs, buffers newline-delimited stdout, validates worker
response envelopes, correlates pending calls, and serializes mutations through
one queue.

Unexpected worker exits reject pending requests and make the API return `503`.
The backend never silently restarts a worker. Calling its explicit manager
restart method reloads the base CSV files and exposes `runtimeStateReset: true`
through `/api/health`.

`GET /api/risks` obtains runtime risk from C++ roads and reads the prediction
CSV only for confidence, which the current C++ worker does not retain.

## Tests

From `backend/`:

```powershell
npm test
```

The test suite starts the real worker, exercises the HTTP API, verifies request
correlation, deliberately terminates the worker, explicitly restarts it, and
shuts it down cleanly.
