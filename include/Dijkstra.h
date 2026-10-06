#ifndef DISASTERX_DIJKSTRA_H
#define DISASTERX_DIJKSTRA_H

#include "Graph.h"
#include <string>
#include <vector>

using namespace std;

class Dijkstra
{
private:
    static double calculateCost(const Edge& edge);

public:
    static vector<string> findShortestPath(
        const Graph& graph,
        const string& source,
        const string& destination
    );

    static double getShortestCost(
        const Graph& graph,
        const string& source,
        const string& destination
    );
};

#endif