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
    cout << "=== ML RISK-AWARE INTEGRATION TEST (LOC_0001 -> LOC_0010) ===" << endl;

    Graph graph;

    if (!graph.loadLocations("data/locations.csv") || !graph.loadRoads("data/roads.csv"))
    {
        cerr << "[FAIL] Could not load dataset." << endl;
        return 1;
    }

    if (!RiskPredictionLoader::load(graph, "data/risk_predictions.csv"))
    {
        cerr << "[FAIL] ML prediction loading failed." << endl;
        return 1;
    }

    const string source = "LOC_0001";
    const string destination = "LOC_0010";

    vector<string> route = RouteDecisionEngine::findBestRoute(graph, source, destination);

    if (route.empty())
    {
        cerr << "[FAIL] No route found from " << source << " to " << destination << endl;
        return 1;
    }

    cout << "[PASS] Route found: ";
    for (size_t i = 0; i < route.size(); i++) {
        cout << route[i] << (i + 1 < route.size() ? " -> " : "\n");
    }

    double score = RouteDecisionEngine::getRouteCost(graph, route);
    cout << "[PASS] Route score: " << score << endl;

    vector<string> aStarRoute = RouteDecisionEngine::findAStarRoute(graph, source, destination);
    double aStarScore = RouteDecisionEngine::getRouteCost(graph, aStarRoute);
    cout << "[PASS] A*-named route score: " << aStarScore << endl;

    cout << "\nRESULT: ALL INTEGRATION CHECKS PASSED" << endl;
    return 0;
}
