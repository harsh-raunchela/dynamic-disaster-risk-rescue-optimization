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
    {
        graph.addLocation(makeLocation(id));
    }
}

int main()
{
    cout << "=== RISK-AWARE ROUTING TESTS ===" << endl;

    // TEST 1: Risk penalty independently reverses route choice.
    // Route 1 (via B): travel time 5 + 5 = 10, Critical risk (+100) -> score 110.
    // Route 2 (via C): travel time 10 + 10 = 20, Low risk (+0) -> score 20.
    {
        Graph graph;
        addLocations(graph, {"A", "B", "C", "D"});

        graph.addRoad("A", makeRoad("B", 5, "Critical"));
        graph.addRoad("B", makeRoad("D", 5, "Critical"));

        graph.addRoad("A", makeRoad("C", 10, "Low"));
        graph.addRoad("C", makeRoad("D", 10, "Low"));

        vector<string> route =
            RouteDecisionEngine::findBestRoute(graph, "A", "D");

        check(
            route == vector<string>({"A", "C", "D"}),
            "Risk penalty independently reverses route choice");

        double cost = RouteDecisionEngine::getRouteCost(graph, route);

        check(
            fabs(cost - 20.0) < 1e-9,
            "Selected low-risk route score is 20");
    }

    // TEST 2: Traffic penalty independently reverses route choice.
    // Route 1 (via B): travel time 10 + 10 = 20, High traffic (+30) -> score 50.
    // Route 2 (via C): travel time 15 + 15 = 30, Low traffic (+0) -> score 30.
    {
        Graph graph;
        addLocations(graph, {"A", "B", "C", "D"});

        // Shorter travel time (20) but High traffic (+30) -> score 50.
        graph.addRoad("A", makeRoad("B", 10, "Low", "High"));
        graph.addRoad("B", makeRoad("D", 10, "Low", "High"));

        // Longer travel time (30) but Low traffic (+0) -> score 30.
        graph.addRoad("A", makeRoad("C", 15, "Low", "Low"));
        graph.addRoad("C", makeRoad("D", 15, "Low", "Low"));

        vector<string> route =
            RouteDecisionEngine::findBestRoute(graph, "A", "D");

        check(
            route == vector<string>({"A", "C", "D"}),
            "Traffic penalty independently reverses route choice");

        double cost = RouteDecisionEngine::getRouteCost(graph, route);

        check(
            fabs(cost - 30.0) < 1e-9,
            "Selected low-traffic route score is 30");
    }

    // TEST 3: Road-condition penalty independently reverses route choice.
    // Route 1 (via B): travel time 10 + 10 = 20, Severely Damaged (+60) -> score 80.
    // Route 2 (via C): travel time 20 + 20 = 40, Good (+0) -> score 40.
    {
        Graph graph;
        addLocations(graph, {"A", "B", "C", "D"});

        // Shorter travel time (20) but Severely Damaged (+60) -> score 80.
        graph.addRoad(
            "A", makeRoad("B", 10, "Low", "Low", "Severely Damaged"));
        graph.addRoad(
            "B", makeRoad("D", 10, "Low", "Low", "Severely Damaged"));

        // Longer travel time (40) but Good condition (+0) -> score 40.
        graph.addRoad("A", makeRoad("C", 20, "Low", "Low", "Good"));
        graph.addRoad("C", makeRoad("D", 20, "Low", "Low", "Good"));

        vector<string> route =
            RouteDecisionEngine::findBestRoute(graph, "A", "D");

        check(
            route == vector<string>({"A", "C", "D"}),
            "Road-condition penalty independently reverses route choice");

        double cost = RouteDecisionEngine::getRouteCost(graph, route);

        check(
            fabs(cost - 40.0) < 1e-9,
            "Selected good-condition route score is 40");
    }

    // TEST 4: Closed roads must not be selected.
    {
        Graph graph;
        addLocations(graph, {"A", "B", "C"});

        graph.addRoad("A", makeRoad("B", 1, "Low", "Low", "Good", "Closed"));
        graph.addRoad("A", makeRoad("C", 10, "Low"));
        graph.addRoad("C", makeRoad("B", 10, "Low"));

        vector<string> route =
            RouteDecisionEngine::findBestRoute(graph, "A", "B");

        check(
            route == vector<string>({"A", "C", "B"}),
            "Planner avoids a closed road");
    }

    // TEST 5: A* entry point must use the same cost convention.
    {
        Graph graph;
        addLocations(graph, {"A", "B", "C", "D"});

        graph.addRoad("A", makeRoad("B", 5, "Critical"));
        graph.addRoad("B", makeRoad("D", 5, "Critical"));
        graph.addRoad("A", makeRoad("C", 10, "Low"));
        graph.addRoad("C", makeRoad("D", 10, "Low"));

        vector<string> route =
            RouteDecisionEngine::findAStarRoute(graph, "A", "D");

        double cost = RouteDecisionEngine::getRouteCost(graph, route);

        check(
            route == vector<string>({"A", "C", "D"}),
            "A* entry point uses risk-aware costs");

        check(
            fabs(cost - 20.0) < 1e-9,
            "Selected A* route cost matches the shared scoring rules");
    }

    // TEST 6: Parallel roads should use the lowest-cost usable edge.
    {
        Graph graph;
        addLocations(graph, {"A", "B"});

        graph.addRoad("A", makeRoad("B", 5, "Critical"));
        graph.addRoad("A", makeRoad("B", 12, "Low"));

        vector<string> route = {"A", "B"};
        double cost = RouteDecisionEngine::getRouteCost(graph, route);

        check(
            fabs(cost - 12.0) < 1e-9,
            "Parallel roads use the lowest-cost usable edge");
    }

    cout << "\n========== TEST SUMMARY ==========" << endl;
    cout << "Passed: " << passed << endl;
    cout << "Failed: " << failed << endl;

    if (failed > 0)
    {
        cout << "RESULT: FAIL" << endl;
        return 1;
    }

    cout << "RESULT: ALL TESTS PASSED" << endl;
    return 0;
}
