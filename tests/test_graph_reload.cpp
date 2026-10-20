
#include <iostream>
#include "Graph.h"

using namespace std;

int main()
{
    Graph graph;

    cout << "=== GRAPH RELOAD TEST ===\n";

    cout << "\nFirst load:\n";

    graph.loadLocations("data/locations.csv");
    graph.loadRoads("data/roads.csv");

    int firstLocations = graph.getLocationCount();
    int firstRoads = graph.getRoadCount();

    cout << "Locations: " << firstLocations << endl;
    cout << "Roads: " << firstRoads << endl;

    cout << "\nSecond load:\n";

    graph.loadLocations("data/locations.csv");
    graph.loadRoads("data/roads.csv");

    int secondLocations = graph.getLocationCount();
    int secondRoads = graph.getRoadCount();

    cout << "Locations: " << secondLocations << endl;
    cout << "Roads: " << secondRoads << endl;

    bool passed =
        firstLocations == 500 &&
        firstRoads == 2500 &&
        secondLocations == 500 &&
        secondRoads == 2500;

    cout << "\nRepeated loading: "
         << (passed ? "PASS" : "FAIL")
         << endl;

    return passed ? 0 : 1;
}
