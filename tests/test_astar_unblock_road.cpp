
#include <iostream>
#include <vector>
#include <string>

#include "Graph.h"
#include "RouteDecisionEngine.h"

using namespace std;

int main() {
    cout << "=== PHASE 7.4.14: A* UNBLOCK ROAD TEST ===\n\n";

    Graph graph;

    Location a;
    a.id = "A";
    a.name = "A";
    a.type = "Village";

    Location b;
    b.id = "B";
    b.name = "B";
    b.type = "Hospital";

    graph.addLocation(a);
    graph.addLocation(b);

    Edge road;
    road.destination = "B";
    road.distance = 10;
    road.travelTime = 10;
    road.status = "Open";

    graph.addRoad("A", road);

    cout << "[TEST 1] Initial route exists\n";

    vector<string> route =
        RouteDecisionEngine::findAStarRoute(graph, "A", "B");

    if (route.size() != 2) {
        cout << "Initial route: FAIL\n";
        return 1;
    }

    cout << "Initial route: PASS\n\n";

    cout << "[TEST 2] Block road\n";

    graph.blockRoad("A", "B");

    route = RouteDecisionEngine::findAStarRoute(graph, "A", "B");

    if (!route.empty()) {
        cout << "Blocked route rejection: FAIL\n";
        return 1;
    }

    cout << "Blocked route rejection: PASS\n\n";

    cout << "[TEST 3] Unblock road\n";

    graph.unblockRoad("A", "B");

    route = RouteDecisionEngine::findAStarRoute(graph, "A", "B");

    if (route.size() != 2 ||
        route[0] != "A" ||
        route[1] != "B") {
        cout << "Route restoration: FAIL\n";
        return 1;
    }

    cout << "Route restoration: PASS\n";
    cout << "Restored route cost: "
         << RouteDecisionEngine::getRouteCost(graph, route) << "\n\n";

    cout << "=== UNBLOCK ROAD TESTS PASSED ===\n";
    return 0;
}
