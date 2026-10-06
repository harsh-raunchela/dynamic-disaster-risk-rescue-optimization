#include <iostream>
#include <algorithm>

#include "ArticulationPoints.h"

using namespace std;

void ArticulationPoints::dfs(
    const Graph& graph,
    const string& current,
    const string& parent,
    unordered_set<string>& visited,
    unordered_map<string, int>& discoveryTime,
    unordered_map<string, int>& low,
    unordered_set<string>& articulationPoints,
    int& timer)
{
    visited.insert(current);

    discoveryTime[current] = timer;
    low[current] = timer;

    timer++;

    int children = 0;

    vector<Edge> neighbors =
        graph.getNeighbors(current);

    for (const Edge& edge : neighbors)
    {
        // Ignore blocked roads
        if (edge.status == "Closed")
        {
            continue;
        }

        string neighbor = edge.destination;

        // Ignore parent
        if (neighbor == parent)
        {
            continue;
        }

        // If neighbor has not been visited
        if (visited.find(neighbor) == visited.end())
        {
            children++;

            dfs(
                graph,
                neighbor,
                current,
                visited,
                discoveryTime,
                low,
                articulationPoints,
                timer
            );

            low[current] =
                min(low[current], low[neighbor]);

            // Non-root articulation point
            if (parent != "" &&
                low[neighbor] >= discoveryTime[current])
            {
                articulationPoints.insert(current);
            }
        }
        else
        {
            // Back edge
            low[current] =
                min(
                    low[current],
                    discoveryTime[neighbor]
                );
        }
    }

    // Root articulation point
    if (parent == "" && children > 1)
    {
        articulationPoints.insert(current);
    }
}

vector<string> ArticulationPoints::find(
    const Graph& graph)
{
    unordered_set<string> visited;
    unordered_map<string, int> discoveryTime;
    unordered_map<string, int> low;
    unordered_set<string> articulationPoints;

    int timer = 0;

    vector<string> locations =
        graph.getLocationIds();

    for (const string& location : locations)
    {
        if (visited.find(location) == visited.end())
        {
            dfs(
                graph,
                location,
                "",
                visited,
                discoveryTime,
                low,
                articulationPoints,
                timer
            );
        }
    }

    vector<string> result;

    for (const string& point : articulationPoints)
    {
        result.push_back(point);
    }

    sort(result.begin(), result.end());

    return result;
}