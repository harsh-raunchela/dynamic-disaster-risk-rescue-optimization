#include <iostream>

#include "Graph.h"
#include "ArticulationPoints.h"

using namespace std;

int main()
{
    Graph graph;

    // Locations
    for (int i = 1; i <= 5; i++)
    {
        Location location;

        location.id =
            "LOC_000" + to_string(i);

        location.name =
            "Location " + to_string(i);

        location.type = "Junction";

        graph.addLocation(location);
    }

    /*
             LOC_0001
                 |
             LOC_0002
                 |
             LOC_0003
              /     \
        LOC_0004   LOC_0005

        LOC_0002 and LOC_0003 are articulation points.
    */

    Edge e12;
    e12.destination = "LOC_0002";
    e12.distance = 5;
    e12.travelTime = 10;
    e12.risk = "Low";
    e12.traffic = "Low";
    e12.roadCondition = "Good";
    e12.status = "Open";

    Edge e21 = e12;
    e21.destination = "LOC_0001";

    Edge e23 = e12;
    e23.destination = "LOC_0003";

    Edge e32 = e12;
    e32.destination = "LOC_0002";

    Edge e34 = e12;
    e34.destination = "LOC_0004";

    Edge e43 = e12;
    e43.destination = "LOC_0003";

    Edge e35 = e12;
    e35.destination = "LOC_0005";

    Edge e53 = e12;
    e53.destination = "LOC_0003";

    graph.addRoad("LOC_0001", e12);
    graph.addRoad("LOC_0002", e21);

    graph.addRoad("LOC_0002", e23);
    graph.addRoad("LOC_0003", e32);

    graph.addRoad("LOC_0003", e34);
    graph.addRoad("LOC_0004", e43);

    graph.addRoad("LOC_0003", e35);
    graph.addRoad("LOC_0005", e53);

    cout << "Finding articulation points...\n";

    vector<string> points =
        ArticulationPoints::find(graph);

    cout << "\nCritical Locations:\n";

    if (points.empty())
    {
        cout << "No articulation points found.\n";
    }
    else
    {
        for (const string& point : points)
        {
            cout << point << endl;
        }
    }

    return 0;
}