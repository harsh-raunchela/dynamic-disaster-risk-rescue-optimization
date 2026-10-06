#ifndef DISASTERX_DFS_H
#define DISASTERX_DFS_H

#include "Graph.h"
#include <string>

using namespace std;

class DFS
{
public:
    static void traverse(const Graph& graph, const string& startLocation);
};

#endif