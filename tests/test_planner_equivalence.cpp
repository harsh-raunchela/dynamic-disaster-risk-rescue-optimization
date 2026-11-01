#include <iostream>
#include <vector>
#include <string>
#include <cmath>

#include "Graph.h"
#include "RouteDecisionEngine.h"

using namespace std;

int passed = 0;
int failed = 0;

void check(bool condition, const string& name)
{
    if (condition)
    {
        cout << "[PASS] " << name << endl;
        passed++;
    }
    else
    {
        cout << "[FAIL] " << name << endl;
        failed++;
    }
}

Location makeLocation(const string& id)
{
    Location location{};
    location.id = id;
    location.name = id;
    location.type = "Test";
    return location;
}

Edge makeRoad(
    const string& destination,
    double travelTime,
    const string& risk = "Low",
    const string& traffic = "Low",
    const string& condition = "Good",
    const string& status = "Open")
{
    Edge road{};
    road.destination = destination;
    road.distance = travelTime;
    road.travelTime = travelTime;
    road.risk = risk;
    road.traffic = traffic;
    road.roadCondition = condition;
    road.status = status;
    return road;
}

void addLocations(Graph& graph, const vector<string>& ids)
{
    for (const string& id : ids)
        graph.addLocation(makeLocation(id));
}

void comparePlanners(
    Graph& graph,
    const string& source,
    const string& destination,
    const string& testName,
    bool expectRoute = true)
{
    vector<string> dijkstra =
        RouteDecisionEngine::findBestRoute(
            graph, source, destination);

    vector<string> aStar =
        RouteDecisionEngine::findAStarRoute(
            graph, source, destination);

    if (!expectRoute)
    {
        check(dijkstra.empty(), testName + " - Dijkstra returns no route");
        check(aStar.empty(), testName + " - A* returns no route");
        return;
    }

    bool validDijkstra =
        !dijkstra.empty() &&
        dijkstra.front() == source &&
        dijkstra.back() == destination;

    bool validAStar =
        !aStar.empty() &&
        aStar.front() == source &&
        aStar.back() == destination;

    check(validDijkstra, testName + " - Dijkstra route is valid");
    check(validAStar, testName + " - A* route is valid");

    if (!validDijkstra || !validAStar)
        return;

    double dijkstraCost =
        RouteDecisionEngine::getRouteCost(graph, dijkstra);

    double aStarCost =
        RouteDecisionEngine::getRouteCost(graph, aStar);

    check(
        dijkstraCost >= 0.0 &&
        aStarCost >= 0.0 &&
        isfinite(dijkstraCost) &&
        isfinite(aStarCost) &&
        fabs(dijkstraCost - aStarCost) < 1e-9,
        testName + " - minimum route scores match");
}

int main()
{
    cout << "=== DIJKSTRA VS A* EQUIVALENCE TESTS ===\n";

    // TEST 1: Multiple paths with different risk scores.
    {
        Graph graph;
        addLocations(graph, {"A", "B", "C", "D"});

        graph.addRoad("A", makeRoad("B", 5, "Critical"));
        graph.addRoad("B", makeRoad("D", 5, "Critical"));

        graph.addRoad("A", makeRoad("C", 10, "Low"));
        graph.addRoad("C", makeRoad("D", 10, "Low"));

        comparePlanners(
            graph, "A", "D",
            "Multiple routes with risk penalties");
    }

    // TEST 2: Combined traffic and road-condition penalties.
    {
        Graph graph;
        addLocations(graph, {"A", "B", "C", "D"});

        graph.addRoad(
            "A", makeRoad("B", 5, "Low", "High", "Damaged"));
        graph.addRoad(
            "B", makeRoad("D", 5, "Medium", "High", "Damaged"));

        graph.addRoad(
            "A", makeRoad("C", 20, "Low", "Low", "Good"));
        graph.addRoad(
            "C", makeRoad("D", 20, "Low", "Low", "Good"));

        comparePlanners(
            graph, "A", "D",
            "Combined traffic and condition penalties");
    }

    // TEST 3: Closed direct road.
    {
        Graph graph;
        addLocations(graph, {"A", "B", "C"});

        graph.addRoad(
            "A", makeRoad("B", 1, "Low", "Low", "Good", "Closed"));
        graph.addRoad("A", makeRoad("C", 10));
        graph.addRoad("C", makeRoad("B", 10));

        comparePlanners(
            graph, "A", "B",
            "Closed road avoidance");
    }

    // TEST 4: Parallel edges between the same pair.
    {
        Graph graph;
        addLocations(graph, {"A", "B", "C", "D"});

        graph.addRoad("A", makeRoad("B", 2, "Critical"));
        graph.addRoad("A", makeRoad("B", 12, "Low"));

        graph.addRoad("B", makeRoad("D", 5));
        graph.addRoad("A", makeRoad("C", 10));
        graph.addRoad("C", makeRoad("D", 10));

        comparePlanners(
            graph, "A", "D",
            "Parallel road handling");
    }

    // TEST 5: Disconnected destination.
    {
        Graph graph;
        addLocations(graph, {"A", "B", "C"});

        graph.addRoad("A", makeRoad("B", 5));

        comparePlanners(
            graph, "A", "C",
            "Disconnected destination",
            false);
    }

    // TEST 6: Source equals destination.
    {
        Graph graph;
        addLocations(graph, {"A", "B"});

        graph.addRoad("A", makeRoad("B", 5));

        vector<string> dijkstra =
            RouteDecisionEngine::findBestRoute(graph, "A", "A");

        vector<string> aStar =
            RouteDecisionEngine::findAStarRoute(graph, "A", "A");

        check(
            dijkstra == vector<string>({"A"}),
            "Source equals destination - Dijkstra");

        check(
            aStar == vector<string>({"A"}),
            "Source equals destination - A*");

        check(
            RouteDecisionEngine::getRouteCost(graph, dijkstra) == 0.0 &&
            RouteDecisionEngine::getRouteCost(graph, aStar) == 0.0,
            "Source equals destination - both scores are zero");
    }

    cout << "\n========== TEST SUMMARY ==========\n";
    cout << "Passed: " << passed << endl;
    cout << "Failed: " << failed << endl;

    if (failed > 0)
    {
        cout << "RESULT: FAIL\n";
        return 1;
    }

    cout << "RESULT: ALL TESTS PASSED\n";
    return 0;
}

