#ifndef ROUTE_DECISION_ENGINE_H
#define ROUTE_DECISION_ENGINE_H

#include "Graph.h"

#include <string>
#include <vector>

using namespace std;

struct RouteSegmentCost
{
    string roadId;
    string source;
    string destination;
    double travelTime;
    double riskPenalty;
    double trafficPenalty;
    double roadConditionPenalty;
    double statusPenalty;
    double totalCost;
};

class RouteDecisionEngine
{
public:

    static vector<string> findBestRoute(
        const Graph& graph,
        const string& source,
        const string& destination
    );

    static vector<string> findAStarRoute(
        const Graph& graph,
        const string& source,
        const string& destination
    );

    static double getRouteCost(
        const Graph& graph,
        const vector<string>& route
    );

    // Returns the same lowest-cost usable edge selected for each route
    // segment, without printing CLI output.
    static bool getRouteCostBreakdown(
        const Graph& graph,
        const vector<string>& route,
        vector<RouteSegmentCost>& segments,
        double& totalCost
    );

    static void setRestrictedRoadPenalty(double penalty);
    static double getRestrictedRoadPenalty();

    static vector<string> reroute(
        const Graph& graph,
        const vector<string>& currentRoute,
        const string& source,
        const string& destination
    );
};

#endif
