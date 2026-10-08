#include <iostream>

#include "LocationHashMap.h"
#include "PathStack.h"
#include "DisasterEngine.h"

using namespace std;

int main()
{
    // ==========================================
    // PATH STACK TEST
    // ==========================================

    PathStack pathStack;

    cout << "Building path...\n";

    pathStack.push("LOC_0001");
    pathStack.push("LOC_0042");
    pathStack.push("LOC_0105");
    pathStack.push("LOC_0231");

    cout << "\nStack after pushing locations:";
    pathStack.display();

    cout << "\nTop location:\n";
    cout << pathStack.peek() << endl;

    cout << "\nRemoving top location:\n";
    cout << "Removed: "
         << pathStack.pop()
         << endl;

    cout << "\nRemaining path:";
    pathStack.display();


    // ==========================================
    // LOCATION HASH MAP TEST
    // ==========================================

    LocationHashMap locationMap;

    Location loc1;
    loc1.id = "LOC_0001";
    loc1.name = "Village A";
    loc1.type = "Village";
    loc1.latitude = 30.3165;
    loc1.longitude = 78.0322;
    loc1.capacity = 100;

    Location loc2;
    loc2.id = "LOC_0042";
    loc2.name = "Hospital A";
    loc2.type = "Hospital";
    loc2.latitude = 30.3200;
    loc2.longitude = 78.0400;
    loc2.capacity = 200;

    Location loc3;
    loc3.id = "LOC_0105";
    loc3.name = "Shelter A";
    loc3.type = "Shelter";
    loc3.latitude = 30.3250;
    loc3.longitude = 78.0450;
    loc3.capacity = 500;

    cout << "\nAdding locations...\n";

    locationMap.insert(loc1);
    locationMap.insert(loc2);
    locationMap.insert(loc3);

    Location* result =
        locationMap.search("LOC_0042");

    cout << "\nSearching for LOC_0042:\n";

    if (result != nullptr)
    {
        cout << "Found: "
             << result->id << " | "
             << result->name << " | "
             << result->type
             << endl;
    }
    else
    {
        cout << "Location not found.\n";
    }

    cout << "\nChecking LOC_0105:\n";

    if (locationMap.contains("LOC_0105"))
    {
        cout << "Location exists.\n";
    }
    else
    {
        cout << "Location does not exist.\n";
    }

    cout << "\nRemoving LOC_0042...\n";

    locationMap.remove("LOC_0042");

    cout << "\nSearching again for LOC_0042:\n";

    if (locationMap.search("LOC_0042") == nullptr)
    {
        cout << "Location not found.\n";
    }

    locationMap.display();


    // ==========================================
    // DISASTER SIMULATION TEST
    // ==========================================

    cout << "\n\n====================================\n";
    cout << "      DISASTER SIMULATION TEST\n";
    cout << "====================================\n";

    Graph graph;

    // Locations
    graph.addLocation(loc1);

    Location loc4;
    loc4.id = "LOC_0004";
    loc4.name = "Rescue Zone";
    loc4.type = "Shelter";
    loc4.latitude = 30.3300;
    loc4.longitude = 78.0500;
    loc4.capacity = 300;

    Location loc5;
    loc5.id = "LOC_0002";
    loc5.name = "Junction A";
    loc5.type = "Junction";
    loc5.latitude = 30.3180;
    loc5.longitude = 78.0380;
    loc5.capacity = 150;

    Location loc6;
    loc6.id = "LOC_0003";
    loc6.name = "Junction B";
    loc6.type = "Junction";
    loc6.latitude = 30.3250;
    loc6.longitude = 78.0450;
    loc6.capacity = 150;

    graph.addLocation(loc5);
    graph.addLocation(loc6);
    graph.addLocation(loc4);


    // ==========================================
    // ROADS
    // ==========================================

    Edge road1;
    road1.destination = "LOC_0002";
    road1.distance = 10;
    road1.travelTime = 15;
    road1.risk = 2;
    road1.traffic = 2;
    road1.roadCondition = "Good";
    road1.status = "Open";

    Edge road2;
    road2.destination = "LOC_0004";
    road2.distance = 10;
    road2.travelTime = 15;
    road2.risk = 2;
    road2.traffic = 2;
    road2.roadCondition = "Good";
    road2.status = "Open";

    Edge road3;
    road3.destination = "LOC_0003";
    road3.distance = 8;
    road3.travelTime = 10;
    road3.risk = 1;
    road3.traffic = 1;
    road3.roadCondition = "Good";
    road3.status = "Open";

    Edge road4;
    road4.destination = "LOC_0004";
    road4.distance = 8;
    road4.travelTime = 10;
    road4.risk = 1;
    road4.traffic = 1;
    road4.roadCondition = "Good";
    road4.status = "Open";

    graph.addRoad("LOC_0001", road1);
    graph.addRoad("LOC_0002", road2);
    graph.addRoad("LOC_0001", road3);
    graph.addRoad("LOC_0003", road4);


    // ==========================================
    // DISASTER ENGINE
    // ==========================================

    DisasterEngine engine(&graph);


    // ==========================================
    // EMERGENCY
    // ==========================================

    Emergency emergency;

    emergency.id = "EMG_0001";
    emergency.locationId = "LOC_0004";
    emergency.severity = 10;
    emergency.peopleAffected = 75;
    emergency.reportedTime = "11:30";

    engine.addEmergency(emergency);


    // ==========================================
    // RESCUE RESOURCES
    // ==========================================

    RescueResource resource1;

    resource1.id = "RES_001";
    resource1.type = "Ambulance";
    resource1.locationId = "LOC_0001";
    resource1.priority = 25;

    RescueResource resource2;

    resource2.id = "RES_002";
    resource2.type = "Rescue Team";
    resource2.locationId = "LOC_0001";
    resource2.priority = 10;

    engine.addResource(resource1);
    engine.addResource(resource2);


    // ==========================================
    // RUN COMPLETE SIMULATION
    // ==========================================

    engine.runDisasterSimulation();

    return 0;
}