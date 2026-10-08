#ifndef ROUTE_DECISION_ENGINE_H
#define ROUTE_DECISION_ENGINE_H

#include "Graph.h"

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
        const vector<string>& route
    );

    static vector<string> reroute(
        const Graph& graph,
        const vector<string>& currentRoute,
        const string& source,
        const string& destination
    );
};

#endif