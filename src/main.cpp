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
    l1.name = "Rescue Station";
    l1.type = "Rescue Station";
    l1.latitude = 30.0000;
    l1.longitude = 78.0000;

    Location l2;
    l2.id = "LOC_0002";
    l2.name = "Dangerous Junction";
    l2.type = "Junction";
    l2.latitude = 30.0100;
    l2.longitude = 78.0100;

    Location l3;
    l3.id = "LOC_0003";
    l3.name = "Safe Junction";
    l3.type = "Junction";
    l3.latitude = 30.0050;
    l3.longitude = 78.0050;

    Location l4;
    l4.id = "LOC_0004";
    l4.name = "Emergency Location";
    l4.type = "Village";
    l4.latitude = 30.0200;
    l4.longitude = 78.0200;

    graph.addLocation(l1);
    graph.addLocation(l2);
    graph.addLocation(l3);
    graph.addLocation(l4);

    // Dangerous route
    Edge road1;
    road1.destination = "LOC_0002";
    road1.distance = 5;
    road1.travelTime = 10;
    road1.risk = "High";
    road1.traffic = "High";
    road1.roadCondition = "Severely Damaged";
    road1.status = "Open";
    graph.addRoad("LOC_0001", road1);

    Edge road2;
    road2.destination = "LOC_0004";
    road2.distance = 5;
    road2.travelTime = 10;
    road2.risk = "High";
    road2.traffic = "High";
    road2.roadCondition = "Severely Damaged";
    road2.status = "Open";
    graph.addRoad("LOC_0002", road2);

    // Safe route
    Edge road3;
    road3.destination = "LOC_0003";
    road3.distance = 6;
    road3.travelTime = 10;
    road3.risk = "Low";
    road3.traffic = "Low";
    road3.roadCondition = "Good";
    road3.status = "Open";
    graph.addRoad("LOC_0001", road3);

    Edge road4;
    road4.destination = "LOC_0004";
    road4.distance = 6;
    road4.travelTime = 10;
    road4.risk = "Low";
    road4.traffic = "Low";
    road4.roadCondition = "Good";
    road4.status = "Open";
    graph.addRoad("LOC_0003", road4);

    DisasterEngine engine(&graph);

    engine.findRoute(
        "LOC_0001",
        "LOC_0004"
    );

    return 0;
}