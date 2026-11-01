#ifndef DISASTERX_JSONL_WORKER_ADAPTER_H
#define DISASTERX_JSONL_WORKER_ADAPTER_H

#include "Graph.h"

#include <cstddef>
#include <string>

struct JsonlWorkerConfig
{
    std::string locationsFile = "data/locations.csv";
    std::string roadsFile = "data/roads.csv";
    std::string riskPredictionsFile = "data/risk_predictions.csv";
    double restrictedRoadPenalty = 40.0;
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
