# DisasterX frontend — Phase 3.4

The DisasterX frontend is a React/Vite control surface for the existing local
Express API and persistent C++ JSONL worker. It never accesses the C++ worker
directly and never computes routes or risk scores in JavaScript.

## Start locally

1. Build the existing C++ worker from the repository root:

```powershell
g++ -std=c++17 -Iinclude worker/jsonl_worker_main.cpp src/Graph.cpp src/Location.cpp src/Edge.cpp src/RiskPredictionLoader.cpp src/RouteDecisionEngine.cpp src/JsonlWorkerAdapter.cpp -o build/disaster_jsonl_worker.exe
```

2. Start the existing backend in another terminal:

```powershell
cd backend
npm install
npm start
```

3. Start the frontend:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Environment

`VITE_API_BASE_URL` controls the API base URL. Its default is `/api`, which is
proxied to `http://localhost:3000` by Vite during development. See
`.env.example`. Use an absolute backend URL only when the target backend has
an appropriate CORS policy.

## Implemented views

- Command Center: actual C++/backend counts, network availability, condition
  summary, and ML risk distribution.
- Live Map: OpenStreetMap basemap with real synthetic locations and graph
  edges, road-state styling, risk markers, search, legends, layers, road
  details, and road mutations.
- Route Planner: uses `POST /api/routes/plan`; shows only the C++ route,
  selected road IDs, total cost, and returned breakdown.
- Network Monitoring: live road state table, filtering, selection, and single
  road-ID block/unblock confirmation flow.
- Risk Analytics: actual worker graph risk plus CSV prediction confidence.
- Settings: read-only local integration and worker state details.

The interface labels the graph as synthetic throughout. It does not claim live
incidents, traffic, emergencies, or external disaster data.

## Build

```powershell
npm run build
```

## Icon credits

The interaction design uses a sharp pixel-inspired treatment. The app uses
Lucide React icons as a lightweight fallback rather than bundling Streamline
assets. Streamline's free Pixel collection is credited as visual inspiration:
[Streamline Pixel icons](https://www.streamlinehq.com/icons/pixel).
