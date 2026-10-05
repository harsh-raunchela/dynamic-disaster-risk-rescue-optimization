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

    // Location ID -> Location
    unordered_map<string, Location> locations;

    // Location ID -> outgoing roads
    unordered_map<string, vector<Edge>> adjacencyList;

public:

    // -------------------------
    // Location operations
    // -------------------------

    void addLocation(const Location& location);

    // -------------------------
    // Road operations
    // -------------------------

    void addRoad(const string& source, const Edge& edge);

    void removeRoad(
        const string& source,
        const string& destination
    );

    void updateRoad(
        const string& source,
        const string& destination,
        const Edge& updatedEdge
    );

    void blockRoad(
        const string& source,
        const string& destination
    );

    void unblockRoad(
        const string& source,
        const string& destination
    );

    // -------------------------
    // Graph operations
    // -------------------------

    vector<Edge> getNeighbors(
        const string& locationId
    );

    void displayGraph();

    // -------------------------
    // CSV loading
    // -------------------------

    bool loadLocations(const string& filename);

    bool loadRoads(const string& filename);

    // -------------------------
    // Information
    // -------------------------

    int getLocationCount() const;

    int getRoadCount() const;
};

#endif