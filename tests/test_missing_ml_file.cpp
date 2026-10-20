
#include <iostream>

#include "Graph.h"
#include "RiskPredictionLoader.h"

using namespace std;

int main() {
    cout << "=== TEST: MISSING ML PREDICTION FILE ===\n";

    Graph graph;

    if (!graph.loadLocations("data/locations.csv") ||
        !graph.loadRoads("data/roads.csv")) {
        cout << "Graph loading: FAIL\n";
        return 1;
    }

    bool loaded = RiskPredictionLoader::load(
        graph,
        "data/file_that_does_not_exist.csv"
    );

    bool failureHandled = !loaded;

    cout << "Missing prediction file rejected: "
         << (failureHandled ? "PASS" : "FAIL")
         << endl;

    cout << "\n=== MISSING ML FILE TEST: "
         << (failureHandled ? "PASSED" : "FAILED")
         << " ===\n";

    return failureHandled ? 0 : 1;
}
