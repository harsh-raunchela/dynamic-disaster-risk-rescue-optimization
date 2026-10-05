#include <iostream>
#include "Graph.h"

using namespace std;


// --------------------------------------------------
// ADD LOCATION
// --------------------------------------------------
// Adds a location to the graph.
//
// Example:
// LOC_0001 -> Village A
// --------------------------------------------------

void Graph::addLocation(const Location& location)
{
    locations[location.id] = location;

    // Create an empty adjacency list
    // for this location.
    adjacencyList[location.id];
}


// --------------------------------------------------
// ADD ROAD
// --------------------------------------------------
// Adds a road to the adjacency list.
//
// Example:
// LOC_0001 -> LOC_0002
// --------------------------------------------------

void Graph::addRoad(const string& source, const Edge& edge)
{
    adjacencyList[source].push_back(edge);
}


// --------------------------------------------------
// GET NEIGHBORS
// --------------------------------------------------
// Returns all outgoing roads from a location.
//
// Example:
//
// LOC_0001
//    |
//    |---- LOC_0002
//    |
//    |---- LOC_0003
// --------------------------------------------------

vector<Edge> Graph::getNeighbors(const string& locationId)
{
    return adjacencyList[locationId];
}


// --------------------------------------------------
// DISPLAY GRAPH
// --------------------------------------------------

void Graph::displayGraph()
{
    for (auto& pair : adjacencyList)
    {
        string source = pair.first;

        cout << source << " -> ";

        for (const Edge& edge : pair.second)
        {
            cout << edge.destination;

            cout << " [Distance: "
                 << edge.distance
                 << ", Time: "
                 << edge.travelTime
                 << ", Risk: "
                 << edge.risk
                 << ", Traffic: "
                 << edge.traffic
                 << ", Road: "
                 << edge.roadCondition
                 << ", Status: "
                 << edge.status
                 << "] ";

        }

        cout << endl;
    }
}


// --------------------------------------------------
// BLOCK ROAD
// --------------------------------------------------
// Changes road status to Closed.
//
// Example:
// LOC_0001 -> LOC_0002
// status = Open
//
// becomes:
//
// LOC_0001 -> LOC_0002
// status = Closed
// --------------------------------------------------

void Graph::blockRoad(
    const string& source,
    const string& destination
)
{
    for (Edge& edge : adjacencyList[source])
    {
        if (edge.destination == destination)
        {
            edge.status = "Closed";
            return;
        }
    }
}


// --------------------------------------------------
// UNBLOCK ROAD
// --------------------------------------------------
// Changes road status to Open.
// --------------------------------------------------

void Graph::unblockRoad(
    const string& source,
    const string& destination
)
{
    for (Edge& edge : adjacencyList[source])
    {
        if (edge.destination == destination)
        {
            edge.status = "Open";
            return;
        }
    }
}


// --------------------------------------------------
// REMOVE ROAD
// --------------------------------------------------

void Graph::removeRoad(
    const string& source,
    const string& destination
)
{
    vector<Edge>& edges = adjacencyList[source];

    for (auto it = edges.begin(); it != edges.end(); ++it)
    {
        if (it->destination == destination)
        {
            edges.erase(it);
            return;
        }
    }
}


// --------------------------------------------------
// UPDATE ROAD
// --------------------------------------------------

void Graph::updateRoad(
    const string& source,
    const string& destination,
    const Edge& updatedEdge
)
{
    for (Edge& edge : adjacencyList[source])
    {
        if (edge.destination == destination)
        {
            edge = updatedEdge;
            return;
        }
    }
}