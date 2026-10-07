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
void DisasterEngine::addEmergency(
    const Emergency& emergency)
{
    emergencyQueue.enqueue(emergency);

    cout << "Emergency added: "
         << emergency.id
         << " | Severity: "
         << emergency.severity
         << endl;
}

void DisasterEngine::processNextEmergency()
{
    if (emergencyQueue.isEmpty())
    {
        cout << "No emergency reports to process."
             << endl;

        return;
    }

    Emergency emergency =
        emergencyQueue.dequeue();

    cout << "\nProcessing emergency:\n";

    cout << "ID: "
         << emergency.id
         << endl;

    cout << "Location: "
         << emergency.locationId
         << endl;

    cout << "Severity: "
         << emergency.severity
         << endl;

    cout << "People Affected: "
         << emergency.peopleAffected
         << endl;

    cout << "Reported Time: "
         << emergency.reportedTime
         << endl;
}

void DisasterEngine::displayEmergencies()
{
    cout << "\nEmergency Queue:\n";

    emergencyQueue.display();
}
void DisasterEngine::addResource(
    const RescueResource& resource)
{
    resourceHeap.insert(resource);

    cout << "Resource added: "
         << resource.id
         << " | Type: "
         << resource.type
         << " | Priority: "
         << resource.priority
         << endl;
}

void DisasterEngine::dispatchResource()
{
    if (resourceHeap.isEmpty())
    {
        cout << "No rescue resources available."
             << endl;

        return;
    }

    RescueResource resource =
        resourceHeap.extractMin();

    cout << "\nDispatching rescue resource:\n";

    cout << "Resource ID: "
         << resource.id
         << endl;

    cout << "Type: "
         << resource.type
         << endl;

    cout << "Location: "
         << resource.locationId
         << endl;

    cout << "Priority: "
         << resource.priority
         << endl;
}

void DisasterEngine::findRoute(
    const string& source,
    const string& destination)
{
    cout << "\nFinding best rescue route...\n";

    vector<string> route =
        RouteDecisionEngine::findBestRoute(
            *graph,
            source,
            destination
        );

    if (route.empty())
    {
        cout << "No route available."
             << endl;

        return;
    }

    cout << "\nRecommended Rescue Route:\n";

    for (size_t i = 0; i < route.size(); i++)
    {
        cout << route[i];

        if (i < route.size() - 1)
        {
            cout << " -> ";
        }
    }

    cout << endl;

    double cost =
        RouteDecisionEngine::getRouteCost(
            *graph,
            source,
            destination
        );

    cout << "Total Route Cost: "
         << cost
         << endl;
}