#ifndef GRAPH_H
#define GRAPH_H

#include <unordered_map>
#include <vector>
#include <string>

#include "Location.h"
#include "Edge.h"

using namespace std;

class Graph
{
private:

    // Stores:
    // Location ID -> Location object
    unordered_map<string, Location> locations;

    // Adjacency list:
    // Location ID -> list of outgoing roads
    unordered_map<string, vector<Edge>> adjacencyList;

public:

    // Add a location to the graph
    void addLocation(const Location& location);

    // Add a road from source to destination
    void addRoad(const string& source, const Edge& edge);

    // Remove a road
    void removeRoad(const string& source, const string& destination);

    // Update a road
    void updateRoad(
        const string& source,
        const string& destination,
        const Edge& updatedEdge
    );

    // Close a road
    void blockRoad(
        const string& source,
        const string& destination
    );

    // Open a road
    void unblockRoad(
        const string& source,
        const string& destination
    );

    // Get all roads going out from a location
    vector<Edge> getNeighbors(const string& locationId);

    // Display graph
    void displayGraph();
};

#endif