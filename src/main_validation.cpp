#include <iostream>
#include <vector>
#include <string>

#include "Graph.h"
#include "RiskPredictionLoader.h"
#include "Dijkstra.h"
#include "AStar.h"

using namespace std;

void displayRoute(const vector<string>& route) {
    if (route.empty()) {
        cout << "No route found." << endl;
        return;
    }

    for (size_t i = 0; i < route.size(); i++) {
        cout << route[i];

        if (i != route.size() - 1) {
            cout << " -> ";
        }
    }

    cout << endl;
}

int main() {
    Graph graph;

    cout << "Loading disaster dataset..." << endl;

    if (!graph.loadLocations("data/locations.csv")) {
        cout << "Failed to load locations." << endl;
        return 1;
    }

    if (!graph.loadRoads("data/roads.csv")) {
        cout << "Failed to load roads." << endl;
        return 1;
    }

    cout << "\n========================================\n";
    cout << "PHASE 6.7: ML-AWARE ROUTING VALIDATION\n";
    cout << "========================================\n";

    string source = "LOC_0001";
    string destination = "LOC_0010";

    // Dijkstra before ML predictions
    cout << "\n--- BEFORE ML RISK PREDICTIONS ---\n";

    vector<string> dijkstraBefore =
        Dijkstra::findShortestPath(graph, source, destination);

    cout << "Dijkstra route: ";
    displayRoute(dijkstraBefore);

    cout << "Dijkstra cost: "
         << Dijkstra::getShortestCost(graph, source, destination)
         << endl;

    // A* before ML predictions
    vector<string> aStarBefore =
        AStar::findPath(graph, source, destination);

    cout << "\nA* route: ";
    displayRoute(aStarBefore);

    cout << "A* cost: "
         << AStar::getPathCost(graph, source, destination)
         << endl;

    // Load ML predictions into the graph
    cout << "\n--- LOADING ML RISK PREDICTIONS ---\n";

    if (!RiskPredictionLoader::load(
            graph, "data/risk_predictions.csv")) {
        cout << "Failed to load ML risk predictions." << endl;
        return 1;
    }

    cout << "\n--- AFTER ML RISK PREDICTIONS ---\n";

    // Dijkstra after ML predictions
    vector<string> dijkstraAfter =
        Dijkstra::findShortestPath(graph, source, destination);

    cout << "Dijkstra ML route: ";
    displayRoute(dijkstraAfter);

    cout << "Dijkstra ML cost: "
         << Dijkstra::getShortestCost(graph, source, destination)
         << endl;

    // A* after ML predictions
    vector<string> aStarAfter =
        AStar::findPath(graph, source, destination);

    cout << "\nA* ML route: ";
    displayRoute(aStarAfter);

    cout << "A* ML cost: "
         << AStar::getPathCost(graph, source, destination)
         << endl;

    cout << "\n========================================\n";
    cout << "PHASE 6.7 VALIDATION FINISHED\n";
    cout << "========================================\n";

    return 0;
}
