#ifndef EDGE_H
#define EDGE_H

struct Edge
{
    int destination;

    double distance;
    double travelTime;
    double risk;
    double traffic;
    double roadCondition;

    bool blocked;
};

#endif