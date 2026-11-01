with open('src/RouteDecisionEngine.cpp', 'r', encoding='utf-8') as f:
    content = f.read()

# Helper code
helper = """namespace
{
    double calculateEdgeCost(const Edge& road)
    {
        // Closed roads cannot be used.
        if (road.status == "Closed")
        {
            return std::numeric_limits<double>::infinity();
        }

        // Reject invalid travel times.
        if (road.travelTime < 0.0 ||
            !std::isfinite(road.travelTime))
        {
            return std::numeric_limits<double>::infinity();
        }

        double cost = road.travelTime;

        // Risk penalty: includes ML-predicted risk.
        if (road.risk == "Low")
        {
            cost += 0.0;
        }
        else if (road.risk == "Medium")
        {
            cost += 10.0;
        }
        else if (road.risk == "High")
        {
            cost += 25.0;
        }
        else if (road.risk == "Critical")
        {
            cost += 50.0;
        }

        // Traffic penalty.
        if (road.traffic == "Low")
        {
            cost += 0.0;
        }
        else if (road.traffic == "Medium")
        {
            cost += 5.0;
        }
        else if (road.traffic == "High")
        {
            cost += 15.0;
        }

        // Road-condition penalty.
        if (road.roadCondition == "Good")
        {
            cost += 0.0;
        }
        else if (road.roadCondition == "Damaged")
        {
            cost += 15.0;
        }
        else if (road.roadCondition == "Severely Damaged")
        {
            cost += 30.0;
        }

        return cost;
    }
}
"""

# Insert helper before "// 1. DIJKSTRA - FIND BEST ROUTE"
target_marker = "// ============================================================\n// 1. DIJKSTRA - FIND BEST ROUTE"
if target_marker in content:
    content = content.replace(target_marker, helper + "\n\n" + target_marker, 1)
else:
    print("MARKER NOT FOUND")

# Update findBestRoute
target_dijkstra = """        for (const Edge& road : roads)
        {
            // Ignore closed roads and negative travel times.
            if (road.status == "Closed" ||
                road.travelTime < 0.0)
            {
                continue;
            }

            double newCost = currentCost + road.travelTime;"""

replacement_dijkstra = """        for (const Edge& road : roads)
        {
            double edgeCost = calculateEdgeCost(road);

            if (!std::isfinite(edgeCost))
            {
                continue;
            }

            double newCost = currentCost + edgeCost;"""

if target_dijkstra in content:
    content = content.replace(target_dijkstra, replacement_dijkstra, 1)
else:
    print("TARGET DIJKSTRA NOT FOUND")

# Update findAStarRoute
target_astar = """        for (const Edge& road : roads)
        {
            if (road.status == "Closed" ||
                road.travelTime < 0.0)
            {
                continue;
            }

            double tentativeScore =
                currentScore + road.travelTime;"""

replacement_astar = """        for (const Edge& road : roads)
        {
            double edgeCost = calculateEdgeCost(road);

            if (!std::isfinite(edgeCost))
            {
                continue;
            }

            double tentativeScore =
                currentScore + edgeCost;"""

if target_astar in content:
    content = content.replace(target_astar, replacement_astar, 1)
else:
    print("TARGET ASTAR NOT FOUND")

# Update getRouteCost
target_get_cost = """double RouteDecisionEngine::getRouteCost(
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
}"""

replacement_get_cost = """double RouteDecisionEngine::getRouteCost(
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
        double bestEdgeCost =
            numeric_limits<double>::infinity();

        for (const Edge& road : roads)
        {
            if (road.destination != destination)
            {
                continue;
            }

            double edgeCost = calculateEdgeCost(road);

            if (!isfinite(edgeCost))
            {
                continue;
            }

            if (edgeCost < bestEdgeCost)
            {
                bestEdgeCost = edgeCost;
                roadFound = true;
            }
        }

        if (!roadFound)
        {
            cout << "ERROR: No usable road found: "
                 << source << " -> "
                 << destination << endl;

            return -1.0;
        }

        cout << "Checking: " << source
             << " -> " << destination
             << " | Selected edge cost: "
             << bestEdgeCost << endl;

        totalCost += bestEdgeCost;
    }

    return totalCost;
}"""

if target_get_cost in content:
    content = content.replace(target_get_cost, replacement_get_cost, 1)
else:
    print("TARGET GET_COST NOT FOUND")

with open('src/RouteDecisionEngine.cpp', 'w', encoding='utf-8', newline='') as f:
    f.write(content)

print("ALL_DONE")

