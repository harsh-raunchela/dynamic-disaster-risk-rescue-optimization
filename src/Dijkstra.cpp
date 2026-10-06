#include <iostream>
#include <queue>
#include <unordered_map>
#include <limits>
#include <algorithm>

#include "Dijkstra.h"

using namespace std;

double Dijkstra::calculateCost(const Edge& edge)
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

vector<string> Dijkstra::findShortestPath(
    const Graph& graph,
    const string& source,
    const string& destination)
{
    unordered_map<string, double> distance;
    unordered_map<string, string> previous;

    const double INF = numeric_limits<double>::infinity();

    for (const string& id : graph.getLocationIds())
    {
        distance[id] = INF;
    }

    if (distance.find(source) == distance.end() ||
        distance.find(destination) == distance.end())
    {
        cout << "Source or destination not found.\n";
        return {};
    }

    distance[source] = 0;

    priority_queue<
        pair<double, string>,
        vector<pair<double, string>>,
        greater<pair<double, string>>
    > pq;

    pq.push({0, source});

    while (!pq.empty())
    {
        double currentCost = pq.top().first;
        string currentLocation = pq.top().second;

        pq.pop();

        if (currentCost > distance[currentLocation])
        {
            continue;
        }

        if (currentLocation == destination)
        {
            break;
        }

        vector<Edge> neighbors =
            graph.getNeighbors(currentLocation);

        for (const Edge& edge : neighbors)
        {
            // Never use blocked roads
            if (edge.status == "Closed")
            {
                continue;
            }

            double edgeCost = calculateCost(edge);

            double newCost =
                currentCost + edgeCost;

            if (newCost < distance[edge.destination])
            {
                distance[edge.destination] = newCost;

                previous[edge.destination] =
                    currentLocation;

                pq.push({
                    newCost,
                    edge.destination
                });
            }
        }
    }

    if (distance[destination] == INF)
    {
        cout << "No safe route exists between "
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

double Dijkstra::getShortestCost(
    const Graph& graph,
    const string& source,
    const string& destination)
{
    vector<string> path =
        findShortestPath(
            graph,
            source,
            destination
        );

    if (path.empty())
    {
        return -1;
    }

    double totalCost = 0;

    for (size_t i = 0; i < path.size() - 1; i++)
    {
        vector<Edge> neighbors =
            graph.getNeighbors(path[i]);

        for (const Edge& edge : neighbors)
        {
            if (edge.destination == path[i + 1] &&
                edge.status != "Closed")
            {
                totalCost += calculateCost(edge);
                break;
            }
        }
    }

    return totalCost;
}