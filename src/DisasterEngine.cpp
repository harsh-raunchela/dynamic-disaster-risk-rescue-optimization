#include <iostream>

#include "DisasterEngine.h"

using namespace std;

DisasterEngine::DisasterEngine(Graph* graph)
{
    this->graph = graph;
}

void DisasterEngine::blockRoad(
    const string& source,
    const string& destination)
{
    graph->blockRoad(source, destination);

    cout << "Road blocked: "
         << source
         << " -> "
         << destination
         << endl;
}

void DisasterEngine::unblockRoad(
    const string& source,
    const string& destination)
{
    graph->unblockRoad(source, destination);

    cout << "Road unblocked: "
         << source
         << " -> "
         << destination
         << endl;
}

void DisasterEngine::updateRoad(
    const string& source,
    const string& destination,
    const Edge& updatedEdge)
{
    graph->updateRoad(
        source,
        destination,
        updatedEdge
    );

    cout << "Road updated: "
         << source
         << " -> "
         << destination
         << endl;
}

void DisasterEngine::displayRoads(
    const string& locationId)
{
    vector<Edge> roads =
        graph->getNeighbors(locationId);

    cout << "\nRoads from "
         << locationId
         << ":\n";

    if (roads.empty())
    {
        cout << "No roads found.\n";
        return;
    }

    for (const Edge& road : roads)
    {
        cout << "Destination: "
             << road.destination
             << " | Distance: "
             << road.distance
             << " | Risk: "
             << road.risk
             << " | Traffic: "
             << road.traffic
             << " | Condition: "
             << road.roadCondition
             << " | Status: "
             << road.status
             << endl;
    }
}
