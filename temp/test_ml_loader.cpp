#include <iostream>
#include "Graph.h"
#include "RiskPredictionLoader.h"

using namespace std;

int main()
{
    Graph graph;

    if (!graph.loadLocations("data/locations.csv") ||
        !graph.loadRoads("data/roads.csv"))
    {
        cout << "FAIL: Dataset loading failed.\n";
        return 1;
    }

    auto before = graph.getNeighbors("LOC_0093");

    bool foundBefore = false;
    string originalRisk;

    for (const Edge& edge : before)
    {
        if (edge.id == "ROAD_0001")
        {
            foundBefore = true;
            originalRisk = edge.risk;
            break;
        }
    }

    if (!foundBefore)
    {
        cout << "FAIL: ROAD_0001 not found at LOC_0093.\n";
        return 1;
    }

    cout << "ROAD_0001 risk before ML load: "
         << originalRisk << '\n';

    if (!RiskPredictionLoader::load(
            graph, "data/risk_predictions.csv"))
    {
        cout << "FAIL: ML prediction file could not be loaded.\n";
        return 1;
    }

    auto after = graph.getNeighbors("LOC_0093");

    bool foundAfter = false;
    string updatedRisk;

    for (const Edge& edge : after)
    {
        if (edge.id == "ROAD_0001")
        {
            foundAfter = true;
            updatedRisk = edge.risk;
            break;
        }
    }

    if (!foundAfter)
    {
        cout << "FAIL: ROAD_0001 missing after ML load.\n";
        return 1;
    }

    cout << "ROAD_0001 risk after ML load: "
         << updatedRisk << '\n';

    bool passed = updatedRisk == "High";

    cout << (passed
        ? "PASS: Prediction applied to ROAD_0001.\n"
        : "FAIL: Expected predicted risk High.\n");

    return passed ? 0 : 1;
}
