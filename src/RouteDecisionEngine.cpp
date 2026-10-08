#include <iostream>
#include <iostream>
#include <queue>
#include <unordered_map>
#include <algorithm>

#include "RouteDecisionEngine.h"

using namespace std;

vector<string> RouteDecisionEngine::findBestRoute(
    const Graph& graph,
    const string& source,
    const string& destination)
{
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

        vector<Edge> roads =
            graph.getNeighbors(current);

        for (const Edge& road : roads)
        {
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

    if (cost.find(destination) == cost.end())
    {
        return {};
    }

    vector<string> route;

    string current = destination;

    while (current != source)
    {
        route.push_back(current);
        current = parent[current];
    }

    route.push_back(source);

    reverse(
        route.begin(),
        route.end()
    );

    return route;
}

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
        graph,
        source,
        destination
    );
}