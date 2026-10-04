#include <iostream>
#include "Graph.h"

using namespace std;

int main()
{
    Graph graph;

    // -------------------------
    // Create locations
    // -------------------------

    Location l1{
        101,
        "Village A",
        "VILLAGE",
        30.1000,
        78.1000,
        200
    };

    Location l2{
        102,
        "Junction 1",
        "JUNCTION",
        30.1100,
        78.1100,
        0
    };

    Location l3{
        103,
        "Central Hospital",
        "HOSPITAL",
        30.1200,
        78.1200,
        500
    };

    graph.addLocation(l1);
    graph.addLocation(l2);
    graph.addLocation(l3);

    // -------------------------
    // Create roads
    // -------------------------

    Edge road1{
        102,
        5.0,
        10.0,
        20.0,
        30.0,
        90.0,
        false
    };

    Edge road2{
        103,
        7.0,
        15.0,
        25.0,
        40.0,
        85.0,
        false
    };

    graph.addRoad(101, road1);
    graph.addRoad(102, road2);

    // -------------------------
    // Display graph
    // -------------------------

    cout << "Initial Disaster Network:\n";
    graph.displayGraph();

    // -------------------------
    // Block road
    // -------------------------

    cout << "\nBlocking road 101 -> 102...\n";

    graph.blockRoad(101, 102);

    graph.displayGraph();

    // -------------------------
    // Unblock road
    // -------------------------

    cout << "\nRestoring road 101 -> 102...\n";

    graph.unblockRoad(101, 102);

    graph.displayGraph();

    return 0;
}