#include <iostream>
<<<<<<< HEAD
=======
#include <queue>
#include <unordered_map>
#include <unordered_set>
#include <algorithm>
>>>>>>> e99e837 (Implement dynamic route rerouting)

#include "RouteDecisionEngine.h"

using namespace std;

<<<<<<< HEAD
=======

// ==================================================
// FIND BEST ROUTE
// ==================================================

>>>>>>> e99e837 (Implement dynamic route rerouting)
vector<string> RouteDecisionEngine::findBestRoute(
    const Graph& graph,
    const string& source,
    const string& destination)
{
<<<<<<< HEAD
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
=======
    unordered_map<string, double> cost;
    unordered_map<string, string> parent;

    priority_queue<
        pair<double, string>,
        vector<pair<double, string>>,
        greater<pair<double, string>>
    > pq;

    cost[source] = 0;
    pq.push({0, source});

    while (!pq.empty())
    {
        double currentCost = pq.top().first;
        string current = pq.top().second;

        pq.pop();

        if (current == destination)
        {
            break;
        }

        vector<Edge> roads = graph.getNeighbors(current);

        for (const Edge& road : roads)
        {
            // Closed roads cannot be used
            if (road.status == "Closed")
            {
                continue;
            }

            double newCost =
                currentCost + road.travelTime;

            if (cost.find(road.destination) == cost.end() ||
                newCost < cost[road.destination])
            {
                cost[road.destination] = newCost;
                parent[road.destination] = current;

                pq.push({
                    newCost,
                    road.destination
                });
            }
        }
    }

    // No route found
    if (cost.find(destination) == cost.end())
    {
        return {};
    }

    // Build route backwards
    vector<string> route;

    string current = destination;

    while (current != source)
    {
        route.push_back(current);
        current = parent[current];
    }

    route.push_back(source);

    reverse(route.begin(), route.end());

    return route;
}


// ==================================================
// GET ROUTE COST
// ==================================================

double RouteDecisionEngine::getRouteCost(
    const Graph& graph,
    const vector<string>& route)
{
    double totalCost = 0;

    for (size_t i = 0; i + 1 < route.size(); i++)
    {
        vector<Edge> roads =
            graph.getNeighbors(route[i]);

        for (const Edge& road : roads)
        {
            if (road.destination == route[i + 1])
            {
                totalCost += road.travelTime;
                break;
            }
        }
    }

    return totalCost;
}


// ==================================================
// DYNAMIC RE-ROUTING
// ==================================================

vector<string> RouteDecisionEngine::reroute(
    const Graph& graph,
    const vector<string>& currentRoute,
    const string& source,
    const string& destination)
{
    cout << "\nChecking current route...\n";

    bool routeBlocked = false;

    for (size_t i = 0; i + 1 < currentRoute.size(); i++)
    {
        string current = currentRoute[i];
        string next = currentRoute[i + 1];

        vector<Edge> roads =
            graph.getNeighbors(current);

        bool roadExists = false;

        for (const Edge& road : roads)
        {
            if (road.destination == next)
            {
                roadExists = true;

                if (road.status == "Closed")
                {
                    routeBlocked = true;

                    cout << "Blocked road detected: "
                         << current
                         << " -> "
                         << next
                         << endl;
                }

                break;
            }
        }

        if (!roadExists)
        {
            routeBlocked = true;

            cout << "Road no longer available: "
                 << current
                 << " -> "
                 << next
                 << endl;
        }
    }

    if (!routeBlocked)
    {
        cout << "Current route is still available."
             << endl;

        return currentRoute;
    }

    cout << "Recalculating route...\n";

    return findBestRoute(
>>>>>>> e99e837 (Implement dynamic route rerouting)
        graph,
        source,
        destination
    );
}