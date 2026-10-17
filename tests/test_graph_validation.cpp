
#include <iostream>
#include <vector>
#include "Graph.h"

using namespace std;

int main()
{
    Graph graph;

    cout << "\n=== PHASE 7.1: GRAPH VALIDATION ===\n";

    // Test 1: Load dataset
    cout << "\n[TEST 1] Loading dataset\n";

    bool locationsOK =
        graph.loadLocations("data/locations.csv");

    bool roadsOK =
        graph.loadRoads("data/roads.csv");

    cout << "Locations load: "
         << (locationsOK ? "PASS" : "FAIL") << endl;

    cout << "Roads load: "
         << (roadsOK ? "PASS" : "FAIL") << endl;

    // Test 2: Validate dataset counts
    cout << "\n[TEST 2] Validate dataset counts\n";

    int locationCount = graph.getLocationCount();
    int roadCount = graph.getRoadCount();

    cout << "Locations: " << locationCount
         << " (expected 500)" << endl;

    cout << "Roads: " << roadCount
         << " (expected 2500)" << endl;

    cout << "Location count: "
         << (locationCount == 500 ? "PASS" : "FAIL")
         << endl;

    cout << "Road count: "
         << (roadCount == 2500 ? "PASS" : "FAIL")
         << endl;

    // Test 3: Check an existing location
    cout << "\n[TEST 3] Existing location lookup\n";

    const Location* existing =
        graph.getLocation("LOC_0001");

    cout << "LOC_0001 lookup: "
         << (existing != nullptr ? "PASS" : "FAIL")
         << endl;

    // Test 4: Check a missing location
    cout << "\n[TEST 4] Missing location lookup\n";

    const Location* missing =
        graph.getLocation("LOC_9999");

    cout << "LOC_9999 handled safely: "
         << (missing == nullptr ? "PASS" : "FAIL")
         << endl;

    // Test 5: Check outgoing roads
    cout << "\n[TEST 5] Outgoing road lookup\n";

    vector<Edge> neighbors =
        graph.getNeighbors("LOC_0093");

    cout << "LOC_0093 outgoing roads: "
         << neighbors.size() << endl;

    cout << "Outgoing road lookup: "
         << (!neighbors.empty() ? "PASS" : "FAIL")
         << endl;

    cout << "\n=== PHASE 7.1 BASIC TESTS COMPLETE ===\n";

    return 0;
}