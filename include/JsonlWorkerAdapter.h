#ifndef DISASTERX_JSONL_WORKER_ADAPTER_H
#define DISASTERX_JSONL_WORKER_ADAPTER_H

#include "Graph.h"

#include <cstddef>
#include <string>

struct JsonlWorkerConfig
{
    std::string dataDir = "data/real";
    std::string locationsFile = "data/real/locations.csv";
    std::string roadsFile = "data/real/roads.csv";
    std::string riskPredictionsFile = "data/real/risk_predictions.csv";
    double restrictedRoadPenalty = 40.0;

    void setDataDir(const std::string& dir)
    {
        dataDir = dir;
        locationsFile = dir + "/locations.csv";
        roadsFile = dir + "/roads.csv";
        riskPredictionsFile = dir + "/risk_predictions.csv";
    }
};

// Keeps JSON protocol concerns outside the graph and routing classes.
class JsonlWorkerAdapter
{
public:
    explicit JsonlWorkerAdapter(const JsonlWorkerConfig& config = {});

    bool initialize(std::string& errorMessage);
    std::string handleLine(
        const std::string& requestLine,
        bool& shutdownRequested
    );

private:
    JsonlWorkerConfig config;
    Graph graph;
    std::size_t loadedRiskPredictionCount = 0;
    bool ready = false;
};

#endif
