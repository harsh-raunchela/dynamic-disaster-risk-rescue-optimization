
#include <iostream>
#include <vector>
#include <string>

#include "Graph.h"
#include "RouteDecisionEngine.h"

using namespace std;

int main() {
    cout << "=== PHASE 7.4.20: DIJKSTRA UNREACHABLE TEST ===\n\n";

    Graph graph;

    Location a;
    a.id = "A";
    a.name = "Location A";
    a.type = "Village";

    Location b;
    b.id = "B";
    b.name = "Location B";
    b.type = "Hospital";

    graph.addLocation(a);
    graph.addLocation(b);

    Edge road;
    road.destination = "B";
    road.distance = 10;
    road.travelTime = 10;
    road.status = "Open";

    graph.addRoad("A", road);

    cout << "[TEST 1] Route exists before blocking\n";

    vector<string> route =
        RouteDecisionEngine::findBestRoute(graph, "A", "B");

    if (route.size() != 2) {
        cout << "Initial route: FAIL\n";
        return 1;
    }

    cout << "Initial route: PASS\n\n";

    cout << "[TEST 2] Block the only road\n";

    graph.blockRoad("A", "B");

    route = RouteDecisionEngine::findBestRoute(graph, "A", "B");

    if (!route.empty()) {
        cout << "Unreachable destination handling: FAIL\n";
        return 1;
    }

    cout << "Unreachable destination handling: PASS\n\n";

    cout << "[TEST 3] Unknown destination\n";

    route = RouteDecisionEngine::findBestRoute(graph, "A", "UNKNOWN");

    if (!route.empty()) {
        cout << "Unknown destination handling: FAIL\n";
        return 1;
    }

    cout << "Unknown destination handling: PASS\n\n";

    cout << "=== DIJKSTRA UNREACHABLE TESTS PASSED ===\n";

    return 0;
}

