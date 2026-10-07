#include <iostream>

#include "RouteDecisionEngine.h"

using namespace std;

vector<string> RouteDecisionEngine::findBestRoute(
    const Graph& graph,
    const string& source,
    const string& destination)
{
    /*
        For disaster situations, use A* because
        it uses geographic information to guide
        the search while considering disaster cost.
    */

    vector<string> path =
        AStar::findPath(
            graph,
            source,
            destination
        );

    return path;
}

double RouteDecisionEngine::getRouteCost(
    const Graph& graph,
    const string& source,
    const string& destination)
{
    return AStar::getPathCost(
        graph,
        source,
        destination
    );
}