#include <iostream>

#include "Graph.h"
#include "DisasterEngine.h"

using namespace std;

int main()
{
    Graph graph;

    // Locations
    Location l1;
    l1.id = "LOC_0001";
    l1.name = "Village A";
    l1.type = "Village";

    Location l2;
    l2.id = "LOC_0002";
    l2.name = "Junction A";
    l2.type = "Junction";

    graph.addLocation(l1);
    graph.addLocation(l2);

    // Road
    Edge road;

    road.destination = "LOC_0002";
    road.distance = 5;
    road.travelTime = 10;
    road.risk = "Low";
    road.traffic = "Low";
    road.roadCondition = "Good";
    road.status = "Open";

    graph.addRoad(
        "LOC_0001",
        road
    );

    DisasterEngine engine(&graph);

    cout << "Initial road status:\n";

    engine.displayRoads(
        "LOC_0001"
    );

    // Block road
    cout << "\nSimulating disaster...\n";

    engine.blockRoad(
        "LOC_0001",
        "LOC_0002"
    );

    cout << "\nAfter disaster:\n";

    engine.displayRoads(
        "LOC_0001"
    );

    // Unblock road
    cout << "\nRoad cleared...\n";

    engine.unblockRoad(
        "LOC_0001",
        "LOC_0002"
    );

    cout << "\nAfter clearing:\n";

    engine.displayRoads(
        "LOC_0001"
    );

    return 0;
}
