
#include <iostream>
#include <vector>
#include <string>
#include "Graph.h"
#include "RouteDecisionEngine.h"

using namespace std;

int main() {
    cout << "=== PHASE 7.4: ROUTE ALGORITHM TEST ===\n";

    Graph graph;

    // Test 1: Load the dataset
    cout << "\n[TEST 1] Load graph dataset\n";

    bool locationsLoaded = graph.loadLocations("data/locations.csv");
    bool roadsLoaded = graph.loadRoads("data/roads.csv");

    cout << "Locations loaded: "
         << (locationsLoaded ? "PASS" : "FAIL") << endl;
    cout << "Roads loaded: "
         << (roadsLoaded ? "PASS" : "FAIL") << endl;

    if (!locationsLoaded || !roadsLoaded) {
        cout << "\nCannot continue: dataset loading failed.\n";
        return 1;
    }

    // Test 2: Find a route
    cout << "\n[TEST 2] Find best route\n";

    vector<string> route =
        RouteDecisionEngine::findBestRoute(
            graph, "LOC_0001", "LOC_0010"
        );

    bool routeFound =
        !route.empty() &&
        route.front() == "LOC_0001" &&
        route.back() == "LOC_0010";

    cout << "Route: ";
    for (size_t i = 0; i < route.size(); i++) {
        cout << route[i];
        if (i + 1 < route.size()) cout << " -> ";
    }
    cout << endl;

    cout << "Valid source-to-destination route: "
         << (routeFound ? "PASS" : "FAIL") << endl;

    // Test 3: Calculate route cost
    cout << "\n[TEST 3] Calculate route cost\n";

    if (routeFound) {
        double cost = RouteDecisionEngine::getRouteCost(graph, route);

        cout << "Route cost: " << cost << endl;

        bool validCost = cost >= 0.0;
        cout << "Non-negative route cost: "
             << (validCost ? "PASS" : "FAIL") << endl;

        if (!validCost) return 1;
    } else {
        cout << "SKIP: No valid route found.\n";
        return 1;
    }

    // Test 4: Handle an unknown destination
    cout << "\n[TEST 4] Unknown destination\n";

    vector<string> invalidRoute =
        RouteDecisionEngine::findBestRoute(
            graph, "LOC_0001", "LOC_9999"
        );

    bool invalidHandled = invalidRoute.empty();

    cout << "Unknown destination handled: "
         << (invalidHandled ? "PASS" : "FAIL") << endl;

    // Test 5: Reroute
    cout << "\n[TEST 5] Reroute between valid locations\n";

    vector<string> rerouted =
        RouteDecisionEngine::reroute(
            graph, route, "LOC_0001", "LOC_0010"
        );

    bool rerouteValid =
        !rerouted.empty() &&
        rerouted.front() == "LOC_0001" &&
        rerouted.back() == "LOC_0010";

    cout << "Rerouting preserves endpoints: "
         << (rerouteValid ? "PASS" : "FAIL") << endl;

    // Final result
    bool allPassed =
        routeFound && invalidHandled && rerouteValid;

    cout << "\n=== PHASE 7.4 BASIC TEST RESULT: "
         << (allPassed ? "ALL TESTS PASSED" : "SOME TESTS FAILED")
         << " ===\n";

    return allPassed ? 0 : 1;
}
