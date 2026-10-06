#ifndef DISASTERX_ARTICULATION_POINTS_H
#define DISASTERX_ARTICULATION_POINTS_H

#include "Graph.h"
#include <string>
#include <vector>
#include <unordered_map>
#include <unordered_set>

using namespace std;

class ArticulationPoints
{
private:
    static void dfs(
        const Graph& graph,
        const string& current,
        const string& parent,
        unordered_set<string>& visited,
        unordered_map<string, int>& discoveryTime,
        unordered_map<string, int>& low,
        unordered_set<string>& articulationPoints,
        int& timer
    );

public:
    static vector<string> find(
        const Graph& graph
    );
};

#endif