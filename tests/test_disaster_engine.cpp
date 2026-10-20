#include <iostream>
#include "Graph.h"
#include "DisasterEngine.h"

using namespace std;

int main()
{
    Graph graph;

    cout << "\n=== Loading Dataset ===\n";

    if (!graph.loadLocations("data/locations.csv") ||
        !graph.loadRoads("data/roads.csv"))
    {
        cout << "Dataset loading failed.\n";
        return 1;
    }

    DisasterEngine engine(&graph);

    Emergency emergency;
    emergency.id = "TEST_EMERGENCY_001";
    emergency.locationId = "LOC_0010";
    emergency.severity = 4;
    emergency.peopleAffected = 25;
    emergency.reportedTime = "10:00";

    engine.addEmergency(emergency);

    RescueResource resource;
    resource.id = "TEST_RESOURCE_001";
    resource.type = "Ambulance";
    resource.locationId = "LOC_0001";
    resource.priority = 1;

    engine.addResource(resource);

    cout << "\n=== Running Integrated Simulation ===\n";

    engine.runDisasterSimulation();

    return 0;
}