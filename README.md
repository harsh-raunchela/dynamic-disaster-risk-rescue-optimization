
# Dynamic Disaster Risk, Evacuation & Rescue Optimization

A C++ and Data Structures & Algorithms-based system designed to support evacuation planning, emergency prioritization, and rescue route optimization during dynamic disaster situations.

## 1. Problem Statement

During disasters, roads may become blocked or unsafe, emergencies require different levels of priority, and rescue resources must be allocated efficiently.

The objective of this project is to develop a disaster management system that models a disaster-affected region as a dynamic weighted graph and supports route planning, emergency management, resource allocation, and dynamic rerouting when road conditions change.

## 2. Project Overview

The system represents locations as graph vertices and roads as weighted edges. Road conditions can be updated to simulate changing disaster scenarios.

### Key Features

- Graph-based representation of locations and roads
- Emergency management and prioritization
- Rescue resource management
- Shortest-path route planning using Dijkstra's algorithm
- Road blocking and unblocking
- Dynamic rerouting when a road becomes unavailable
- Machine learning-based road-risk prediction
- Disaster scenario simulation through a command-line interface

### Planned Enhancements

- Risk-aware route cost optimization
- Critical road detection
- Hospital and shelter selection
- Map-based visualization

## 3. Technologies and Tools Used

| Category | Technologies |
|---|---|
| Programming Languages | C++, Python |
| Data Structures | Graph, Priority Queue, Min Heap, Hash Map, Queue, Stack, Set |
| Algorithms | Dijkstra, BFS, DFS, A* |
| Machine Learning | Scikit-learn, NumPy, Pandas |
| Data Storage | CSV files |
| Development Tools | Visual Studio Code, g++, Git, GitHub |

**Future technology integrations:** MySQL, React.js, Node.js, Express.js, Leaflet, and OpenStreetMap.

## 4. Project Modules

### 4.1 Graph and Dataset Management
Loads location and road information from CSV files and represents the disaster network using an adjacency-list graph.

### 4.2 Machine Learning Risk Prediction
Uses a Python-based machine learning model to generate road-risk predictions, which are exported to a CSV file and loaded into the C++ system.

### 4.3 Emergency Management
Supports adding and managing emergencies for disaster-response simulations.

### 4.4 Rescue Resource Management
Manages rescue resources, such as ambulances, using a priority-based resource management mechanism.

### 4.5 Route Planning
Calculates routes between locations using graph-based shortest-path algorithms.

### 4.6 Road and Disaster Control
Allows road conditions to be changed, including blocking and unblocking roads, to simulate disaster-related disruptions.

### 4.7 Dynamic Disaster Simulation
Simulates an emergency response, identifies when a route becomes unavailable, and recalculates an alternative route when possible.

## 5. Project Setup and Installation

### Prerequisites

- C++ compiler supporting C++17 or later
- Python 3
- Git
- Visual Studio Code or another code editor

### Step 1: Clone the Repository

```bash
git clone https://github.com/harsh-raunchela/dynamic-disaster-risk-rescue-optimization.git
cd dynamic-disaster-risk-rescue-optimization
```

### Step 2: Compile the C++ Project

Run the command from the project root directory:

```bash
g++ src/*.cpp -Iinclude -o disaster_demo.exe
```

### Step 3: Run the Application

On Windows PowerShell:

```powershell
.\disaster_demo.exe
```

### Step 4: Load the Dataset

Use the command-line menu to load the disaster dataset and machine learning risk predictions before running the relevant modules.

The expected dataset files are stored in the `data/` directory.

### Step 5: Run a Simulation

Use the application menu to manage emergencies, add rescue resources, plan routes, modify road conditions, and execute a disaster-response simulation.

**Note:** Python environment setup and model-training dependencies may be required when retraining the machine learning model. Refer to the Python scripts for the exact dependencies and execution commands.

## 6. Dataset

The current dataset contains:

- **500 locations**
- **2,500 road records**
- Machine learning-generated road-risk predictions

The dataset is stored in CSV format and is used to construct the disaster network and test route planning and simulation scenarios.

The current dataset is intended primarily for development and testing. Its predictions should not be interpreted as validated real-world disaster forecasts.

## 7. Team Details

**Team Name:** DisasterX

**Team ID:** DSCPP-III-2026-T119

| S. No. | Team Member |
|---|---|
| 1 | Parv Gautam |
| 2 | Kashish Rajput |
| 3 | Harsh Raunchela |
| 4 | Piyush Maurya |

## 8. Current Project Status

**Status: Under development — PBL Phase II completed; further development and testing ongoing.**

The project currently includes:

- Graph construction and CSV dataset loading
- Integration of machine learning-generated road-risk predictions
- Emergency and rescue resource management
- Graph-based route planning
- Road blocking and unblocking
- Dynamic rerouting during disaster simulation
- Command-line interface for interacting with the system

Further work includes comprehensive testing, improvement of risk-aware route optimization, validation of machine learning predictions, and development of additional disaster-management features.

## 9. Future Scope

- Incorporating risk scores directly into route-cost calculations
- Integrating real-time disaster and traffic information
- Developing a map-based interface for visualizing locations and routes
- Adding hospital and shelter selection
- Integrating a database for persistent data storage
- Improving model validation using realistic datasets
- Extending the system for larger and more complex disaster scenarios

## 10. Repository and Contributions

This repository contains the source code, datasets, and supporting files for the Dynamic Disaster Risk, Evacuation & Rescue Optimization project.

All team members are expected to contribute through their individual GitHub accounts. Meaningful commits should reflect actual development work, and the repository should be updated regularly throughout the project.

**GitHub Repository:** [dynamic-disaster-risk-rescue-optimization](https://github.com/harsh-raunchela/dynamic-disaster-risk-rescue-optimization)
