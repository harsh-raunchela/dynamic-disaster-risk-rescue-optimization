#include <iostream>
#include "Graph.h"

using namespace std;


//add locatoin to the graph , like 101 -> VillageA 
void Graph::addLocation(const Location& location)
{
    locations[location.id] = location;

    // Create an empty adjacency list
    // for this location.
    adjacencyList[location.id];
}



//add road to the graph, like 101 -> 102
void Graph::addRoad(int source, const Edge& edge)
{
    adjacencyList[source].push_back(edge);
}



//getNeighnors returns the list of outgoing roads from a given location ID. It retrieves the adjacency list for the specified location ID and returns it as a vector of Edge objects. If the location ID does not exist in the adjacency list, it will return an empty vector.
vector<Edge> Graph::getNeighbors(int locationId)
{
    return adjacencyList[locationId];
}


//displayGraph prints the graph's structure, including locations and their outgoing roads. It iterates through the adjacency list and displays each location's ID, name, and the details of its outgoing roads, such as destination, distance, travel time, risk, traffic, road condition, and blocked status.
void Graph::displayGraph()
{
    for (auto& pair : adjacencyList)
    {
        int source = pair.first;

        cout << source << " -> ";

        for (const Edge& edge : pair.second)
        {
            cout << edge.destination;

            if (edge.blocked)
                cout << "(BLOCKED)";

            cout << " ";
        }

        cout << endl;
    }
}


//Road bloking and unblocking functions are not implemented in the provided code snippet. However, based on the class definition in Graph.h, you would typically implement these functions to modify the 'blocked' status of a road (Edge) between two locations.
void Graph::blockRoad(int source, int destination)
{
    for (Edge& edge : adjacencyList[source])
    {
        if (edge.destination == destination)
        {
            edge.blocked = true;
            return;
        }
    }
}

void Graph::unblockRoad(int source, int destination)
{
    for (Edge& edge : adjacencyList[source])
    {
        if (edge.destination == destination)
        {
            edge.blocked = false;
            return;
        }
    }
}



//remove road from the graph, like 101 -> 102
void Graph::removeRoad(int source, int destination)
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



//update road in the graph, like 101 -> 102
void Graph::updateRoad(
    int source,
    int destination,
    const Edge& updatedEdge)
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
