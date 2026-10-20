
#include <iostream>
#include <queue>
#include <unordered_map>
#include <algorithm>
#include <string>
#include <vector>

#include "RouteDecisionEngine.h"

using namespace std;


// ============================================================
// 1. DIJKSTRA - FIND BEST ROUTE
// ============================================================

vector<string> RouteDecisionEngine::findBestRoute(
    const Graph& graph,
    const string& source,
    const string& destination)
{
    // Validate source and destination.
    if (!graph.getLocation(source) ||
        !graph.getLocation(destination))
    {
        return {};
    }

    unordered_map<string, double> cost;
    unordered_map<string, string> parent;

    priority_queue<
        pair<double, string>,
        vector<pair<double, string>>,
        greater<pair<double, string>>
    > pq;

    cost[source] = 0.0;
    pq.push({0.0, source});

    while (!pq.empty())
    {
        double currentCost = pq.top().first;
        string current = pq.top().second;
        pq.pop();

        // Skip outdated priority-queue entries.
        auto currentIt = cost.find(current);

        if (currentIt == cost.end() ||
            currentCost > currentIt->second)
        {
            continue;
        }

        if (current == destination)
        {
            break;
        }

        vector<Edge> roads = graph.getNeighbors(current);

        for (const Edge& road : roads)
        {
            // Ignore closed roads and negative travel times.
            if (road.status == "Closed" ||
                road.travelTime < 0.0)
            {
                continue;
            }

            double newCost = currentCost + road.travelTime;

            auto it = cost.find(road.destination);

            if (it == cost.end() || newCost < it->second)
            {
                cost[road.destination] = newCost;
                parent[road.destination] = current;

                pq.push({newCost, road.destination});
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

        auto it = parent.find(current);

        if (it == parent.end())
        {
            return {};
        }

        current = it->second;
    }

    route.push_back(source);
    reverse(route.begin(), route.end());

    return route;
}


// ============================================================
// 2. A* ROUTE FINDING
// NOTE: The heuristic is zero, so this currently behaves
// like Dijkstra. It does not yet provide A* performance gains.
// ============================================================

vector<string> RouteDecisionEngine::findAStarRoute(
    const Graph& graph,
    const string& source,
    const string& destination)
{
    if (!graph.getLocation(source) ||
        !graph.getLocation(destination))
    {
        return {};
    }

    unordered_map<string, double> gScore;
    unordered_map<string, string> parent;

    priority_queue<
        pair<double, string>,
        vector<pair<double, string>>,
        greater<pair<double, string>>
    > openSet;

    gScore[source] = 0.0;
    openSet.push({0.0, source});

    while (!openSet.empty())
    {
        double currentScore = openSet.top().first;
        string current = openSet.top().second;
        openSet.pop();

        // Ignore outdated entries.
        auto currentIt = gScore.find(current);

        if (currentIt == gScore.end() ||
            currentScore > currentIt->second)
        {
            continue;
        }

        if (current == destination)
        {
            break;
        }

        vector<Edge> roads = graph.getNeighbors(current);

        for (const Edge& road : roads)
        {
            if (road.status == "Closed" ||
                road.travelTime < 0.0)
            {
                continue;
            }

            double tentativeScore =
                currentScore + road.travelTime;

            auto it = gScore.find(road.destination);

            if (it == gScore.end() ||
                tentativeScore < it->second)
            {
                gScore[road.destination] = tentativeScore;
                parent[road.destination] = current;

                // Zero heuristic: f(n) = g(n).
                openSet.push({
                    tentativeScore,
                    road.destination
                });
            }
        }
    }

    if (gScore.find(destination) == gScore.end())
    {
        return {};
    }

    vector<string> route;
    string current = destination;

    while (current != source)
    {
        route.push_back(current);

        auto it = parent.find(current);

        if (it == parent.end())
        {
            return {};
        }

        current = it->second;
    }

    route.push_back(source);
    reverse(route.begin(), route.end());

    return route;
}


// ============================================================
// 3. CALCULATE ROUTE COST
// Returns -1 for invalid routes.
// ============================================================


double RouteDecisionEngine::getRouteCost(
    const Graph& graph,
    const vector<string>& route)
{
    if (route.empty())
    {
        cout << "ERROR: Route is empty.\n";
        return -1.0;
    }

    double totalCost = 0.0;

    for (size_t i = 0; i + 1 < route.size(); i++)
    {
        string source = route[i];
        string destination = route[i + 1];

        vector<Edge> roads = graph.getNeighbors(source);
        bool roadFound = false;

        for (const Edge& road : roads)
        {
            if (road.destination == destination)
            {
                roadFound = true;

                cout << "Checking: " << source
                     << " -> " << destination
                     << " | Status: " << road.status
                     << " | Travel time: " << road.travelTime
                     << endl;

                if (road.status == "Closed" ||
                    road.travelTime < 0.0)
                {
                    cout << "ERROR: Road is closed or "
                         << "travel time is negative.\n";
                    return -1.0;
                }

                totalCost += road.travelTime;
                break;
            }
        }

        if (!roadFound)
        {
            cout << "ERROR: Road not found: "
                 << source << " -> " << destination
                 << endl;

            return -1.0;
        }
    }

    return totalCost;
}



// ============================================================
// 4. REROUTE IF THE CURRENT ROUTE IS UNAVAILABLE
// ============================================================

vector<string> RouteDecisionEngine::reroute(
    const Graph& graph,
    const vector<string>& currentRoute,
    const string& source,
    const string& destination)
{
    cout << "\nChecking current route...\n";

    // Validate route endpoints.
    bool routeBlocked =
        currentRoute.empty() ||
        currentRoute.front() != source ||
        currentRoute.back() != destination;

    for (size_t i = 0;
         !routeBlocked && i + 1 < currentRoute.size();
         i++)
    {
        string current = currentRoute[i];
        string next = currentRoute[i + 1];

        vector<Edge> roads = graph.getNeighbors(current);
        bool roadExists = false;

        for (const Edge& road : roads)
        {
            if (road.destination == next)
            {
                roadExists = true;

                if (road.status == "Closed" ||
                    road.travelTime < 0.0)
                {
                    routeBlocked = true;

                    cout << "Unavailable road: "
                         << current << " -> " << next
                         << endl;
                }

                break;
            }
        }

        if (!roadExists)
        {
            routeBlocked = true;

            cout << "Road no longer available: "
                 << current << " -> " << next
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

    return findBestRoute(graph, source, destination);
}
