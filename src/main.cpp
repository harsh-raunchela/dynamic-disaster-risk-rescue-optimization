#include <iostream>

#include "Graph.h"
#include "BFS.h"
#include "DFS.h"

using namespace std;

int main()
{
    Graph graph;

    Location l1;
    l1.id = "LOC_0001";
    l1.name = "Village A";
    l1.type = "Village";

    Location l2;
    l2.id = "LOC_0002";
    l2.name = "Junction A";
    l2.type = "Junction";

    Location l3;
    l3.id = "LOC_0003";
    l3.name = "Hospital A";
    l3.type = "Hospital";

    Location l4;
    l4.id = "LOC_0004";
    l4.name = "Shelter A";
    l4.type = "Shelter";

    Location l5;
    l5.id = "LOC_0005";
    l5.name = "Rescue Station";
    l5.type = "Rescue Station";

    graph.addLocation(l1);
    graph.addLocation(l2);
    graph.addLocation(l3);
    graph.addLocation(l4);
    graph.addLocation(l5);

    Edge e1;
    e1.destination = "LOC_0002";
    e1.distance = 5;
    e1.travelTime = 10;
    e1.risk = "Low";
    e1.traffic = "Low";
    e1.roadCondition = "Good";
    e1.status = "Open";

    Edge e2;
    e2.destination = "LOC_0003";
    e2.distance = 7;
    e2.travelTime = 15;
    e2.risk = "Low";
    e2.traffic = "Medium";
    e2.roadCondition = "Good";
    e2.status = "Open";

    Edge e3;
    e3.destination = "LOC_0004";
    e3.distance = 4;
    e3.travelTime = 8;
    e3.risk = "Low";
    e3.traffic = "Low";
    e3.roadCondition = "Good";
    e3.status = "Open";

    Edge e4;
    e4.destination = "LOC_0005";
    e4.distance = 6;
    e4.travelTime = 12;
    e4.risk = "Medium";
    e4.traffic = "Low";
    e4.roadCondition = "Good";
    e4.status = "Open";

    graph.addRoad("LOC_0001", e1);
    graph.addRoad("LOC_0001", e2);
    graph.addRoad("LOC_0002", e3);
    graph.addRoad("LOC_0003", e4);

    cout << "Starting DFS from LOC_0001...\n";

graph.blockRoad("LOC_0001", "LOC_0002");

DFS::traverse(graph, "LOC_0001");

    return 0;
}