
#include <iostream>
#include <vector>
#include <string>

#include "Graph.h"
#include "RouteDecisionEngine.h"

using namespace std;

int main() {
    cout << "=== PHASE 7.4.7: UNREACHABLE ROUTE TEST ===\n";

    Graph graph;

    // Create three locations
    Location A, B, C;
    A.id = "A";
    B.id = "B";
    C.id = "C";

    graph.addLocation(A);
    graph.addLocation(B);
    graph.addLocation(C);

    // Create a road from A to B
    Edge road;
    road.destination = "B";
    road.travelTime = 10;
    road.status = "Open";

    graph.addRoad("A", road);

    // Test 1: Route exists before blocking
    cout << "\n[TEST 1] Route exists before blocking\n";

    vector<string> route =
        RouteDecisionEngine::findBestRoute(graph, "A", "B");

    bool routeExists =
        !route.empty() &&
        route.front() == "A" &&
        route.back() == "B";

    cout << "Route A -> B exists: "
         << (routeExists ? "PASS" : "FAIL") << endl;

    // Test 2: Block the only road
    cout << "\n[TEST 2] Block the only road\n";

    graph.blockRoad("A", "B");

    vector<string> blockedRoute =
        RouteDecisionEngine::findBestRoute(graph, "A", "B");

    bool unreachableHandled = blockedRoute.empty();

    cout << "Route after blocking A -> B is empty: "
         << (unreachableHandled ? "PASS" : "FAIL") << endl;

    // Test 3: Unknown destination
    cout << "\n[TEST 3] Unknown destination\n";

    vector<string> unknownRoute =
        RouteDecisionEngine::findBestRoute(graph, "A", "UNKNOWN");

    bool unknownHandled = unknownRoute.empty();

    cout << "Unknown destination returns empty route: "
         << (unknownHandled ? "PASS" : "FAIL") << endl;

    bool allPassed =
        routeExists && unreachableHandled && unknownHandled;

    cout << "\n=== UNREACHABLE ROUTE TEST: "
         << (allPassed ? "ALL TESTS PASSED" : "SOME TESTS FAILED")
         << " ===\n";

    return allPassed ? 0 : 1;
}
