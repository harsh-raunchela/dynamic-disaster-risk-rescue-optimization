#ifndef DISASTERX_RISK_PREDICTION_LOADER_H
#define DISASTERX_RISK_PREDICTION_LOADER_H

#include "Graph.h"
#include <cstddef>
#include <string>

using namespace std;

class RiskPredictionLoader
{
public:
    static bool load(
        Graph& graph,
        const string& filename,
        size_t* loadedPredictionCount = nullptr,
        bool reportSuccess = true
    );
};

#endif
