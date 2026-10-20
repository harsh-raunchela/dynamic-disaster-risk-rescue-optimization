
#include <iostream>

#include "Graph.h"
#include "DisasterEngine.h"
#include "Emergency.h"
#include "RescueResource.h"

using namespace std;

int main() {
    cout << "=== TEST: NO RESCUE ROUTE AVAILABLE ===\n";

    Graph graph;

    // Build a small graph with two disconnected locations.
    Location A, B;
    A.id = "A";
    B.id = "B";

    graph.addLocation(A);
    graph.addLocation(B);

    DisasterEngine engine(&graph);

    Emergency emergency;
    emergency.id = "TEST_UNREACHABLE_EMERGENCY";
    emergency.locationId = "B";
    emergency.severity = 4;
    emergency.peopleAffected = 10;
    emergency.reportedTime = "11:00";

    RescueResource resource;
    resource.id = "TEST_UNREACHABLE_RESOURCE";
    resource.type = "Ambulance";
    resource.locationId = "A";
    resource.priority = 1;

    engine.addEmergency(emergency);
    engine.addResource(resource);

    // Risk predictions cannot be loaded for this synthetic graph.
    // Exercise the routing failure directly instead.
    cout << "\n[TEST 1] Find route between disconnected locations\n";

    vector<string> route =
        RouteDecisionEngine::findBestRoute(graph, "A", "B");

    bool routeUnavailable = route.empty();

    cout << "Disconnected route returns empty result: "
         << (routeUnavailable ? "PASS" : "FAIL") << endl;

    cout << "\n[TEST 2] Engine handles missing route\n";

    engine.findRoute("A", "B");

    cout << "\n=== NO-ROUTE TEST COMPLETE ===\n";

    return routeUnavailable ? 0 : 1;
}
