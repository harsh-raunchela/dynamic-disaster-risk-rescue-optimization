
#include <iostream>
#include <vector>
#include <string>

#include "Graph.h"
#include "RouteDecisionEngine.h"

using namespace std;

int main() {
    cout << "=== PHASE 7.4.15: A* NEGATIVE COST TEST ===\n\n";

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
    road.travelTime = -5;
    road.status = "Open";

    graph.addRoad("A", road);

    cout << "[TEST] Negative travel time must not be used\n";

    vector<string> route =
        RouteDecisionEngine::findAStarRoute(graph, "A", "B");

    if (!route.empty()) {
        cout << "Negative-cost edge rejection: FAIL\n";
        return 1;
    }

    cout << "Negative-cost edge rejection: PASS\n";
    cout << "\n=== NEGATIVE COST TEST PASSED ===\n";

    return 0;
}
