
#include <iostream>
#include <vector>
#include <string>

#include "Graph.h"
#include "RouteDecisionEngine.h"

using namespace std;

int main() {
    cout << "=== PHASE 7.4.6: BLOCKED ROAD TEST ===\n";

    Graph graph;

    // Test 1: Load graph
    cout << "\n[TEST 1] Load dataset\n";

    bool locationsLoaded =
        graph.loadLocations("data/locations.csv");

    bool roadsLoaded =
        graph.loadRoads("data/roads.csv");

    if (!locationsLoaded || !roadsLoaded) {
        cout << "Dataset loading: FAIL\n";
        return 1;
    }

    cout << "Dataset loading: PASS\n";

    string source = "LOC_0001";
    string destination = "LOC_0010";

    // Test 2: Find initial route
    cout << "\n[TEST 2] Find initial route\n";

    vector<string> originalRoute =
        RouteDecisionEngine::findBestRoute(
            graph, source, destination
        );

    if (originalRoute.size() < 2) {
        cout << "Initial route: FAIL\n";
        return 1;
    }

    cout << "Initial route: ";
    for (size_t i = 0; i < originalRoute.size(); i++) {
        cout << originalRoute[i];
        if (i + 1 < originalRoute.size()) cout << " -> ";
    }
    cout << "\nInitial route: PASS\n";

    // Block the first road in the route
    string blockedSource = originalRoute[0];
    string blockedDestination = originalRoute[1];

    cout << "\n[TEST 3] Block a road on the route\n";
    cout << "Blocking: " << blockedSource
         << " -> " << blockedDestination << endl;

    graph.blockRoad(blockedSource, blockedDestination);

    bool roadBlocked = false;

    for (const Edge& road : graph.getNeighbors(blockedSource)) {
        if (road.destination == blockedDestination &&
            road.status == "Closed") {
            roadBlocked = true;
            break;
        }
    }

    cout << "Road marked Closed: "
         << (roadBlocked ? "PASS" : "FAIL") << endl;

    if (!roadBlocked) return 1;

    // Test 4: Recalculate route
    cout << "\n[TEST 4] Reroute around blocked road\n";

    vector<string> newRoute =
        RouteDecisionEngine::reroute(
            graph, originalRoute, source, destination
        );

    bool validAlternative =
        !newRoute.empty() &&
        newRoute.front() == source &&
        newRoute.back() == destination;

    bool avoidsBlockedRoad = true;

    for (size_t i = 0; i + 1 < newRoute.size(); i++) {
        if (newRoute[i] == blockedSource &&
            newRoute[i + 1] == blockedDestination) {
            avoidsBlockedRoad = false;
            break;
        }
    }

    cout << "New route: ";
    if (newRoute.empty()) {
        cout << "No route available";
    } else {
        for (size_t i = 0; i < newRoute.size(); i++) {
            cout << newRoute[i];
            if (i + 1 < newRoute.size()) cout << " -> ";
        }
    }
    cout << endl;

    cout << "Valid source-to-destination route: "
         << (validAlternative ? "PASS" : "FAIL") << endl;

    cout << "Avoids blocked road: "
         << (avoidsBlockedRoad ? "PASS" : "FAIL") << endl;

    bool allPassed =
        validAlternative && avoidsBlockedRoad;

    cout << "\n=== BLOCKED ROAD TEST: "
         << (allPassed ? "PASSED" : "FAILED")
         << " ===\n";

    return allPassed ? 0 : 1;
}
