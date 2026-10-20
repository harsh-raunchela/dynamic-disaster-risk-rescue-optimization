
#include <iostream>
#include <vector>
#include <string>
#include <cmath>

#include "Graph.h"
#include "RouteDecisionEngine.h"

using namespace std;

int main() {
    cout << "=== PHASE 7.4.8: ROUTE COST TEST ===\n";

    Graph graph;

    // Create locations A, B and C
    Location A, B, C;
    A.id = "A";
    B.id = "B";
    C.id = "C";

    graph.addLocation(A);
    graph.addLocation(B);
    graph.addLocation(C);

    // Road A -> B: travel time 10
    Edge roadAB{};
    roadAB.destination = "B";
    roadAB.distance = 5;
    roadAB.travelTime = 10;
    roadAB.status = "Open";
    graph.addRoad("A", roadAB);

    // Road B -> C: travel time 20
    Edge roadBC{};
    roadBC.destination = "C";
    roadBC.distance = 8;
    roadBC.travelTime = 20;
    roadBC.status = "Open";
    graph.addRoad("B", roadBC);

    vector<string> route = {"A", "B", "C"};

    // Test 1: Valid route cost
    cout << "\n[TEST 1] Valid route cost\n";

    double cost =
        RouteDecisionEngine::getRouteCost(graph, route);

    bool sumPasses = abs(cost - 30.0) < 0.001;

    cout << "Expected: 30 | Actual: " << cost << endl;
    cout << "Travel-time sum: "
         << (sumPasses ? "PASS" : "FAIL") << endl;

    // Test 2: Empty route must be rejected
    cout << "\n[TEST 2] Empty route\n";

    vector<string> emptyRoute;

    double emptyCost =
        RouteDecisionEngine::getRouteCost(graph, emptyRoute);

    bool emptyPasses = abs(emptyCost + 1.0) < 0.001;

    cout << "Expected: -1 | Actual: " << emptyCost << endl;
    cout << "Empty route rejected: "
         << (emptyPasses ? "PASS" : "FAIL") << endl;

    // Test 3: Missing connection must be rejected
    cout << "\n[TEST 3] Missing road\n";

    vector<string> missingRoadRoute = {"A", "C"};

    double missingRoadCost =
        RouteDecisionEngine::getRouteCost(graph, missingRoadRoute);

    bool missingRoadPasses =
        abs(missingRoadCost + 1.0) < 0.001;

    cout << "Expected: -1 | Actual: "
         << missingRoadCost << endl;

    cout << "Missing road rejected: "
         << (missingRoadPasses ? "PASS" : "FAIL") << endl;

    // Test 4: Closed connection must be rejected
    cout << "\n[TEST 4] Closed road\n";

    graph.blockRoad("A", "B");

    double closedCost =
        RouteDecisionEngine::getRouteCost(graph, route);

    bool closedRoadPasses =
        abs(closedCost + 1.0) < 0.001;

    cout << "Expected: -1 | Actual: " << closedCost << endl;
    cout << "Closed-road route rejected: "
         << (closedRoadPasses ? "PASS" : "FAIL") << endl;

    bool allPassed =
        sumPasses &&
        emptyPasses &&
        missingRoadPasses &&
        closedRoadPasses;

    cout << "\n=== ROUTE COST TEST: "
         << (allPassed ? "ALL TESTS PASSED" : "SOME TESTS FAILED")
         << " ===\n";

    return allPassed ? 0 : 1;
}
