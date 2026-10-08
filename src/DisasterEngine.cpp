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
        route
    );

    cout << "Total Route Cost: "
         << cost
         << endl;
}
void DisasterEngine::reroute(
    const vector<string>& currentRoute,
    const string& source,
    const string& destination)
{
    cout << "\nChecking for alternative route...\n";

    vector<string> newRoute =
        RouteDecisionEngine::reroute(
            *graph,
            currentRoute,
            source,
            destination
        );

    if (newRoute.empty())
    {
        cout << "No alternative route available."
             << endl;

        return;
    }

    cout << "\nUpdated Rescue Route:\n";

    for (size_t i = 0; i < newRoute.size(); i++)
    {
        cout << newRoute[i];

        if (i < newRoute.size() - 1)
        {
            cout << " -> ";
        }
    }

    cout << endl;

    double cost =
        RouteDecisionEngine::getRouteCost(
            *graph,
            newRoute
        );

    cout << "New Route Cost: "
         << cost
         << endl;
}
void DisasterEngine::runDisasterSimulation()
{
    cout << "\n====================================\n";
    cout << "     INTEGRATED DISASTER SIMULATION\n";
    cout << "====================================\n";

    if (emergencyQueue.isEmpty())
    {
        cout << "No emergency available for simulation."
             << endl;
        return;
    }

    Emergency emergency =
        emergencyQueue.dequeue();

    cout << "\nProcessing Emergency: "
         << emergency.id
         << endl;

    cout << "Emergency Location: "
         << emergency.locationId
         << endl;

    cout << "Severity: "
         << emergency.severity
         << endl;

    cout << "People Affected: "
         << emergency.peopleAffected
         << endl;

    if (resourceHeap.isEmpty())
    {
        cout << "No rescue resource available."
             << endl;
        return;
    }

    RescueResource resource =
        resourceHeap.extractMin();

    cout << "\nDispatching Resource: "
         << resource.id
         << endl;

    cout << "Resource Type: "
         << resource.type
         << endl;

    cout << "Resource Location: "
         << resource.locationId
         << endl;

    cout << "Resource Priority: "
         << resource.priority
         << endl;

    vector<string> currentRoute =
        RouteDecisionEngine::findBestRoute(
            *graph,
            resource.locationId,
            emergency.locationId
        );

    if (currentRoute.empty())
    {
        cout << "\nNo rescue route available."
             << endl;
        return;
    }

    cout << "\nInitial Rescue Route:\n";

    for (size_t i = 0; i < currentRoute.size(); i++)
    {
        cout << currentRoute[i];

        if (i < currentRoute.size() - 1)
        {
            cout << " -> ";
        }
    }

    cout << endl;

    if (currentRoute.size() >= 3)
    {
        cout << "\nSimulating road failure...\n";

        string blockedSource =
            currentRoute[1];

        string blockedDestination =
            currentRoute[2];

        blockRoad(
            blockedSource,
            blockedDestination
        );

        cout << "\nDynamic rerouting triggered...\n";

        reroute(
            currentRoute,
            resource.locationId,
            emergency.locationId
        );
    }
    else
    {
        cout << "\nNo intermediate road available "
             << "for failure simulation."
             << endl;
    }

    cout << "\nRescue operation continues.\n";
    cout << "Emergency response completed.\n";
}