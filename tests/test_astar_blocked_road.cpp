
#include <iostream>
#include <vector>
#include <string>
#include "Graph.h"
#include "RouteDecisionEngine.h"

using namespace std;

int main() {
    cout << "=== PHASE 7.4.10: A* BLOCKED ROAD TEST ===\n\n";

    Graph graph;
    graph.loadLocations("data/locations.csv");
    graph.loadRoads("data/roads.csv");

    string source = "LOC_0001";
    string destination = "LOC_0010";

    cout << "[TEST 1] Find initial route\n";

    vector<string> initialRoute =
        RouteDecisionEngine::findAStarRoute(
            graph, source, destination
        );

    if (initialRoute.size() < 2) {
        cout << "Initial route: FAIL\n";
        return 1;
    }

    double initialCost =
        RouteDecisionEngine::getRouteCost(graph, initialRoute);

    cout << "Initial route cost: " << initialCost << "\n";
    cout << "Initial route: PASS\n\n";

    cout << "[TEST 2] Block the first road\n";

    string nextLocation = initialRoute[1];
    graph.blockRoad(source, nextLocation);

    vector<string> updatedRoute =
        RouteDecisionEngine::findAStarRoute(
            graph, source, destination
        );

    if (updatedRoute.empty()) {
        cout << "Alternative route found: FAIL\n";
        return 1;
    }

    cout << "Updated route: ";
    for (size_t i = 0; i < updatedRoute.size(); i++) {
        cout << updatedRoute[i];
        if (i + 1 < updatedRoute.size()) cout << " -> ";
    }
    cout << "\n";

    cout << "[TEST 3] Verify blocked road is avoided\n";

    if (updatedRoute.size() > 1 &&
        updatedRoute[0] == source &&
        updatedRoute[1] == nextLocation) {
        cout << "Blocked road avoided: FAIL\n";
        return 1;
    }

    double updatedCost =
        RouteDecisionEngine::getRouteCost(graph, updatedRoute);

    if (updatedCost < 0) {
        cout << "Updated route validity: FAIL\n";
        return 1;
    }

    cout << "Blocked road avoided: PASS\n";
    cout << "Updated route cost: " << updatedCost << "\n";
    cout << "Updated route validity: PASS\n\n";

    cout << "=== BLOCKED ROAD TESTS PASSED ===\n";
    return 0;
}
