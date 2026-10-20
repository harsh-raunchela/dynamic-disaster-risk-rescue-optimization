
#include <iostream>
#include <vector>
#include <string>

#include "Graph.h"
#include "RouteDecisionEngine.h"

using namespace std;

int main() {
    cout << "=== PHASE 7.4.11: A* UNREACHABLE TEST ===\n\n";

    Graph graph;

    // Create two locations.
    Location a;
    a.id = "A";
    a.name = "Location A";
    a.type = "Village";
    a.latitude = 0;
    a.longitude = 0;
    a.capacity = 100;

    Location b;
    b.id = "B";
    b.name = "Location B";
    b.type = "Hospital";
    b.latitude = 1;
    b.longitude = 1;
    b.capacity = 100;

    graph.addLocation(a);
    graph.addLocation(b);

    // Create a road from A to B.
    Edge road;
    road.destination = "B";
    road.distance = 10;
    road.travelTime = 10;
    road.risk = 1;
    road.traffic = 1;
    road.roadCondition = 1;
    road.status = "Open";

    graph.addRoad("A", road);

    cout << "[TEST 1] Route exists before blocking\n";

    vector<string> route =
        RouteDecisionEngine::findAStarRoute(graph, "A", "B");

    if (route.size() != 2) {
        cout << "Initial route: FAIL\n";
        return 1;
    }

    cout << "Initial route: PASS\n\n";

    cout << "[TEST 2] Block the only road\n";

    graph.blockRoad("A", "B");

    route = RouteDecisionEngine::findAStarRoute(graph, "A", "B");

    if (!route.empty()) {
        cout << "Unreachable destination handling: FAIL\n";
        return 1;
    }

    cout << "Unreachable destination handling: PASS\n\n";

    cout << "[TEST 3] Unknown source\n";

    route = RouteDecisionEngine::findAStarRoute(
        graph, "UNKNOWN", "B"
    );

    if (!route.empty()) {
        cout << "Unknown source handling: FAIL\n";
        return 1;
    }

    cout << "Unknown source handling: PASS\n\n";

    cout << "=== UNREACHABLE TESTS PASSED ===\n";

    return 0;
}
