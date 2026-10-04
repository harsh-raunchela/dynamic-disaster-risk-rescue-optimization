#ifndef GRAPH_H
#define GRAPH_H

#include <unordered_map>
#include <vector>
#include "Location.h"
#include "Edge.h"

using namespace std;

class Graph
{
private:

    // Stores location ID -> Location
    unordered_map<int, Location> locations;

    // Adjacency list
    // location ID -> list of outgoing roads
    unordered_map<int, vector<Edge>> adjacencyList;

public:

    void addLocation(const Location& location);

    void addRoad(int source, const Edge& edge);

    void removeRoad(int source, int destination);

    void updateRoad(int source, int destination, const Edge& updatedEdge);

    void blockRoad(int source, int destination);

    void unblockRoad(int source, int destination);

    vector<Edge> getNeighbors(int locationId);

    void displayGraph();
};

#endif