#ifndef DISASTERX_DISASTER_ENGINE_H
#define DISASTERX_DISASTER_ENGINE_H

#include "Graph.h"
#include "EmergencyPriorityQueue.h"
#include "MinHeap.h"

#include <string>

using namespace std;

class DisasterEngine
{
private:
    Graph* graph;
    EmergencyPriorityQueue emergencyQueue;
    MinHeap resourceHeap;

public:
    DisasterEngine(Graph* graph);

    void blockRoad(
        const string& source,
        const string& destination
    );

    void unblockRoad(
        const string& source,
        const string& destination
    );

    void updateRoad(
        const string& source,
        const string& destination,
        const Edge& updatedEdge
    );

    void displayRoads(
        const string& locationId
    );

    void addEmergency(
        const Emergency& emergency
    );

    void processNextEmergency();

    void displayEmergencies();

    void addResource(const RescueResource& resource);

    void dispatchResource();
};

#endif
