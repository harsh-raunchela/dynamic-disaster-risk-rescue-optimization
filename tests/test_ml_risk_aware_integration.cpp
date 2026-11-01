#include <iostream>
#include <vector>
#include <string>
#include <cmath>

#include "Graph.h"
#include "RouteDecisionEngine.h"
#include "RiskPredictionLoader.h"

using namespace std;

int main()
{
    cout << "=== ML RISK-AWARE INTEGRATION TEST ===" << endl;

    Graph graph;

    // 1. Load the real dataset.
    if (!graph.loadLocations("data/locations.csv"))
    {
        cerr << "[FAIL] Could not load locations." << endl;
        return 1;
    }

    if (!graph.loadRoads("data/roads.csv"))
    {
        cerr << "[FAIL] Could not load roads." << endl;
        return 1;
    }

    vector<string> locations = graph.getLocationIds();

    cout << "Locations loaded: " << locations.size() << endl;

    if (locations.size() != 500)
    {
        cerr << "[FAIL] Expected 500 locations." << endl;
        return 1;
    }

    // 2. Load ML predictions into the same graph.
    if (!RiskPredictionLoader::load(
            graph, "data/risk_predictions.csv"))
    {
        cerr << "[FAIL] ML prediction loading failed." << endl;
        return 1;
    }

    cout << "[PASS] Dataset and ML loader completed." << endl;

    // 3. Find a route between two valid, connected locations.
    const string source = "LOC_0001";
    const string destination = "LOC_0010";

    vector<string> route =
        RouteDecisionEngine::findBestRoute(
            graph, source, destination);

    if (route.empty())
    {
        cerr << "[FAIL] No route found from "
             << source << " to " << destination << endl;
        return 1;
    }

    if (route.front() != source ||
        route.back() != destination)
    {
        cerr << "[FAIL] Route endpoints do not match." << endl;
        return 1;
    }

    cout << "[PASS] Route found: "
         << source << " -> ... -> " << destination << endl;

    // 4. Verify that the route has a valid score.
    double score =
        RouteDecisionEngine::getRouteCost(graph, route);

    if (!isfinite(score) || score < 0.0)
    {
        cerr << "[FAIL] Route score is invalid: "
             << score << endl;
        return 1;
    }

    cout << "[PASS] Route score: " << score << endl;

    // 5. Verify that the A*-named entry point also returns a route.
    vector<string> aStarRoute =
        RouteDecisionEngine::findAStarRoute(
            graph, source, destination);

    if (aStarRoute.empty() ||
        aStarRoute.front() != source ||
        aStarRoute.back() != destination)
    {
        cerr << "[FAIL] A*-named planner failed." << endl;
        return 1;
    }

    double aStarScore =
        RouteDecisionEngine::getRouteCost(graph, aStarRoute);

    if (!isfinite(aStarScore) || aStarScore < 0.0)
    {
        cerr << "[FAIL] A*-named route score is invalid." << endl;
        return 1;
    }

    cout << "[PASS] A*-named route score: "
         << aStarScore << endl;

    cout << "\nRESULT: ALL INTEGRATION CHECKS PASSED" << endl;
    return 0;
}
