#include <iostream>
#include "Graph.h"

using namespace std;

int main()
{
    Graph graph;

    if (!graph.loadLocations("data/locations.csv") ||
        !graph.loadRoads("data/roads.csv"))
    {
        cout << "FAIL: Dataset loading failed.\n";
        return 1;
    }

    int checked = 0;

    for (const string& locationId : graph.getLocationIds())
    {
        for (const Edge& road : graph.getNeighbors(locationId))
        {
            if (road.id.empty())
            {
                cout << "FAIL: Found a road with an empty ID.\n";
                return 1;
            }

            if (checked < 5)
            {
                cout << road.id << " | "
                     << locationId << " -> "
                     << road.destination << '\n';
            }

            checked++;
        }
    }

    cout << "Total roads checked: " << checked << '\n';

    if (checked != 2500)
    {
        cout << "FAIL: Unexpected road count.\n";
        return 1;
    }

    cout << "PASS: All roads have IDs.\n";
    return 0;
}
