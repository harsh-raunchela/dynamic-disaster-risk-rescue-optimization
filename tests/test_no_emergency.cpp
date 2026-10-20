
#include <iostream>

#include "Graph.h"
#include "DisasterEngine.h"

using namespace std;

int main() {
    cout << "=== TEST: NO EMERGENCY AVAILABLE ===\n";

    Graph graph;

    if (!graph.loadLocations("data/locations.csv") ||
        !graph.loadRoads("data/roads.csv")) {
        cout << "Graph loading: FAIL\n";
        return 1;
    }

    DisasterEngine engine(&graph);

    // Intentionally add no emergencies or resources.
    engine.runDisasterSimulation();

    cout << "\n=== NO-EMERGENCY TEST EXECUTION COMPLETE ===\n";
    return 0;
}
