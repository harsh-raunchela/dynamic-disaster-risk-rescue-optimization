#ifndef DISASTERX_ROUTE_DECISION_ENGINE_H
#define DISASTERX_ROUTE_DECISION_ENGINE_H

#include "Graph.h"
#include "Dijkstra.h"
#include "AStar.h"

#include <string>
#include <vector>

using namespace std;

class RouteDecisionEngine
{
public:
    static vector<string> findBestRoute(
        const Graph& graph,
        const string& source,
        const string& destination
    );

    static double getRouteCost(
        const Graph& graph,
        const string& source,
        const string& destination
    );
};

#endif