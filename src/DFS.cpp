#include <iostream>
#include <unordered_set>

#include "DFS.h"

using namespace std;

void dfsVisit(const Graph& graph,
              const string& current,
              unordered_set<string>& visited)
{
    visited.insert(current);

    cout << current << endl;

    vector<Edge> neighbors = graph.getNeighbors(current);

    for (const Edge& edge : neighbors)
    {
        // Ignore blocked roads
        if (edge.status == "Closed")
        {
            continue;
        }

        if (visited.find(edge.destination) == visited.end())
        {
            dfsVisit(graph, edge.destination, visited);
        }
    }
}

void DFS::traverse(const Graph& graph, const string& startLocation)
{
    if (graph.getLocationCount() == 0)
    {
        cout << "Graph is empty.\n";
        return;
    }

    unordered_set<string> visited;

    cout << "\nDFS Traversal:\n";

    dfsVisit(graph, startLocation, visited);
}