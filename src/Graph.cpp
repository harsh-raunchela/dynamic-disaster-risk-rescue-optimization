#include <iostream>
#include <fstream>
#include <sstream>
#include <iomanip>

#include "Graph.h"

using namespace std;


// ==================================================
// HELPER FUNCTION
// ==================================================
// Converts:
//
// LOC_93
//
// into:
//
// LOC_0093
//
// This makes the road dataset compatible with
// locations.csv.
// ==================================================

string normalizeLocationId(string id)
{
    if (id.substr(0, 4) != "LOC_")
    {
        return id;
    }

    string number = id.substr(4);

    while (number.length() < 4)
    {
        number = "0" + number;
    }

    return "LOC_" + number;
}


// ==================================================
// ADD LOCATION
// ==================================================

void Graph::addLocation(const Location& location)
{
    locations[location.id] = location;

    // Create an empty adjacency list
    // for this location.
    adjacencyList[location.id];
}


// ==================================================
// ADD ROAD
// ==================================================

void Graph::addRoad(
    const string& source,
    const Edge& edge
)
{
    adjacencyList[source].push_back(edge);
}


// ==================================================
// GET NEIGHBORS
// ==================================================

vector<Edge> Graph::getNeighbors(const string& locationId) const
{
    auto it = adjacencyList.find(locationId);

    if (it == adjacencyList.end())
    {
        return {};
    }

    return it->second;
}


// ==================================================
// DISPLAY GRAPH
// ==================================================

void Graph::displayGraph()
{
    for (auto& pair : adjacencyList)
    {
        string source = pair.first;

        cout << source << " -> ";

        for (const Edge& edge : pair.second)
        {
            cout << edge.destination;

            cout << " [Distance: "
                 << edge.distance
                 << ", Time: "
                 << edge.travelTime
                 << ", Risk: "
                 << edge.risk
                 << ", Traffic: "
                 << edge.traffic
                 << ", Road: "
                 << edge.roadCondition
                 << ", Status: "
                 << edge.status
                 << "] ";

        }

        cout << endl;
    }
}


// ==================================================
// BLOCK ROAD
// ==================================================

void Graph::blockRoad(
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
}


// ==================================================
// REMOVE ROAD
// ==================================================

void Graph::removeRoad(
    const string& source,
    const string& destination
)
{
    vector<Edge>& edges = adjacencyList[source];

    for (auto it = edges.begin(); it != edges.end(); ++it)
    {
        if (it->destination == destination)
        {
            edges.erase(it);
            return;
        }
    }
}


// ==================================================
// UPDATE ROAD
// ==================================================

void Graph::updateRoad(
    const string& source,
    const string& destination,
    const Edge& updatedEdge
)
{
    for (Edge& edge : adjacencyList[source])
    {
        if (edge.destination == destination)
        {
            edge = updatedEdge;
            return;
        }
    }
}


// ==================================================
// LOAD LOCATIONS FROM CSV
// ==================================================

bool Graph::loadLocations(const string& filename)
{
    ifstream file(filename);

    if (!file.is_open())
    {
        cout << "Error: Could not open "
             << filename << endl;

        return false;
    }

    string line;

    // Skip header
    getline(file, line);

    int count = 0;

    while (getline(file, line))
    {
        if (line.empty())
        {
            continue;
        }

        stringstream ss(line);

        string id;
        string name;
        string type;
        string latitude;
        string longitude;
        string capacity;

        getline(ss, id, ',');
        getline(ss, name, ',');
        getline(ss, type, ',');
        getline(ss, latitude, ',');
        getline(ss, longitude, ',');
        getline(ss, capacity, ',');

        Location location;

        location.id = normalizeLocationId(id);
        location.name = name;
        location.type = type;

        location.latitude = stod(latitude);
        location.longitude = stod(longitude);

        location.capacity = stoi(capacity);

        addLocation(location);

        count++;
    }

    file.close();

    cout << "Locations loaded: "
         << count << endl;

    return true;
}


// ==================================================
// LOAD ROADS FROM CSV
// ==================================================

bool Graph::loadRoads(const string& filename)
{
    ifstream file(filename);

    if (!file.is_open())
    {
        cout << "Error: Could not open "
             << filename << endl;

        return false;
    }

    string line;

    // Skip header
    getline(file, line);

    int count = 0;
    int invalidRoads = 0;

    while (getline(file, line))
    {
        if (line.empty())
        {
            continue;
        }

        stringstream ss(line);

        string roadId;
        string source;
        string destination;
        string distance;
        string travelTime;
        string risk;
        string traffic;
        string roadCondition;
        string status;

        getline(ss, roadId, ',');
        getline(ss, source, ',');
        getline(ss, destination, ',');
        getline(ss, distance, ',');
        getline(ss, travelTime, ',');
        getline(ss, risk, ',');
        getline(ss, traffic, ',');
        getline(ss, roadCondition, ',');
        getline(ss, status, ',');

        // Normalize road location IDs
        source = normalizeLocationId(source);
        destination = normalizeLocationId(destination);

        // Make sure both locations exist
        if (locations.find(source) == locations.end() ||
            locations.find(destination) == locations.end())
        {
            invalidRoads++;
            continue;
        }

        Edge road;

        road.destination = destination;

        road.distance = stod(distance);
        road.travelTime = stod(travelTime);

        road.risk = risk;
        road.traffic = traffic;
        road.roadCondition = roadCondition;

        road.status = status;

        addRoad(source, road);

        count++;
    }

    file.close();

    cout << "Roads loaded: "
         << count << endl;

    if (invalidRoads > 0)
    {
        cout << "Invalid roads skipped: "
             << invalidRoads << endl;
    }

    return true;
}


// ==================================================
// GET LOCATION COUNT
// ==================================================

int Graph::getLocationCount() const
{
    return locations.size();
}


// ==================================================
// GET ROAD COUNT
// ==================================================

int Graph::getRoadCount() const
{
    int count = 0;

    for (const auto& pair : adjacencyList)
    {
        count += pair.second.size();
    }

    return count;
}



bool Graph::updateRoadRisk(
    const string& source,
    const string& destination,
    const string& risk)
{
    auto it = adjacencyList.find(source);

    if (it == adjacencyList.end())
    {
        return false;
    }

    for (Edge& edge : it->second)
    {
        if (edge.destination == destination)
        {
            edge.risk = risk;

            return true;
        }
    }

    return false;
}

