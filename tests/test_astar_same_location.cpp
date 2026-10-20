
#include <iostream>
#include <vector>
#include <string>

#include "Graph.h"
#include "RouteDecisionEngine.h"

using namespace std;

int main() {
    cout << "=== PHASE 7.4.12: A* SAME LOCATION TEST ===\n\n";

    Graph graph;

    Location a;
    a.id = "A";
    a.name = "Location A";
    a.type = "Village";
    a.latitude = 0;
    a.longitude = 0;
    a.capacity = 100;

    graph.addLocation(a);

    cout << "[TEST 1] Find route from A to A\n";

    vector<string> route =
        RouteDecisionEngine::findAStarRoute(graph, "A", "A");

    if (route.size() != 1 || route[0] != "A") {
        cout << "Same-location route: FAIL\n";
        return 1;
    }

    cout << "Same-location route: PASS\n";

    cout << "\n[TEST 2] Calculate route cost\n";

    double cost = RouteDecisionEngine::getRouteCost(graph, route);

    cout << "Route cost: " << cost << "\n";

    if (cost != 0.0) {
        cout << "Zero-cost route: FAIL\n";
        return 1;
    }

    cout << "Zero-cost route: PASS\n\n";
    cout << "=== SAME LOCATION TESTS PASSED ===\n";

    return 0;
}
