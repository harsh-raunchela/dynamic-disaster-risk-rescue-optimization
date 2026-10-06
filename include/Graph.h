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
    void addLocation(const Location& location);
    void addRoad(const string& source, const Edge& edge);
    void removeRoad(const string& source, const string& destination);
    void updateRoad(const string& source, const string& destination, const Edge& updatedEdge);
    void blockRoad(const string& source, const string& destination);
    void unblockRoad(const string& source, const string& destination);

    vector<Edge> getNeighbors(const string& locationId) const;
    vector<string> getLocationIds() const;

    void displayGraph();

    bool loadLocations(const string& filename);
    bool loadRoads(const string& filename);

    int getLocationCount() const;
    int getRoadCount() const;
};

#endif