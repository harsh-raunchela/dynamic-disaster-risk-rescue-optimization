
#include <iostream>
#include <fstream>
#include <sstream>
#include <string>

#include "RiskPredictionLoader.h"

using namespace std;


// ==========================================
// NORMALIZE LOCATION ID
// ==========================================

static string normalizeLocationId(string id)
{
    if (id.rfind("LOC_", 0) == 0)
    {
        string number = id.substr(4);

        try
        {
            int value = stoi(number);

            string padding;

            if (value < 10)
                padding = "000";
            else if (value < 100)
                padding = "00";
            else if (value < 1000)
                padding = "0";

            return string("LOC_") + padding + to_string(value);
        }
        catch (...)
        {
            return id;
        }
    }

    return id;
}


// ==========================================
// LOAD ML RISK PREDICTIONS
// ==========================================

bool RiskPredictionLoader::load(
    Graph& graph,
    const string& filename)
{
    ifstream file(filename);

    if (!file.is_open())
    {
        cerr << "Unable to open risk prediction file: "
             << filename << endl;

        return false;
    }

    string line;

    // Skip CSV header
    getline(file, line);

    int updated = 0;
    int skipped = 0;

    while (getline(file, line))
    {
        if (line.empty())
            continue;

        stringstream ss(line);

        string roadId;
        string source;
        string destination;
        string predictedRisk;
        string confidence;

        getline(ss, roadId, ',');
        getline(ss, source, ',');
        getline(ss, destination, ',');
        getline(ss, predictedRisk, ',');
        getline(ss, confidence, ',');

        // Normalize location IDs to LOC_0001 format
        source = normalizeLocationId(source);
        destination = normalizeLocationId(destination);

        // Update the risk category in the graph
        bool found = graph.updateRoadRisk(
            source,
            destination,
            predictedRisk
        );

        if (found)
        {
            updated++;
        }
        else
        {
            skipped++;
        }
    }

    file.close();

    cout << "\nML risk predictions loaded.\n";

    cout << "Roads updated: " << updated << endl;
    cout << "Roads skipped: " << skipped << endl;

    return true;
}
