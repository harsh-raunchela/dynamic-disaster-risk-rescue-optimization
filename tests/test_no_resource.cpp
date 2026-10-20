
#include <iostream>

#include "Graph.h"
#include "DisasterEngine.h"
#include "Emergency.h"

using namespace std;

int main() {
    cout << "=== TEST: NO RESCUE RESOURCE AVAILABLE ===\n";

    Graph graph;

    if (!graph.loadLocations("data/locations.csv") ||
        !graph.loadRoads("data/roads.csv")) {
        cout << "Graph loading: FAIL\n";
        return 1;
    }

    DisasterEngine engine(&graph);

    Emergency emergency;
    emergency.id = "TEST_NO_RESOURCE";
    emergency.locationId = "LOC_0010";
    emergency.severity = 4;
    emergency.peopleAffected = 25;
    emergency.reportedTime = "10:00";

    engine.addEmergency(emergency);

    // Intentionally do not add a rescue resource.
    engine.runDisasterSimulation();

    cout << "\n=== NO-RESOURCE TEST EXECUTION COMPLETE ===\n";
    return 0;
}

