with open('src/Graph.cpp', 'r', encoding='utf-8') as f:
    content = f.read()

target = """void Graph::blockRoad(
    const string& source,
    const string& destination
)
{
    for (Edge& edge : adjacencyList[source])
    {
        if (edge.destination == destination)
        {
            edge.status = "Closed";
            return;
        }
    }
}


// ==================================================
// UNBLOCK ROAD
// ==================================================

void Graph::unblockRoad(
    const string& source,
    const string& destination
)
{
    for (Edge& edge : adjacencyList[source])
    {
        if (edge.destination == destination)
        {
            edge.status = "Open";
            return;
        }
    }
}"""

replacement = """void Graph::blockRoad(
    const string& source,
    const string& destination
)
{
    auto it = adjacencyList.find(source);

    if (it == adjacencyList.end())
    {
        return;
    }

    for (Edge& edge : it->second)
    {
        if (edge.destination == destination)
        {
            edge.status = "Closed";
        }
    }
}


// ==================================================
// UNBLOCK ROAD
// ==================================================

void Graph::unblockRoad(
    const string& source,
    const string& destination
)
{
    auto it = adjacencyList.find(source);

    if (it == adjacencyList.end())
    {
        return;
    }

    for (Edge& edge : it->second)
    {
        if (edge.destination == destination)
        {
            edge.status = "Open";
        }
    }
}"""

if target in content:
    content = content.replace(target, replacement, 1)
    with open('src/Graph.cpp', 'w', encoding='utf-8', newline='') as f:
        f.write(content)
    print('SUCCESS')
else:
    print('TARGET NOT FOUND')

