#include <iostream>
#include "Graph.h"

using namespace std;

int main()
{
    Graph graph;


    // --------------------------------------------------
    // CREATE LOCATIONS
    // --------------------------------------------------

    Location l1{
        "LOC_0001",
        "Village A",
        "VILLAGE",
        30.1000,
        78.1000,
        200
    };

    Location l2{
        "LOC_0002",
        "Junction 1",
        "JUNCTION",
        30.1100,
        78.1100,
        0
    };

    Location l3{
        "LOC_0003",
        "Central Hospital",
        "HOSPITAL",
        30.1200,
        78.1200,
        500
    };


    // --------------------------------------------------
    // ADD LOCATIONS TO GRAPH
    // --------------------------------------------------

    graph.addLocation(l1);
    graph.addLocation(l2);
    graph.addLocation(l3);


    // --------------------------------------------------
    // CREATE ROADS
    // --------------------------------------------------

    Edge road1{
        "LOC_0002",
        5.0,
        10.0,
        "Medium",
        "Low",
        "Good",
        "Open"
    };

    Edge road2{
        "LOC_0003",
        7.0,
        15.0,
        "High",
        "Medium",
        "Fair",
        "Open"
    };


    // --------------------------------------------------
    // ADD ROADS
    // --------------------------------------------------

    graph.addRoad("LOC_0001", road1);
    graph.addRoad("LOC_0002", road2);


    // --------------------------------------------------
    // DISPLAY INITIAL GRAPH
    // --------------------------------------------------

    cout << "========================================\n";
    cout << "       INITIAL DISASTER NETWORK\n";
    cout << "========================================\n";

    graph.displayGraph();


    // --------------------------------------------------
    // BLOCK ROAD
    // --------------------------------------------------

    cout << "\n========================================\n";
    cout << "Blocking road LOC_0001 -> LOC_0002\n";
    cout << "========================================\n";

    graph.blockRoad("LOC_0001", "LOC_0002");

    graph.displayGraph();


    // --------------------------------------------------
    // UNBLOCK ROAD
    // --------------------------------------------------

    cout << "\n========================================\n";
    cout << "Restoring road LOC_0001 -> LOC_0002\n";
    cout << "========================================\n";

    graph.unblockRoad("LOC_0001", "LOC_0002");

    graph.displayGraph();


    // --------------------------------------------------
    // UPDATE ROAD
    // --------------------------------------------------

    cout << "\n========================================\n";
    cout << "Updating road LOC_0002 -> LOC_0003\n";
    cout << "========================================\n";

    Edge updatedRoad{
        "LOC_0003",
        8.5,
        20.0,
        "Critical",
        "Severe",
        "Damaged",
        "Restricted"
    };

    graph.updateRoad(
        "LOC_0002",
        "LOC_0003",
        updatedRoad
    );

    graph.displayGraph();


    // --------------------------------------------------
    // REMOVE ROAD
    // --------------------------------------------------

    cout << "\n========================================\n";
    cout << "Removing road LOC_0002 -> LOC_0003\n";
    cout << "========================================\n";

    graph.removeRoad(
        "LOC_0002",
        "LOC_0003"
    );

    graph.displayGraph();


    return 0;
}