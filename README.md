# Dynamic Disaster Risk, Evacuation & Rescue Optimization System

**DisasterX** is a disaster-management and rescue-route optimization system designed to support safer evacuation planning, emergency prioritization and resource coordination during disasters such as floods and landslides.

The project combines **C++, Data Structures and Algorithms, Machine Learning, Node.js, Express.js and React** to model a geographical road network, estimate road-risk levels and calculate alternative routes when roads become unavailable.

---

## 1. Problem Statement

During disasters, roads can become blocked or unsafe, emergency cases require different levels of priority, and rescue resources need to be coordinated efficiently.

Traditional navigation systems primarily focus on distance and travel time. However, during a disaster, the shortest route may not be the safest route.

The objective of DisasterX is to develop a system that models a disaster-affected region as a dynamic weighted graph and supports:

- Risk-aware evacuation and rescue-route planning.
- Emergency prioritization and management.
- Rescue resource management.
- Road-blocking and reopening operations.
- Dynamic rerouting when a road becomes unavailable.
- Map-based visualization of locations, roads and routes.

## 2. Project Overview

DisasterX represents geographical locations as vertices and roads as weighted edges in a graph.

Each road contains information such as distance, travel time, road condition, traffic estimate and predicted risk level. The C++ routing engine uses this information to calculate routes between locations.

The system also includes a web interface for interacting with the geographical network, managing emergencies and resources, and visualizing routes.

### Key Features

- Real geographical road-network data from the Dehradun region.
- Graph representation using an adjacency list.
- Custom implementations of important data structures.
- Dijkstra and A* route-planning algorithms.
- BFS, DFS and articulation-point detection.
- Machine learning-based road-risk predictions.
- Risk-aware route-cost calculation.
- Road blocking and reopening.
- Dynamic rerouting when a road becomes unavailable.
- Emergency management and priority-based processing.
- Rescue resource management.
- Interactive map with actual road geometries.
- Backend APIs and persistent operational data.
- Command-line and web-based interaction.

## 3. Technologies and Tools Used

| Category | Technologies |
|---|---|
| Core Programming | C++ |
| Machine Learning | Python, Scikit-learn, NumPy, Pandas |
| Data Structures | Graph, Queue, Stack, Priority Queue, Min Heap, Hash Map, Set |
| Algorithms | Dijkstra, A*, BFS, DFS, Articulation Points |
| Backend | Node.js, Express.js |
| Frontend | React.js, Vite, Tailwind CSS |
| Map Visualization | Leaflet, OpenStreetMap |
| Data Storage | CSV files, JSON persistence |
| Development Tools | Visual Studio Code, Git, GitHub |

## 4. System Architecture

The project follows a modular architecture in which the C++ engine handles graph processing and route calculation, the Python machine-learning pipeline generates road-risk predictions, and the web application provides an interface for users.

### Main Components

**1. Data Layer**

- Stores geographical locations and road information in CSV files.
- Stores road geometries for map visualization.
- Provides precomputed road-risk predictions.
- Maintains emergency and resource records.

**2. Machine Learning Module**

- Uses a Random Forest classification model.
- Processes geographical and environmental features.
- Generates road-risk predictions.
- Exports predictions to a CSV file for use by the C++ engine.

**3. C++ Disaster Engine**

- Loads locations, roads and risk predictions.
- Constructs the weighted graph.
- Implements custom data structures and graph algorithms.
- Calculates routes and handles blocked roads.
- Supports emergency prioritization and disaster-related operations.

**4. Backend**

- Uses Node.js and Express.js.
- Provides APIs for the frontend.
- Communicates with the C++ engine through a JSONL worker.
- Handles emergency and resource management.
- Uses JSON files for operational data persistence.

**5. Frontend**

- Built using React, Vite and Tailwind CSS.
- Displays the geographical road network using Leaflet.
- Visualizes road conditions, risk levels and routes.
- Provides interfaces for emergency and resource management.
- Supports interaction with the backend APIs.

### System Workflow

1. Geographical and environmental data is collected and processed.
2. The Random Forest model generates road-risk predictions.
3. Predictions are exported to CSV.
4. The C++ engine loads the road network and risk information.
5. The backend exposes system functionality through APIs.
6. The frontend displays the network and allows users to interact with the system.
7. When a road is marked as blocked, the routing engine searches for an alternative route.

## 5. Project Modules

### 5.1 Graph and Dataset Management

Loads location and road information from CSV files and constructs the road network using an adjacency-list graph.

The graph supports road-status updates and route calculations.

### 5.2 Machine Learning Risk Prediction

Uses a Python-based Random Forest model to classify road-risk levels.

The model uses geographical and environmental information such as terrain slope, rainfall, soil moisture and historical landslide information.

Predictions are exported to a CSV file and loaded by the C++ engine.

### 5.3 Route Planning

Implements graph-based route-planning algorithms:

- **Dijkstra's Algorithm:** Finds a minimum-cost route using non-negative edge weights.
- **A* Algorithm:** Uses a heuristic to guide the search towards the destination.
- **BFS and DFS:** Support graph traversal.
- **Articulation Points:** Help identify critical vertices in the road network.

### 5.4 Road and Disaster Control

Allows road segments to be marked as blocked or reopened.

Blocked roads are excluded from route calculation so that an alternative route can be found when available.

In the current prototype, road-status changes are made through the system's management functionality. Automatic blockage detection through live sensors or external reporting feeds is not implemented.

### 5.5 Emergency Management

Supports creating, viewing, updating and managing emergency records.

A priority-based mechanism is used to process emergencies according to their assigned severity.

### 5.6 Rescue Resource Management

Supports managing rescue resources, including their type, location, availability and other relevant information.

The current implementation provides resource registration and management. Fully automatic resource dispatch and allocation are not implemented.

### 5.7 Interactive Map

Uses Leaflet and OpenStreetMap-based geographical visualization.

The map displays actual road geometries, locations, road-risk information and route information to help users understand the geographical network.

### 5.8 Backend and Frontend Integration

The Node.js and Express.js backend connects the frontend with the C++ engine and provides APIs for the application's operations.

The React frontend provides interactive interfaces for map visualization, emergency management, resource management and route planning.

## 6. Dataset

The project uses a real geographical dataset covering the Dehradun region.

### Dataset Summary

| Dataset Component | Records |
|---|---:|
| Locations | 1,086 |
| Road Segments | 2,362 |
| Road Geometries | 2,362 |
| ML Risk Predictions | 2,362 |
| Emergency Records | 150 |
| Resource Records | 236 |

### Road-Risk Distribution

| Risk Category | Number of Roads |
|---|---:|
| Low | 945 |
| Medium | 826 |
| High | 425 |
| Critical | 166 |
| **Total** | **2,362** |

### Data Sources

- **OpenStreetMap:** Road network and geographical location information.
- **Open-Meteo / Copernicus-based data:** Environmental information, including rainfall, soil moisture and elevation-related inputs.
- **NASA Global Landslide Catalog:** Historical landslide records.

### Dataset Limitations

The dataset combines real geographical and environmental information with estimated and simulated operational data.

- Road-network and geographical information are sourced from OpenStreetMap.
- Environmental information is obtained from external environmental datasets.
- Traffic levels are estimated using road classifications rather than live traffic feeds.
- Some road-condition information is estimated where direct information is unavailable.
- Emergency and resource records are simulated for development and demonstration.

The emergency and resource records should not be interpreted as verified live disaster information.

## 7. Machine Learning Results

The project uses a Random Forest classification model to predict road-risk categories.

The model was evaluated using a spatial holdout approach.

| Evaluation Metric | Result |
|---|---:|
| Spatial Holdout Accuracy | 76.20% |
| Macro F1-Score | 75.95% |
| Majority-Class Baseline Accuracy | 44.63% |
| Training Road Records | 1,757 |
| Testing Road Records | 605 |

**Important:** The model's target labels are derived from a calculated hazard index based on environmental and geographical features. These results measure agreement with those derived labels, not verified accuracy in predicting future floods or landslides.

The C++ engine uses the precomputed predictions stored in the risk CSV file. Continuous live prediction and automatic model retraining are not currently implemented.

## 8. Project Setup and Installation

### Prerequisites

- C++ compiler supporting C++17 or later.
- Python 3.
- Node.js and npm.
- Git.
- Visual Studio Code or another code editor.

### Step 1: Clone the Repository

```bash
git clone https://github.com/harsh-raunchela/dynamic-disaster-risk-rescue-optimization.git

cd dynamic-disaster-risk-rescue-optimization
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

Start the backend:

```bash
npm start
```

### Step 3: Install Frontend Dependencies

Open another terminal:

```bash
cd frontend
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local frontend URL displayed by Vite in the terminal.

### Step 4: C++ Engine

The backend communicates with the C++ engine through the JSONL worker.

Build the C++ worker using the build configuration and instructions included in the repository. Ensure that the worker can access the required dataset directory.

The real dataset is located in:

```text
data/real/
```

The project also retains synthetic data as a backup for development and testing.

### Step 5: Machine Learning Environment

Python dependencies are required when running or retraining the machine-learning pipeline.

Refer to the Python scripts and their dependency files in the repository for the relevant setup and execution instructions.

## 9. Testing and Validation

The project has undergone dataset validation, graph-engine testing, backend testing and frontend build verification.

### Dataset Validation

- 1,086 locations loaded and validated.
- 2,362 road records validated.
- No dangling road references.
- No isolated locations in the validated network.
- Road geometry records matched with road IDs.
- All 2,362 risk predictions matched with their corresponding road-feature records.

### Software Testing

- Graph construction and dataset loading.
- Dijkstra and A* route calculation.
- Road blocking and reopening.
- Dynamic rerouting.
- Machine-learning prediction loading.
- Emergency management operations.
- Resource management operations.
- Backend API tests.
- Frontend production build.

The backend test suite has passed 40 tests following the road-geometry integration. Browser-level verification of the latest map changes remains subject to final testing.

## 10. Current Project Status

**Status: Active development — real geographical dataset and core system integration completed; final verification and further enhancements ongoing.**

The project currently includes:

- Real Dehradun-region geographical road network.
- C++ graph engine and custom data structures.
- Dijkstra, A*, BFS, DFS and articulation-point algorithms.
- Random Forest road-risk prediction integration.
- Road blocking, reopening and dynamic rerouting.
- Emergency management.
- Rescue resource management.
- Node.js and Express.js backend.
- React-based frontend.
- Leaflet-based road geometry visualization.
- JSON-backed operational data persistence.

### Current Limitations

- No automatic road-blockage detection.
- No continuous live weather or traffic feed.
- Emergency and resource records are simulated.
- No automated verification of citizen emergency reports.
- No automatic model retraining pipeline.
- No fully automatic rescue-resource dispatch.
- The application is currently a development prototype and is not deployed for official emergency operations.

## 11. Future Scope

- Integrating live weather and rainfall information.
- Integrating road-blockage reports from police, field officers and rescue teams.
- Adding verified citizen emergency reporting.
- Integrating flood sensors and water-level monitoring systems.
- Improving risk predictions using verified disaster observations.
- Implementing automatic resource allocation and dispatch.
- Adding hospital and shelter recommendations.
- Introducing a database for larger-scale operational data.
- Adding authentication and role-based access for authorities.
- Deploying the system for broader testing and evaluation.

## 12. Team Details

**Team Name:** DisasterX

**Team ID:** DSCPP-III-2026-T119

**Project Mentor:** Mr. Ram Ji Chauhan

| S. No. | Team Member |
|---|---|
| 1 | Parv Gautam |
| 2 | Kashish Rajput |
| 3 | Harsh Raunchela |
| 4 | Piyush Maurya |

## 13. Repository and Contributions

This repository contains the source code, geographical datasets, machine-learning components, backend, frontend and supporting documentation for the DisasterX project.

All team members contribute through their individual GitHub accounts. Individual commits help track development work and maintain project history.

**GitHub Repository:**  
[Dynamic Disaster Risk, Evacuation & Rescue Optimization](https://github.com/harsh-raunchela/dynamic-disaster-risk-rescue-optimization)

---

## 14. References and Data Sources

1. [OpenStreetMap](https://www.openstreetmap.org/)
2. [NASA Global Landslide Catalog](https://data.nasa.gov/)
3. [Open-Meteo](https://open-meteo.com/)
4. [Scikit-learn Documentation](https://scikit-learn.org/stable/)
5. [React Documentation](https://react.dev/)
6. [Node.js Documentation](https://nodejs.org/docs/latest/api/)
7. [Express.js Documentation](https://expressjs.com/)
8. [Leaflet Documentation](https://leafletjs.com/reference.html)
9. [Introduction to Algorithms, Cormen et al.](https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/)

---

**Developed by Team DisasterX**  
*Building a safer approach to disaster evacuation and rescue-route planning.*
