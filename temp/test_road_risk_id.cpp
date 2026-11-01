#include <iostream>
#include <string>
#include "Graph.h"

using namespace std;

int main()
{
    Graph graph;

    Edge road1{};
    road1.id = "ROAD_TEST_1";
    road1.destination = "B";
    road1.risk = "Low";
    road1.status = "Open";

    Edge road2{};
    road2.id = "ROAD_TEST_2";
    road2.destination = "B";
    road2.risk = "Medium";
    road2.status = "Open";

    graph.addRoad("A", road1);
    graph.addRoad("A", road2);

    cout << "========== TEST 1: UPDATE EXACT ROAD ID ==========\n";

    bool updated = graph.updateRoadRiskById("ROAD_TEST_2", "Critical");

    auto roads = graph.getNeighbors("A");

    bool road1Unchanged =
        roads.size() == 2 && roads[0].risk == "Low";

    bool road2Updated =
        roads.size() == 2 && roads[1].risk == "Critical";

    cout << "Update returned true: "
         << (updated ? "PASS" : "FAIL") << '\n';

    cout << "ROAD_TEST_1 unchanged: "
         << (road1Unchanged ? "PASS" : "FAIL") << '\n';

    cout << "ROAD_TEST_2 updated: "
         << (road2Updated ? "PASS" : "FAIL") << '\n';

    cout << "\n========== TEST 2: UNKNOWN ROAD ID ==========\n";

    bool unknownUpdated =
        graph.updateRoadRiskById("ROAD_DOES_NOT_EXIST", "High");

    bool unknownRejected = !unknownUpdated;

    cout << "Unknown ID rejected: "
         << (unknownRejected ? "PASS" : "FAIL") << '\n';

    bool allPassed =
        updated && road1Unchanged && road2Updated && unknownRejected;

    cout << "\nRESULT: "
         << (allPassed ? "ALL TESTS PASSED" : "TEST FAILURE")
         << '\n';

    return allPassed ? 0 : 1;
}
