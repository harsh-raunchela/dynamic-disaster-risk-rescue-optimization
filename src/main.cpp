#include <iostream>

#include "Graph.h"
#include "DisasterEngine.h"

using namespace std;

int main()
{
    Graph graph;

    // Add locations
    Location l1;
    l1.id = "LOC_0001";
    l1.name = "Village A";
    l1.type = "Village";

    Location l2;
    l2.id = "LOC_0002";
    l2.name = "Village B";
    l2.type = "Village";

    graph.addLocation(l1);
    graph.addLocation(l2);

    // Create disaster engine
    DisasterEngine engine(&graph);

    // Create emergency reports
    Emergency e1;
    e1.id = "EMG_0001";
    e1.locationId = "LOC_0001";
    e1.severity = 5;
    e1.peopleAffected = 20;
    e1.reportedTime = "10:30";

    Emergency e2;
    e2.id = "EMG_0002";
    e2.locationId = "LOC_0002";
    e2.severity = 9;
    e2.peopleAffected = 50;
    e2.reportedTime = "10:35";

    Emergency e3;
    e3.id = "EMG_0003";
    e3.locationId = "LOC_0001";
    e3.severity = 3;
    e3.peopleAffected = 10;
    e3.reportedTime = "10:40";

    // Add emergencies
    cout << "Adding emergency reports...\n";

    engine.addEmergency(e1);
    engine.addEmergency(e2);
    engine.addEmergency(e3);

    // Display queue
    engine.displayEmergencies();

    // Process highest priority emergency
    engine.processNextEmergency();

    // Display remaining emergencies
    engine.displayEmergencies();

    // Add rescue resources
    RescueResource r1;
    r1.id = "RES_001";
    r1.type = "Ambulance";
    r1.locationId = "LOC_0001";
    r1.priority = 25;

    RescueResource r2;
    r2.id = "RES_002";
    r2.type = "Rescue Team";
    r2.locationId = "LOC_0002";
    r2.priority = 10;

    RescueResource r3;
    r3.id = "RES_003";
    r3.type = "Fire Truck";
    r3.locationId = "LOC_0001";
    r3.priority = 40;

    // Add resources to resource heap
    engine.addResource(r1);
    engine.addResource(r2);
    engine.addResource(r3);

    // Dispatch highest priority resource
    engine.dispatchResource();

    return 0;
}
