
#include <iostream>
#include <vector>
#include <string>

#include "Graph.h"
#include "RouteDecisionEngine.h"

using namespace std;

int main() {
    cout << "=== PHASE 7.4.17: ROUTE COST NEGATIVE TEST ===\n\n";

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

    vector<string> route = {"A", "B"};

    cout << "[TEST] Calculate cost of route with negative travel time\n";

    double cost = RouteDecisionEngine::getRouteCost(graph, route);

    cout << "Returned cost: " << cost << "\n";

    if (cost != -1.0) {
        cout << "Negative-cost route rejected: FAIL\n";
        return 1;
    }

    cout << "Negative-cost route rejected: PASS\n";
    cout << "\n=== ROUTE COST NEGATIVE TEST PASSED ===\n";

    return 0;
}
