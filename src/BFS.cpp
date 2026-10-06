#include <iostream>
#include <queue>
#include <unordered_set>

#include "BFS.h"

using namespace std;

void BFS::traverse(const Graph& graph, const string& startLocation)
{
    if (graph.getLocationCount() == 0)
    {
        cout << "Graph is empty.\n";
        return;
    }

    queue<string> q;
    unordered_set<string> visited;

    q.push(startLocation);
    visited.insert(startLocation);

    cout << "\nBFS Traversal:\n";

    while (!q.empty())
    {
        string current = q.front();
        q.pop();

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
                visited.insert(edge.destination);
                q.push(edge.destination);
            }
        }
    }
}