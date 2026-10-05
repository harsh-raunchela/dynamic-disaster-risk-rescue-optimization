#ifndef EDGE_H
#define EDGE_H

#include <string>

using namespace std;

struct Edge
{
    string destination;

    double distance;
    double travelTime;

    string risk;
    string traffic;
    string roadCondition;

    string status;
};

#endif