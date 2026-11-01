with open('src/RouteDecisionEngine.cpp', 'r', encoding='utf-8') as f:
    content = f.read()

target = """vector<string> RouteDecisionEngine::findAStarRoute(
    const Graph& graph,
    const string& source,
    const string& destination)
{
    if (!graph.getLocation(source) ||
        !graph.getLocation(destination))
    {
        return {};
    }

    unordered_map<string, double> gScore;
    unordered_map<string, string> parent;

    priority_queue<
        pair<double, string>,
        vector<pair<double, string>>,
        greater<pair<double, string>>
    > openSet;

    gScore[source] = 0.0;
    openSet.push({0.0, source});

    while (!openSet.empty())
    {
        double currentScore = openSet.top().first;
        string current = openSet.top().second;
        openSet.pop();

        // Ignore outdated entries.
        auto currentIt = gScore.find(current);

        if (currentIt == gScore.end() ||
            currentScore > currentIt->second)
        {
            continue;
        }

        if (current == destination)
        {
            break;
        }

        vector<Edge> roads = graph.getNeighbors(current);

        for (const Edge& road : roads)
        {
            double edgeCost = calculateEdgeCost(road);

            if (!std::isfinite(edgeCost))
            {
                continue;
            }

            double tentativeScore =
                currentScore + edgeCost;

            auto it = gScore.find(road.destination);

            if (it == gScore.end() ||
                tentativeScore < it->second)
            {
                gScore[road.destination] = tentativeScore;
                parent[road.destination] = current;

                // Zero heuristic: f(n) = g(n).
                openSet.push({
                    tentativeScore,
                    road.destination
                });
            }
        }
    }

    if (gScore.find(destination) == gScore.end())
    {
        return {};
    }

    vector<string> route;
    string current = destination;

    while (current != source)
    {
        route.push_back(current);

        auto it = parent.find(current);

        if (it == parent.end())
        {
            return {};
        }

        current = it->second;
    }

    route.push_back(source);
    reverse(route.begin(), route.end());

    return route;
}"""

replacement = """vector<string> RouteDecisionEngine::findAStarRoute(
    const Graph& graph,
    const string& source,
    const string& destination)
{
    if (!graph.getLocation(source) ||
        !graph.getLocation(destination))
    {
        return {};
    }

    unordered_map<string, double> gScore;
    unordered_map<string, string> parent;

    priority_queue<
        pair<double, string>,
        vector<pair<double, string>>,
        greater<pair<double, string>>
    > openSet;

    // Admissible heuristic: zero.
    // This guarantees optimality with nonnegative edge costs.
    auto heuristic = [](
        const string& current,
        const string& destination) -> double
    {
        (void)current;
        (void)destination;
        return 0.0;
    };

    gScore[source] = 0.0;

    openSet.push({
        heuristic(source, destination),
        source
    });

    while (!openSet.empty())
    {
        string current = openSet.top().second;
        openSet.pop();

        auto currentIt = gScore.find(current);

        if (currentIt == gScore.end())
        {
            continue;
        }

        double currentGScore = currentIt->second;

        if (current == destination)
        {
            break;
        }

        vector<Edge> roads = graph.getNeighbors(current);

        for (const Edge& road : roads)
        {
            double edgeCost = calculateEdgeCost(road);

            if (!std::isfinite(edgeCost))
            {
                continue;
            }

            double tentativeGScore =
                currentGScore + edgeCost;

            auto it = gScore.find(road.destination);

            if (it == gScore.end() ||
                tentativeGScore < it->second)
            {
                gScore[road.destination] = tentativeGScore;
                parent[road.destination] = current;

                double fScore =
                    tentativeGScore +
                    heuristic(road.destination, destination);

                openSet.push({
                    fScore,
                    road.destination
                });
            }
        }
    }

    if (gScore.find(destination) == gScore.end())
    {
        return {};
    }

    vector<string> route;
    string current = destination;

    while (current != source)
    {
        route.push_back(current);

        auto it = parent.find(current);

        if (it == parent.end())
        {
            return {};
        }

        current = it->second;
    }

    route.push_back(source);
    reverse(route.begin(), route.end());

    return route;
}"""

if target in content:
    content = content.replace(target, replacement, 1)
    with open('src/RouteDecisionEngine.cpp', 'w', encoding='utf-8', newline='') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("TARGET NOT FOUND")

