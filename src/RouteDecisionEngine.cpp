
#include <iostream>
#include <queue>
#include <unordered_map>
#include <algorithm>
#include <string>
#include <vector>
#include <limits>
#include <cmath>

#include "RouteDecisionEngine.h"

using namespace std;


namespace
{
    double restrictedRoadPenalty = 40.0;

    bool calculateEdgeCostComponents(
        const Edge& road,
        double& travelTime,
        double& riskPenalty,
        double& trafficPenalty,
        double& roadConditionPenalty,
        double& statusPenalty)
    {
        if (road.status == "Closed" ||
            road.travelTime < 0.0 ||
            !std::isfinite(road.travelTime))
        {
            return false;
        }

        travelTime = road.travelTime;
        riskPenalty = 0.0;
        trafficPenalty = 0.0;
        roadConditionPenalty = 0.0;
        statusPenalty = road.status == "Restricted"
            ? restrictedRoadPenalty : 0.0;

        if (road.risk == "Medium")
            riskPenalty = 10.0;
        else if (road.risk == "High")
            riskPenalty = 25.0;
        else if (road.risk == "Critical")
            riskPenalty = 50.0;

        if (road.traffic == "Medium")
            trafficPenalty = 5.0;
        else if (road.traffic == "High")
            trafficPenalty = 15.0;

        if (road.roadCondition == "Damaged")
            roadConditionPenalty = 15.0;
        else if (road.roadCondition == "Severely Damaged")
            roadConditionPenalty = 30.0;

        return true;
    }

    double calculateEdgeCost(const Edge& road)
    {
        double travelTime = 0.0;
        double riskPenalty = 0.0;
        double trafficPenalty = 0.0;
        double roadConditionPenalty = 0.0;
        double statusPenalty = 0.0;

        if (!calculateEdgeCostComponents(
                road, travelTime, riskPenalty, trafficPenalty,
                roadConditionPenalty, statusPenalty))
        {
            return std::numeric_limits<double>::infinity();
        }

        return travelTime + riskPenalty + trafficPenalty +
               roadConditionPenalty + statusPenalty;
    }
}

void RouteDecisionEngine::setRestrictedRoadPenalty(double penalty)
{
    if (std::isfinite(penalty) && penalty >= 0.0)
    {
        restrictedRoadPenalty = penalty;
    }
}

double RouteDecisionEngine::getRestrictedRoadPenalty()
{
    return restrictedRoadPenalty;
}


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
            double edgeCost = calculateEdgeCost(road);

            if (!std::isfinite(edgeCost))
            {
                continue;
            }

            double newCost = currentCost + edgeCost;

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

    // Admissible heuristic: zero.
    // This guarantees optimality with nonnegative edge costs.
    auto heuristic = [](
        const string& current,
        const string& destination) -> double
    {
        (void)current;
        (void)destination;
        return 0.0;
    };

    gScore[source] = 0.0;

    openSet.push({
        heuristic(source, destination),
        source
    });

    while (!openSet.empty())
    {
        string current = openSet.top().second;
        openSet.pop();

        auto currentIt = gScore.find(current);

        if (currentIt == gScore.end())
        {
            continue;
        }

        double currentGScore = currentIt->second;

        if (current == destination)
        {
            break;
        }

        vector<Edge> roads = graph.getNeighbors(current);

        for (const Edge& road : roads)
        {
            double edgeCost = calculateEdgeCost(road);

            if (!std::isfinite(edgeCost))
            {
                continue;
            }

            double tentativeGScore =
                currentGScore + edgeCost;

            auto it = gScore.find(road.destination);

            if (it == gScore.end() ||
                tentativeGScore < it->second)
            {
                gScore[road.destination] = tentativeGScore;
                parent[road.destination] = current;

                double fScore =
                    tentativeGScore +
                    heuristic(road.destination, destination);

                openSet.push({
                    fScore,
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
        const string& source = route[i];
        const string& destination = route[i + 1];

        vector<Edge> roads = graph.getNeighbors(source);

        bool roadFound = false;
        double bestEdgeCost =
            numeric_limits<double>::infinity();

        for (const Edge& road : roads)
        {
            if (road.destination != destination)
            {
                continue;
            }

            double edgeCost = calculateEdgeCost(road);

            if (!isfinite(edgeCost))
            {
                continue;
            }

            if (edgeCost < bestEdgeCost)
            {
                bestEdgeCost = edgeCost;
                roadFound = true;
            }
        }

        if (!roadFound)
        {
            cout << "ERROR: No usable road found: "
                 << source << " -> "
                 << destination << endl;

            return -1.0;
        }

        cout << "Checking: " << source
             << " -> " << destination
             << " | Selected edge cost: "
             << bestEdgeCost << endl;

        totalCost += bestEdgeCost;
    }

    return totalCost;
}

bool RouteDecisionEngine::getRouteCostBreakdown(
    const Graph& graph,
    const vector<string>& route,
    vector<RouteSegmentCost>& segments,
    double& totalCost)
{
    segments.clear();
    totalCost = 0.0;

    if (route.empty())
    {
        return false;
    }

    for (size_t i = 0; i + 1 < route.size(); ++i)
    {
        const string& source = route[i];
        const string& destination = route[i + 1];
        vector<Edge> roads = graph.getNeighbors(source);

        bool found = false;
        RouteSegmentCost selected{};

        for (const Edge& road : roads)
        {
            if (road.destination != destination)
            {
                continue;
            }

            RouteSegmentCost candidate{};
            candidate.roadId = road.id;
            candidate.source = source;
            candidate.destination = destination;

            if (!calculateEdgeCostComponents(
                    road,
                    candidate.travelTime,
                    candidate.riskPenalty,
                    candidate.trafficPenalty,
                    candidate.roadConditionPenalty,
                    candidate.statusPenalty))
            {
                continue;
            }

            candidate.totalCost = candidate.travelTime +
                candidate.riskPenalty + candidate.trafficPenalty +
                candidate.roadConditionPenalty + candidate.statusPenalty;

            if (!found || candidate.totalCost < selected.totalCost)
            {
                selected = candidate;
                found = true;
            }
        }

        if (!found)
        {
            segments.clear();
            totalCost = 0.0;
            return false;
        }

        totalCost += selected.totalCost;
        segments.push_back(selected);
    }

    return true;
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

    bool routeBlocked =
        currentRoute.empty() ||
        currentRoute.front() != source ||
        currentRoute.back() != destination;

    for (size_t i = 0;
         !routeBlocked && i + 1 < currentRoute.size();
         i++)
    {
        const string& current = currentRoute[i];
        const string& next = currentRoute[i + 1];

        vector<Edge> roads = graph.getNeighbors(current);

        bool usableRoadFound = false;

        for (const Edge& road : roads)
        {
            if (road.destination == next &&
                road.status != "Closed" &&
                road.travelTime >= 0.0 &&
                isfinite(road.travelTime))
            {
                usableRoadFound = true;
                break;
            }
        }

        if (!usableRoadFound)
        {
            routeBlocked = true;

            cout << "No usable road remains: "
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
