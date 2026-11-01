#include "RiskPredictionLoader.h"

#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <cmath>
#include <algorithm>
#include <cctype>

using namespace std;

namespace
{
    struct RiskPrediction
    {
        string roadId;
        string risk;
        double confidence;
    };

    string trim(const string& value)
    {
        const string whitespace = " \t\r\n";

        size_t start = value.find_first_not_of(whitespace);

        if (start == string::npos)
            return "";

        size_t end = value.find_last_not_of(whitespace);

        return value.substr(start, end - start + 1);
    }

    vector<string> splitCsvLine(const string& line)
    {
        // This dataset uses simple comma-separated fields without
        // quoted commas. Reject unsupported quoting rather than
        // silently parsing such rows incorrectly.
        vector<string> fields;
        string field;
        stringstream stream(line);

        while (getline(stream, field, ','))
            fields.push_back(trim(field));

        // Preserve an empty final field, if present.
        if (!line.empty() && line.back() == ',')
            fields.push_back("");

        return fields;
    }

    bool isValidRisk(const string& risk)
    {
        return risk == "Low" ||
               risk == "Medium" ||
               risk == "High" ||
               risk == "Critical";
    }

    bool parseConfidence(const string& text, double& confidence)
    {
        if (text.empty())
            return false;

        try
        {
            size_t parsed = 0;
            confidence = stod(text, &parsed);

            return parsed == text.size() &&
                   isfinite(confidence) &&
                   confidence >= 0.0 &&
                   confidence <= 1.0;
        }
        catch (...)
        {
            return false;
        }
    }

    bool isBlankLine(const string& line)
    {
        return trim(line).empty();
    }
}

bool RiskPredictionLoader::load(
    Graph& graph,
    const string& filename,
    size_t* loadedPredictionCount,
    bool reportSuccess)
{
    ifstream file(filename);

    if (!file.is_open())
    {
        cerr << "ERROR: Unable to open risk prediction file: "
             << filename << endl;
        return false;
    }

    string line;

    if (!getline(file, line))
    {
        cerr << "ERROR: Risk prediction file is empty." << endl;
        return false;
    }

    vector<string> header = splitCsvLine(line);

    const vector<string> expectedHeader = {
        "id",
        "source",
        "destination",
        "predicted_risk",
        "prediction_confidence"
    };

    if (header != expectedHeader)
    {
        cerr << "ERROR: Invalid risk prediction CSV header." << endl;
        return false;
    }

    // Build a set of road IDs from the already-loaded graph.
    unordered_set<string> knownRoadIds;

    for (const string& locationId : graph.getLocationIds())
    {
        for (const Edge& edge : graph.getNeighbors(locationId))
        {
            if (!edge.id.empty())
                knownRoadIds.insert(edge.id);
        }
    }

    vector<RiskPrediction> predictions;
    unordered_set<string> seenRoadIds;

    size_t lineNumber = 1;
    size_t blankLines = 0;

    while (getline(file, line))
    {
        ++lineNumber;

        if (isBlankLine(line))
        {
            ++blankLines;
            continue;
        }

        vector<string> fields = splitCsvLine(line);

        if (fields.size() != 5)
        {
            cerr << "ERROR: Malformed CSV row at line "
                 << lineNumber << ". Expected 5 columns." << endl;
            return false;
        }

        string roadId = fields[0];
        string source = fields[1];
        string destination = fields[2];
        string risk = fields[3];
        double confidence = 0.0;

        if (roadId.empty() ||
            source.empty() ||
            destination.empty())
        {
            cerr << "ERROR: Missing road ID or endpoint at line "
                 << lineNumber << "." << endl;
            return false;
        }

        if (!isValidRisk(risk))
        {
            cerr << "ERROR: Invalid risk category at line "
                 << lineNumber << ": " << risk << endl;
            return false;
        }

        if (!parseConfidence(fields[4], confidence))
        {
            cerr << "ERROR: Invalid prediction confidence at line "
                 << lineNumber << "." << endl;
            return false;
        }

        if (!seenRoadIds.insert(roadId).second)
        {
            cerr << "ERROR: Duplicate road ID at line "
                 << lineNumber << ": " << roadId << endl;
            return false;
        }

        if (knownRoadIds.find(roadId) == knownRoadIds.end())
        {
            cerr << "ERROR: Unknown road ID at line "
                 << lineNumber << ": " << roadId << endl;
            return false;
        }

        predictions.push_back({
            roadId,
            risk,
            confidence
        });
    }

    if (file.bad())
    {
        cerr << "ERROR: Failed while reading prediction file." << endl;
        return false;
    }

    if (predictions.empty())
    {
        cerr << "ERROR: No prediction records found." << endl;
        return false;
    }

    // All rows have now been validated. Only now modify the graph.
    // This avoids partial updates caused by malformed input.
    for (const RiskPrediction& prediction : predictions)
    {
        bool updated = graph.updateRoadRiskById(
            prediction.roadId,
            prediction.risk
        );

        // The graph could only fail here if its contents changed
        // between validation and application.
        if (!updated)
        {
            cerr << "ERROR: Failed to apply prediction for road "
                 << prediction.roadId << "." << endl;
            return false;
        }
    }

    if (loadedPredictionCount != nullptr)
    {
        *loadedPredictionCount = predictions.size();
    }

    if (reportSuccess)
    {
        cout << "\nML risk predictions loaded successfully.\n";
        cout << "Roads updated: " << predictions.size() << endl;
        cout << "Roads skipped: 0" << endl;

        if (blankLines > 0)
            cout << "Blank lines ignored: " << blankLines << endl;
    }

    return true;
}
