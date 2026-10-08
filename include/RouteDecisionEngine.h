<<<<<<< HEAD
#ifndef DISASTERX_ROUTE_DECISION_ENGINE_H
#define DISASTERX_ROUTE_DECISION_ENGINE_H

#include "Graph.h"
#include "Dijkstra.h"
#include "AStar.h"
=======
#ifndef ROUTE_DECISION_ENGINE_H
#define ROUTE_DECISION_ENGINE_H

#include "Graph.h"
>>>>>>> e99e837 (Implement dynamic route rerouting)

#include <string>
#include <vector>

using namespace std;

class RouteDecisionEngine
{
public:
<<<<<<< HEAD
=======

>>>>>>> e99e837 (Implement dynamic route rerouting)
    static vector<string> findBestRoute(
        const Graph& graph,
        const string& source,
        const string& destination
    );

    static double getRouteCost(
        const Graph& graph,
<<<<<<< HEAD
=======
        const vector<string>& route
    );

    static vector<string> reroute(
        const Graph& graph,
        const vector<string>& currentRoute,
>>>>>>> e99e837 (Implement dynamic route rerouting)
        const string& source,
        const string& destination
    );
};

#endif