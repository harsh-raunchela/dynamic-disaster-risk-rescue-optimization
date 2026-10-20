
#include <iostream>
#include <vector>
#include <string>

#include "Graph.h"
#include "RouteDecisionEngine.h"

using namespace std;

int main() {
    cout << "=== PHASE 7.4.13: A* OPTIMAL ROUTE TEST ===\n\n";

    Graph graph;

    Location a;
    a.id = "A";
    a.name = "A";
    a.type = "Village";

    Location b;
    b.id = "B";
    b.name = "B";
    b.type = "Junction";

    Location c;
    c.id = "C";
    c.name = "C";
    c.type = "Junction";

    Location d;
    d.id = "D";
    d.name = "D";
    d.type = "Hospital";

    graph.addLocation(a);
    graph.addLocation(b);
    graph.addLocation(c);
    graph.addLocation(d);

    // Route A -> B -> D has total travel time 20.
    Edge ab;
    ab.destination = "B";
    ab.distance = 10;
    ab.travelTime = 10;
    ab.status = "Open";
    graph.addRoad("A", ab);

    Edge bd;
    bd.destination = "D";
    bd.distance = 10;
    bd.travelTime = 10;
    bd.status = "Open";
    graph.addRoad("B", bd);

    // Route A -> C -> D has total travel time 8.
    Edge ac;
    ac.destination = "C";
    ac.distance = 5;
    ac.travelTime = 3;
    ac.status = "Open";
    graph.addRoad("A", ac);

    Edge cd;
    cd.destination = "D";
    cd.distance = 5;
    cd.travelTime = 5;
    cd.status = "Open";
    graph.addRoad("C", cd);

    cout << "[TEST] Find the minimum travel-time route\n";

    vector<string> route =
        RouteDecisionEngine::findAStarRoute(graph, "A", "D");

    cout << "Selected route: ";
    for (size_t i = 0; i < route.size(); i++) {
        cout << route[i];
        if (i + 1 < route.size()) cout << " -> ";
    }
    cout << "\n";

    double cost = RouteDecisionEngine::getRouteCost(graph, route);
    cout << "Selected route cost: " << cost << "\n";

    if (route.size() != 3 ||
        route[0] != "A" ||
        route[1] != "C" ||
        route[2] != "D" ||
        cost != 8) {
        cout << "Optimal route selection: FAIL\n";
        return 1;
    }

    cout << "Optimal route selection: PASS\n";
    cout << "\n=== OPTIMAL ROUTE TEST PASSED ===\n";

    return 0;
}
