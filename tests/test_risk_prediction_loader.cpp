#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <cstdio>

#include "Graph.h"
#include "RiskPredictionLoader.h"

using namespace std;

int passed = 0;
int failed = 0;

void check(bool condition, const string& name)
{
    if (condition)
    {
        cout << "[PASS] " << name << endl;
        passed++;
    }
    else
    {
        cout << "[FAIL] " << name << endl;
        failed++;
    }
}

Location makeLocation(const string& id)
{
    Location location{};
    location.id = id;
    location.name = id;
    location.type = "Test";
    return location;
}

Edge makeRoad(const string& destination, const string& roadId,
              const string& risk)
{
    Edge road{};
    road.id = roadId;
    road.destination = destination;
    road.distance = 10;
    road.travelTime = 10;
    road.risk = risk;
    road.traffic = "Low";
    road.roadCondition = "Good";
    road.status = "Open";
    return road;
}

Graph makeGraph()
{
    Graph graph;

    graph.addLocation(makeLocation("A"));
    graph.addLocation(makeLocation("B"));
    graph.addLocation(makeLocation("C"));

    graph.addRoad("A", makeRoad("B", "ROAD_0001", "Low"));
    graph.addRoad("B", makeRoad("C", "ROAD_0002", "Medium"));

    return graph;
}

void writeFile(const string& filename, const string& contents)
{
    ofstream file(filename);
    file << contents;
}

string header()
{
    return "id,source,destination,predicted_risk,prediction_confidence\n";
}

bool riskIs(Graph& graph, const string& source,
            const string& destination, const string& expected)
{
    for (const Edge& edge : graph.getNeighbors(source))
    {
        if (edge.destination == destination && edge.risk == expected)
            return true;
    }
    return false;
}

int main()
{
    const string testFile = "temp_loader_test.csv";

    cout << "=== RISK PREDICTION LOADER FAILURE TESTS ===\n";

    // TEST 1: Missing file must fail without changing graph.
    {
        Graph graph = makeGraph();

        bool result = RiskPredictionLoader::load(
            graph, "file_that_does_not_exist_loader_test.csv");

        check(!result, "Missing file is rejected");
        check(riskIs(graph, "A", "B", "Low"),
              "Missing file leaves graph unchanged");
    }

    // TEST 2: Invalid header.
    {
        Graph graph = makeGraph();

        writeFile(testFile,
            "road_id,source,destination,risk,confidence\n"
            "ROAD_0001,A,B,High,0.9\n");

        bool result = RiskPredictionLoader::load(graph, testFile);

        check(!result, "Invalid header is rejected");
        check(riskIs(graph, "A", "B", "Low"),
              "Invalid header leaves graph unchanged");
    }

    // TEST 3: Malformed row with too few columns.
    {
        Graph graph = makeGraph();

        writeFile(testFile,
            header() +
            "ROAD_0001,A,B,High\n");

        bool result = RiskPredictionLoader::load(graph, testFile);

        check(!result, "Malformed row is rejected");
        check(riskIs(graph, "A", "B", "Low"),
              "Malformed row leaves graph unchanged");
    }

    // TEST 4: Invalid confidence.
    {
        Graph graph = makeGraph();

        writeFile(testFile,
            header() +
            "ROAD_0001,A,B,High,not_a_number\n");

        bool result = RiskPredictionLoader::load(graph, testFile);

        check(!result, "Invalid confidence is rejected");
        check(riskIs(graph, "A", "B", "Low"),
              "Invalid confidence leaves graph unchanged");
    }

    // TEST 5: Confidence outside [0, 1].
    {
        Graph graph = makeGraph();

        writeFile(testFile,
            header() +
            "ROAD_0001,A,B,High,1.5\n");

        bool result = RiskPredictionLoader::load(graph, testFile);

        check(!result, "Out-of-range confidence is rejected");
        check(riskIs(graph, "A", "B", "Low"),
              "Out-of-range confidence leaves graph unchanged");
    }

    // TEST 6: Invalid risk category.
    {
        Graph graph = makeGraph();

        writeFile(testFile,
            header() +
            "ROAD_0001,A,B,Extreme,0.9\n");

        bool result = RiskPredictionLoader::load(graph, testFile);

        check(!result, "Invalid risk category is rejected");
        check(riskIs(graph, "A", "B", "Low"),
              "Invalid risk category leaves graph unchanged");
    }

    // TEST 7: Unknown road ID.
    {
        Graph graph = makeGraph();

        writeFile(testFile,
            header() +
            "ROAD_UNKNOWN,A,B,High,0.9\n");

        bool result = RiskPredictionLoader::load(graph, testFile);

        check(!result, "Unknown road ID is rejected");
        check(riskIs(graph, "A", "B", "Low"),
              "Unknown road ID leaves graph unchanged");
    }

    // TEST 8: Duplicate road ID.
    {
        Graph graph = makeGraph();

        writeFile(testFile,
            header() +
            "ROAD_0001,A,B,High,0.9\n"
            "ROAD_0001,A,B,Critical,0.8\n");

        bool result = RiskPredictionLoader::load(graph, testFile);

        check(!result, "Duplicate road ID is rejected");
        check(riskIs(graph, "A", "B", "Low"),
              "Duplicate ID leaves graph unchanged");
    }

    // TEST 9: Transactional behavior: invalid second row.
    {
        Graph graph = makeGraph();

        writeFile(testFile,
            header() +
            "ROAD_0001,A,B,High,0.9\n"
            "ROAD_UNKNOWN,A,B,Critical,0.8\n");

        bool result = RiskPredictionLoader::load(graph, testFile);

        check(!result, "Mixed valid/invalid file is rejected");
        check(riskIs(graph, "A", "B", "Low"),
              "Valid first row was not partially applied");
    }

    // TEST 10: Fully valid file.
    {
        Graph graph = makeGraph();

        writeFile(testFile,
            header() +
            "ROAD_0001,A,B,High,0.9\n"
            "ROAD_0002,B,C,Critical,0.8\n");

        bool result = RiskPredictionLoader::load(graph, testFile);

        check(result, "Valid file is accepted");
        check(riskIs(graph, "A", "B", "High"),
              "First valid prediction is applied");
        check(riskIs(graph, "B", "C", "Critical"),
              "Second valid prediction is applied");
    }

    remove(testFile.c_str());

    cout << "\n========== TEST SUMMARY ==========\n";
    cout << "Passed: " << passed << endl;
    cout << "Failed: " << failed << endl;

    if (failed > 0)
    {
        cout << "RESULT: FAIL\n";
        return 1;
    }

    cout << "RESULT: ALL TESTS PASSED\n";
    return 0;
}

