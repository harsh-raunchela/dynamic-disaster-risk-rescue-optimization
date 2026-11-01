with open('src/RouteDecisionEngine.cpp', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add headers if missing
headers_to_add = []
if '#include <limits>' not in content:
    headers_to_add.append('#include <limits>')
if '#include <cmath>' not in content:
    headers_to_add.append('#include <cmath>')

if headers_to_add:
    target_inc = '#include <vector>'
    replacement_inc = target_inc + '\n' + '\n'.join(headers_to_add)
    content = content.replace(target_inc, replacement_inc, 1)

# 2. Replace getRouteCost and reroute
target_body = """double RouteDecisionEngine::getRouteCost(
    const Graph& graph,
    const vector<string>& route)
{
    if (route.empty())
    {
        cout << "ERROR: Route is empty.\\n";
        return -1.0;
    }

    double totalCost = 0.0;

    for (size_t i = 0; i + 1 < route.size(); i++)
    {
        string source = route[i];
        string destination = route[i + 1];

        vector<Edge> roads = graph.getNeighbors(source);
        bool roadFound = false;

        for (const Edge& road : roads)
        {
            if (road.destination == destination)
            {
                roadFound = true;

                cout << "Checking: " << source
                     << " -> " << destination
                     << " | Status: " << road.status
                     << " | Travel time: " << road.travelTime
                     << endl;

                if (road.status == "Closed" ||
                    road.travelTime < 0.0)
                {
                    cout << "ERROR: Road is closed or "
                         << "travel time is negative.\\n";
                    return -1.0;
                }

                totalCost += road.travelTime;
                break;
            }
        }

        if (!roadFound)
        {
            cout << "ERROR: Road not found: "
                 << source << " -> " << destination
                 << endl;

            return -1.0;
        }
    }

    return totalCost;
}



// ============================================================
// 4. REROUTE IF THE CURRENT ROUTE IS UNAVAILABLE
// ============================================================

vector<string> RouteDecisionEngine::reroute(
    const Graph& graph,
    const vector<string>& currentRoute,
    const string& source,
    const string& destination)
{
    cout << "\\nChecking current route...\\n";

    // Validate route endpoints.
    bool routeBlocked =
        currentRoute.empty() ||
        currentRoute.front() != source ||
        currentRoute.back() != destination;

    for (size_t i = 0;
         !routeBlocked && i + 1 < currentRoute.size();
         i++)
    {
        string current = currentRoute[i];
        string next = currentRoute[i + 1];

        vector<Edge> roads = graph.getNeighbors(current);
        bool roadExists = false;

        for (const Edge& road : roads)
        {
            if (road.destination == next)
            {
                roadExists = true;

                if (road.status == "Closed" ||
                    road.travelTime < 0.0)
                {
                    routeBlocked = true;

                    cout << "Unavailable road: "
                         << current << " -> " << next
                         << endl;
                }

                break;
            }
        }

        if (!roadExists)
        {
            routeBlocked = true;

            cout << "Road no longer available: "
                 << current << " -> " << next
                 << endl;
        }
    }

    if (!routeBlocked)
    {
        cout << "Current route is still available."
             << endl;

        return currentRoute;
    }

    cout << "Recalculating route...\\n";

    return findBestRoute(graph, source, destination);
}"""

replacement_body = """double RouteDecisionEngine::getRouteCost(
    const Graph& graph,
    const vector<string>& route)
{
    if (route.empty())
    {
        cout << "ERROR: Route is empty.\\n";
        return -1.0;
    }

    double totalCost = 0.0;

    for (size_t i = 0; i + 1 < route.size(); i++)
    {
        const string& source = route[i];
        const string& destination = route[i + 1];

        vector<Edge> roads = graph.getNeighbors(source);

        bool roadFound = false;
        double bestTravelTime = numeric_limits<double>::infinity();

        for (const Edge& road : roads)
        {
            if (road.destination != destination)
            {
                continue;
            }

            if (road.status == "Closed" ||
                road.travelTime < 0.0 ||
                !isfinite(road.travelTime))
            {
                continue;
            }

            roadFound = true;

            if (road.travelTime < bestTravelTime)
            {
                bestTravelTime = road.travelTime;
            }
        }

        if (!roadFound)
        {
            cout << "ERROR: No usable road found: "
                 << source << " -> " << destination
                 << endl;

            return -1.0;
        }

        cout << "Checking: " << source
             << " -> " << destination
             << " | Selected travel time: "
             << bestTravelTime << endl;

        totalCost += bestTravelTime;
    }

    return totalCost;
}



// ============================================================
// 4. REROUTE IF THE CURRENT ROUTE IS UNAVAILABLE
// ============================================================

vector<string> RouteDecisionEngine::reroute(
    const Graph& graph,
    const vector<string>& currentRoute,
    const string& source,
    const string& destination)
{
    cout << "\\nChecking current route...\\n";

    bool routeBlocked =
        currentRoute.empty() ||
        currentRoute.front() != source ||
        currentRoute.back() != destination;

    for (size_t i = 0;
         !routeBlocked && i + 1 < currentRoute.size();
         i++)
    {
        const string& current = currentRoute[i];
        const string& next = currentRoute[i + 1];

        vector<Edge> roads = graph.getNeighbors(current);

        bool usableRoadFound = false;

        for (const Edge& road : roads)
        {
            if (road.destination == next &&
                road.status != "Closed" &&
                road.travelTime >= 0.0 &&
                isfinite(road.travelTime))
            {
                usableRoadFound = true;
                break;
            }
        }

        if (!usableRoadFound)
        {
            routeBlocked = true;

            cout << "No usable road remains: "
                 << current << " -> " << next
                 << endl;
        }
    }

    if (!routeBlocked)
    {
        cout << "Current route is still available."
             << endl;

        return currentRoute;
    }

    cout << "Recalculating route...\\n";

    return findBestRoute(graph, source, destination);
}"""

if target_body in content:
    content = content.replace(target_body, replacement_body, 1)
    with open('src/RouteDecisionEngine.cpp', 'w', encoding='utf-8', newline='') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("TARGET NOT FOUND")

