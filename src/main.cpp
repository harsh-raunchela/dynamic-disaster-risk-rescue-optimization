#include <iostream>

#include "Graph.h"
#include "RiskPredictionLoader.h"

using namespace std;

int main()
{
    Graph graph;

    // Load original graph data
    graph.loadLocations(
        "data/locations.csv"
    );

    graph.loadRoads(
        "data/roads.csv"
    );

    cout << "Before ML risk update:\n";

    vector<Edge> roads =
        graph.getNeighbors("LOC_0093");

    for (const Edge& road : roads)
    {
        cout << road.destination
             << " | Risk: "
             << road.risk
             << endl;
    }

    // Load ML predictions
    RiskPredictionLoader::load(
        graph,
        "data/risk_predictions.csv"
    );

    cout << "\nAfter ML risk update:\n";

    roads =
        graph.getNeighbors("LOC_0093");

    for (const Edge& road : roads)
    {
        cout << road.destination
             << " | Risk: "
             << road.risk
             << endl;
    }

    return 0;
}