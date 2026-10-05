#include <iostream>

#include "Graph.h"

using namespace std;

int main()
{
    Graph graph;


    // ==================================================
    // LOAD LOCATIONS
    // ==================================================

    cout << "========================================\n";
    cout << "       DISASTERX GRAPH LOADING\n";
    cout << "========================================\n\n";

    if (!graph.loadLocations("data/locations.csv"))
    {
        return 1;
    }


    // ==================================================
    // LOAD ROADS
    // ==================================================

    if (!graph.loadRoads("data/roads.csv"))
    {
        return 1;
    }


    // ==================================================
    // DISPLAY STATISTICS
    // ==================================================

    cout << "\n========================================\n";
    cout << "          GRAPH STATISTICS\n";
    cout << "========================================\n";

    cout << "Total locations: "
         << graph.getLocationCount()
         << endl;

    cout << "Total roads: "
         << graph.getRoadCount()
         << endl;


    // ==================================================
    // TEST BLOCKING A ROAD
    // ==================================================

    cout << "\n========================================\n";
    cout << "          TESTING ROAD BLOCK\n";
    cout << "========================================\n";

    cout << "Blocking LOC_0093 -> LOC_0084\n";

    graph.blockRoad(
        "LOC_0093",
        "LOC_0084"
    );


    // ==================================================
    // TEST UNBLOCKING
    // ==================================================

    cout << "Restoring LOC_0093 -> LOC_0084\n";

    graph.unblockRoad(
        "LOC_0093",
        "LOC_0084"
    );


    // ==================================================
    // TEST NEIGHBORS
    // ==================================================

    cout << "\n========================================\n";
    cout << "       TESTING GRAPH NEIGHBORS\n";
    cout << "========================================\n";

    vector<Edge> neighbors =
        graph.getNeighbors("LOC_0093");

    cout << "Number of roads from LOC_0093: "
         << neighbors.size()
         << endl;


    // ==================================================
    // TEST ONE ROAD\n
    // ==================================================

    if (!neighbors.empty())
    {
        cout << "\nFirst outgoing road:\n";

        cout << "Destination: "
             << neighbors[0].destination
             << endl;

        cout << "Distance: "
             << neighbors[0].distance
             << endl;

        cout << "Travel Time: "
             << neighbors[0].travelTime
             << endl;

        cout << "Risk: "
             << neighbors[0].risk
             << endl;

        cout << "Traffic: "
             << neighbors[0].traffic
             << endl;

        cout << "Road Condition: "
             << neighbors[0].roadCondition
             << endl;

        cout << "Status: "
             << neighbors[0].status
             << endl;
    }


    cout << "\n========================================\n";
    cout << "       PHASE 2 GRAPH TEST COMPLETE\n";
    cout << "========================================\n";


    return 0;
}