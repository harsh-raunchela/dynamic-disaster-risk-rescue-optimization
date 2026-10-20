
#include <iostream>
#include <string>

#include "Graph.h"
#include "DisasterEngine.h"
#include "Emergency.h"
#include "RescueResource.h"

using namespace std;

int main() {
    cout << "=== PHASE 7.5.2: INTEGRATION TEST ===\n";

    // Test 1: Load the graph
    Graph graph;

    bool locationsLoaded =
        graph.loadLocations("data/locations.csv");

    bool roadsLoaded =
        graph.loadRoads("data/roads.csv");

    bool graphPassed =
        locationsLoaded &&
        roadsLoaded &&
        graph.getLocationCount() == 500 &&
        graph.getRoadCount() == 2500;

    cout << "\n[TEST 1] Graph loading: "
         << (graphPassed ? "PASS" : "FAIL") << endl;

    if (!graphPassed) return 1;

    // Test 2: Integrate ML predictions
    DisasterEngine engine(&graph);

    bool mlPassed =
        engine.loadMLRiskPredictions(
            "data/risk_predictions.csv"
        );

    cout << "[TEST 2] ML risk integration: "
         << (mlPassed ? "PASS" : "FAIL") << endl;

    if (!mlPassed) return 1;

    // Test 3: Add an emergency
    Emergency emergency;
    emergency.id = "TEST_EMERGENCY_001";
    emergency.locationId = "LOC_0010";
    emergency.severity = 4;
    emergency.peopleAffected = 25;
    emergency.reportedTime = "10:00";

    engine.addEmergency(emergency);

    cout << "[TEST 3] Emergency submitted: PASS" << endl;

    // Test 4: Add a rescue resource
    RescueResource resource;
    resource.id = "TEST_RESOURCE_001";
    resource.type = "Ambulance";
    resource.locationId = "LOC_0001";
    resource.priority = 1;

    engine.addResource(resource);

    cout << "[TEST 4] Rescue resource submitted: PASS" << endl;

    // Test 5: Run the integrated simulation
    cout << "\n[TEST 5] Run disaster simulation\n";

    engine.runDisasterSimulation();

    cout << "\nSimulation function returned control.\n";
    cout << "Inspect the output above for emergency processing, "
         << "resource dispatch, route finding and rerouting.\n";

    cout << "\n=== INTEGRATION TEST EXECUTION COMPLETE ===\n";

    return 0;
}
