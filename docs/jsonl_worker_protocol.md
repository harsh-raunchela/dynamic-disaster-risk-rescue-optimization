# DisasterX C++ JSONL worker protocol

`disaster_jsonl_worker.exe` is a persistent local C++ process for the future
Node.js API. It loads the CSV graph and ML predictions once, preserves graph
state across request lines, and uses standard input/output exclusively for
JSON Lines.

## Dependency

The worker vendors [nlohmann/json](https://github.com/nlohmann/json) v3.11.3
as `include/nlohmann/json.hpp`. It is header-only, requires no runtime
installation, and is compatible with C++17.

## Build

Run these commands from the repository root in PowerShell:

```powershell
New-Item -ItemType Directory -Force build | Out-Null
g++ -std=c++17 -Iinclude worker/jsonl_worker_main.cpp src/Graph.cpp src/Location.cpp src/Edge.cpp src/RiskPredictionLoader.cpp src/RouteDecisionEngine.cpp src/JsonlWorkerAdapter.cpp -o build/disaster_jsonl_worker.exe
g++ -std=c++17 -Iinclude tests/test_jsonl_worker.cpp src/Graph.cpp src/Location.cpp src/Edge.cpp src/RiskPredictionLoader.cpp src/RouteDecisionEngine.cpp src/JsonlWorkerAdapter.cpp -o build/test_jsonl_worker.exe
```

The existing CLI build remains separate:

```powershell
g++ src/*.cpp -Iinclude -o disaster_demo.exe
```

## Launch options

The worker defaults to the repository datasets. Optional arguments are:

```text
--locations FILE
--roads FILE
--risks FILE
--restricted-road-penalty NUMBER
```

`Restricted` roads remain usable and receive a default penalty of `40`. The
penalty may be changed at process startup with the final option. `Closed`
roads remain unusable.

## Request and response envelope

Send one JSON object, followed by a newline. Every input line receives exactly
one JSON response line. `requestId` is optional and echoed unchanged.

```json
{"requestId":"health-1","operation":"health"}
```

```json
{"requestId":"health-1","ok":true,"result":{"ready":true,"locationCount":500,"roadCount":2500,"riskPredictionCount":2500,"restrictedRoadPenalty":40.0}}
```

Successful responses use `{"requestId":"...", "ok":true, "result":...}`;
errors use `{"requestId":"...", "ok":false, "error":{"code":"...", "message":"..."}}`.
Diagnostics go to stderr, not stdout.

## Operations

| Operation | Required request fields | Result |
|---|---|---|
| `health` | — | readiness and loaded counts |
| `get_locations` | — | all location records |
| `get_roads` | — | all road records |
| `plan_route` | `sourceLocationId`, `destinationLocationId` | location IDs, exact selected road IDs, total cost, cost breakdown |
| `block_road` | `roadId` | changes only that road to `Closed` |
| `unblock_road` | `roadId` | changes only that road to `Open` |
| `shutdown` | — | acknowledges then exits cleanly |

`plan_route` uses the existing risk-aware `RouteDecisionEngine` and returns
only its actual cost components: travel time, risk, traffic, road-condition,
and restricted-road status penalties.

## Example session

```json
{"requestId":"route-1","operation":"plan_route","sourceLocationId":"LOC_0001","destinationLocationId":"LOC_0010"}
{"requestId":"block-1","operation":"block_road","roadId":"ROAD_0001"}
{"requestId":"stop-1","operation":"shutdown"}
```

## Node.js launch contract

The future Node.js adapter must launch with an executable path and argument
array. It must not concatenate request data into a shell command:

```js
const worker = spawn(workerExecutable, [], {
  cwd: projectRoot,
  shell: false,
  stdio: ["pipe", "pipe", "pipe"]
});
```

Node writes `JSON.stringify(request) + "\\n"` to stdin, buffers stdout by
newline, and correlates each response with `requestId`.
