#include <iostream>
#include "Graph.h"

using namespace std;

int main()
{
    Graph graph;

    Edge road1{};
    road1.id = "ROAD_A";
    road1.destination = "B";
    road1.travelTime = 10;
    road1.status = "Open";

    Edge road2{};
    road2.id = "ROAD_B";
    road2.destination = "B";
    road2.travelTime = 20;
    road2.status = "Open";

    graph.addRoad("A", road1);
    graph.addRoad("A", road2);

    cout << "========== TEST 1: BLOCK PARALLEL ROADS ==========\n";

    graph.blockRoad("A", "B");

    auto roads = graph.getNeighbors("A");

    bool bothClosed =
        roads.size() == 2 &&
        roads[0].status == "Closed" &&
        roads[1].status == "Closed";

    cout << "ROAD_A closed: "
         << (roads.size() == 2 && roads[0].status == "Closed"
             ? "PASS" : "FAIL") << '\n';

    cout << "ROAD_B closed: "
         << (roads.size() == 2 && roads[1].status == "Closed"
             ? "PASS" : "FAIL") << '\n';

    cout << "\n========== TEST 2: UNBLOCK PARALLEL ROADS ==========\n";

    graph.unblockRoad("A", "B");
    roads = graph.getNeighbors("A");

    bool bothOpen =
        roads.size() == 2 &&
        roads[0].status == "Open" &&
        roads[1].status == "Open";

    cout << "ROAD_A open: "
         << (roads.size() == 2 && roads[0].status == "Open"
             ? "PASS" : "FAIL") << '\n';

    cout << "ROAD_B open: "
         << (roads.size() == 2 && roads[1].status == "Open"
             ? "PASS" : "FAIL") << '\n';

    cout << "\n========== TEST 3: UNKNOWN SOURCE ==========\n";

    graph.blockRoad("UNKNOWN", "B");

    bool noUnexpectedRoads =
        graph.getNeighbors("UNKNOWN").empty();

    cout << "Unknown source handled safely: "
         << (noUnexpectedRoads ? "PASS" : "FAIL") << '\n';

    bool allPassed = bothClosed && bothOpen && noUnexpectedRoads;

    cout << "\nRESULT: "
         << (allPassed ? "ALL TESTS PASSED" : "TEST FAILURE")
         << '\n';

    return allPassed ? 0 : 1;
}
