#include <iostream>
#include <vector>
#include "Graph.h"
#include "RouteDecisionEngine.h"

using namespace std;

int main()
{
    Graph graph;

    Location A{}, B{}, C{};
    A.id = "A";
    B.id = "B";
    C.id = "C";

    graph.addLocation(A);
    graph.addLocation(B);
    graph.addLocation(C);

    // First parallel road is closed.
    Edge road1{};
    road1.id = "ROAD_A1";
    road1.destination = "B";
    road1.travelTime = 5;
    road1.status = "Closed";
    graph.addRoad("A", road1);

    // Second parallel road is open and usable.
    Edge road2{};
    road2.id = "ROAD_A2";
    road2.destination = "B";
    road2.travelTime = 12;
    road2.status = "Open";
    graph.addRoad("A", road2);

    Edge road3{};
    road3.id = "ROAD_BC";
    road3.destination = "C";
    road3.travelTime = 7;
    road3.status = "Open";
    graph.addRoad("B", road3);

    cout << "========== TEST 1: PARALLEL ROAD COST ==========\n";

    vector<string> route = {"A", "B", "C"};

    double cost = RouteDecisionEngine::getRouteCost(graph, route);

    bool costPassed = cost == 19.0;

    cout << "Expected cost: 19 | Actual: " << cost << '\n';
    cout << "Open parallel road selected: "
         << (costPassed ? "PASS" : "FAIL") << '\n';

    cout << "\n========== TEST 2: REROUTE CHECK ==========\n";

    vector<string> rerouted =
        RouteDecisionEngine::reroute(graph, route, "A", "C");

    bool routePassed =
        rerouted == route;

    cout << "Existing route retained: "
         << (routePassed ? "PASS" : "FAIL") << '\n';

    cout << "\n========== TEST 3: ALL PARALLEL ROADS CLOSED ==========\n";

    graph.blockRoad("A", "B");

    double closedCost =
        RouteDecisionEngine::getRouteCost(graph, route);

    bool closedPassed = closedCost == -1.0;

    cout << "Unavailable segment rejected: "
         << (closedPassed ? "PASS" : "FAIL") << '\n';

    vector<string> replacement =
        RouteDecisionEngine::reroute(graph, route, "A", "C");

    bool reroutePassed = replacement.empty();

    cout << "No alternative route reported correctly: "
         << (reroutePassed ? "PASS" : "FAIL") << '\n';

    bool allPassed =
        costPassed && routePassed && closedPassed && reroutePassed;

    cout << "\nRESULT: "
         << (allPassed ? "ALL TESTS PASSED" : "TEST FAILURE")
         << '\n';

    return allPassed ? 0 : 1;
}
