#ifndef DISASTERX_BFS_H
#define DISASTERX_BFS_H

#include "Graph.h"
#include <string>

using namespace std;

class BFS
{
public:
    static void traverse(const Graph& graph, const string& startLocation);
};

#endif