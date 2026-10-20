
#include <iostream>
#include <vector>
#include <string>
#include "Graph.h"
#include "RouteDecisionEngine.h"

using namespace std;

int main() {
    cout << "=== PHASE 7.4.9: A* ROUTE TEST ===\n\n";

    Graph graph;

    cout << "[TEST 1] Load graph dataset\n";
    graph.loadLocations("data/locations.csv");
    graph.loadRoads("data/roads.csv");

    cout << "Locations: " << graph.getLocationIds().size() << "\n";

    if (graph.getLocationIds().size() != 500) {
        cout << "Dataset loading: FAIL\n";
        return 1;
    }

    cout << "Dataset loading: PASS\n\n";

    string source = "LOC_0001";
    string destination = "LOC_0010";

    cout << "[TEST 2] Find route using A*\n";

    vector<string> astarRoute =
        RouteDecisionEngine::findAStarRoute(
            graph, source, destination
        );

    if (astarRoute.empty()) {
        cout << "A* route found: FAIL\n";
        return 1;
    }

    cout << "A* route: ";
    for (size_t i = 0; i < astarRoute.size(); i++) {
        cout << astarRoute[i];
        if (i + 1 < astarRoute.size()) cout << " -> ";
    }
    cout << "\nA* route found: PASS\n\n";

    cout << "[TEST 3] Compare route costs\n";

    vector<string> dijkstraRoute =
        RouteDecisionEngine::findBestRoute(
            graph, source, destination
        );

    double astarCost =
        RouteDecisionEngine::getRouteCost(graph, astarRoute);

    double dijkstraCost =
        RouteDecisionEngine::getRouteCost(graph, dijkstraRoute);

    cout << "A* route cost: " << astarCost << "\n";
    cout << "Dijkstra route cost: " << dijkstraCost << "\n";

    if (astarCost < 0 || dijkstraCost < 0 ||
        astarCost != dijkstraCost) {
        cout << "Optimal route cost comparison: FAIL\n";
        return 1;
    }

    cout << "Optimal route cost comparison: PASS\n\n";

    cout << "[TEST 4] Unknown destination\n";

    vector<string> invalidRoute =
        RouteDecisionEngine::findAStarRoute(
            graph, source, "UNKNOWN_LOCATION"
        );

    if (!invalidRoute.empty()) {
        cout << "Unknown destination handling: FAIL\n";
        return 1;
    }

    cout << "Unknown destination handling: PASS\n\n";

    cout << "=== A* TESTS PASSED ===\n";
    return 0;
}
