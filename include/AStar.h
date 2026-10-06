#ifndef DISASTERX_ASTAR_H
#define DISASTERX_ASTAR_H

#include "Graph.h"
#include <string>
#include <vector>

using namespace std;

class AStar
{
private:
    static double heuristic(
        const Graph& graph,
        const string& current,
        const string& destination
    );

    static double calculateCost(const Edge& edge);

public:
    static vector<string> findPath(
        const Graph& graph,
        const string& source,
        const string& destination
    );

    static double getPathCost(
        const Graph& graph,
        const string& source,
        const string& destination
    );
};

#endif