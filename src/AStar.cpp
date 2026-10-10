#include <iostream>
#include <queue>
#include <unordered_map>
#include <limits>
#include <algorithm>
#include <cmath>

#include "AStar.h"

using namespace std;

const double PI = 3.14159265358979323846;

double toRadians(double degrees)
{
    return degrees * PI / 180.0;
}

double haversineDistance(
    double lat1,
    double lon1,
    double lat2,
    double lon2)
{
    const double EARTH_RADIUS = 6371.0;

    double dLat = toRadians(lat2 - lat1);
    double dLon = toRadians(lon2 - lon1);

    lat1 = toRadians(lat1);
    lat2 = toRadians(lat2);

    double a =
        sin(dLat / 2) * sin(dLat / 2) +
        cos(lat1) *
        cos(lat2) *
        sin(dLon / 2) *
        sin(dLon / 2);

    double c =
        2 * atan2(sqrt(a), sqrt(1 - a));

    return EARTH_RADIUS * c;
}

double AStar::heuristic(
    const Graph& graph,
    const string& current,
    const string& destination)
{
    const Location* currentLocation =
        graph.getLocation(current);

    const Location* destinationLocation =
        graph.getLocation(destination);

    if (currentLocation == nullptr ||
        destinationLocation == nullptr)
    {
        return 0;
    }

    return haversineDistance(
        currentLocation->latitude,
        currentLocation->longitude,
        destinationLocation->latitude,
        destinationLocation->longitude
    );
}

double AStar::calculateCost(const Edge& edge)
{
    double cost = edge.distance;

    // Risk penalty
    if (edge.risk == "Low")
{
    cost += 0;
}
else if (edge.risk == "Medium")
{
    cost += 10;
}
else if (edge.risk == "High")
{
    cost += 25;
}
else if (edge.risk == "Critical")
{
    cost += 50;
}

    // Traffic penalty
    if (edge.traffic == "Low")
    {
        cost += 0;
    }
    else if (edge.traffic == "Medium")
    {
        cost += 5;
    }
    else if (edge.traffic == "High")
    {
        cost += 15;
    }

    // Road condition penalty
    if (edge.roadCondition == "Good")
    {
        cost += 0;
    }
    else if (edge.roadCondition == "Damaged")
    {
        cost += 15;
    }
    else if (edge.roadCondition == "Severely Damaged")
    {
        cost += 30;
    }

    return cost;
}

vector<string> AStar::findPath(
    const Graph& graph,
    const string& source,
    const string& destination)
{
    unordered_map<string, double> gScore;
    unordered_map<string, double> fScore;
    unordered_map<string, string> previous;

    const double INF =
        numeric_limits<double>::infinity();

    for (const string& id : graph.getLocationIds())
    {
        gScore[id] = INF;
        fScore[id] = INF;
    }

    if (gScore.find(source) == gScore.end() ||
        gScore.find(destination) == gScore.end())
    {
        cout << "Source or destination not found.\n";
        return {};
    }

    gScore[source] = 0;

    fScore[source] =
        heuristic(graph, source, destination);

    priority_queue<
        pair<double, string>,
        vector<pair<double, string>>,
        greater<pair<double, string>>
    > openSet;

    openSet.push({
        fScore[source],
        source
    });

    while (!openSet.empty())
    {
        string current =
            openSet.top().second;

        openSet.pop();

        if (current == destination)
        {
            break;
        }

        vector<Edge> neighbors =
            graph.getNeighbors(current);

        for (const Edge& edge : neighbors)
        {
            // Ignore blocked roads
            if (edge.status == "Closed")
            {
                continue;
            }

            double edgeCost =
                calculateCost(edge);

            double tentativeGScore =
                gScore[current] + edgeCost;

            if (tentativeGScore <
                gScore[edge.destination])
            {
                previous[edge.destination] =
                    current;

                gScore[edge.destination] =
                    tentativeGScore;

                fScore[edge.destination] =
                    tentativeGScore +
                    heuristic(
                        graph,
                        edge.destination,
                        destination
                    );

                openSet.push({
                    fScore[edge.destination],
                    edge.destination
                });
            }
        }
    }

    if (gScore[destination] == INF)
    {
        cout << "No path exists between "
             << source << " and "
             << destination << ".\n";

        return {};
    }

    vector<string> path;

    string current = destination;

    while (current != source)
    {
        path.push_back(current);
        current = previous[current];
    }

    path.push_back(source);

    reverse(path.begin(), path.end());

    return path;
}

double AStar::getPathCost(
    const Graph& graph,
    const string& source,
    const string& destination)
{
    vector<string> path =
        findPath(graph, source, destination);

    if (path.empty())
    {
        return -1;
    }

    double totalCost = 0;

    for (size_t i = 0;
         i < path.size() - 1;
         i++)
    {
        vector<Edge> neighbors =
            graph.getNeighbors(path[i]);

        for (const Edge& edge : neighbors)
        {
            if (edge.destination == path[i + 1] &&
                edge.status != "Closed")
            {
                totalCost +=
                    calculateCost(edge);

                break;
            }
        }
    }

    return totalCost;
}