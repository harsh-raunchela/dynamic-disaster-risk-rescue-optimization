#include "JsonlWorkerAdapter.h"

#include <cmath>
#include <exception>
#include <iostream>
#include <sstream>
#include <string>

namespace
{
    bool parseDouble(const std::string& text, double& value)
    {
        std::istringstream stream(text);
        stream >> value;
        stream >> std::ws;
        return stream.eof() && std::isfinite(value) && value >= 0.0;
    }

    bool readArguments(
        int argc,
        char* argv[],
        JsonlWorkerConfig& config)
    {
        for (int index = 1; index < argc; ++index)
        {
            const std::string argument = argv[index];

            if (argument == "--locations" && index + 1 < argc)
                config.locationsFile = argv[++index];
            else if (argument == "--roads" && index + 1 < argc)
                config.roadsFile = argv[++index];
            else if (argument == "--risks" && index + 1 < argc)
                config.riskPredictionsFile = argv[++index];
            else if (argument == "--restricted-road-penalty" &&
                     index + 1 < argc)
            {
                if (!parseDouble(argv[++index], config.restrictedRoadPenalty))
                    return false;
            }
            else
            {
                return false;
            }
        }

        return true;
    }
}

int main(int argc, char* argv[])
{
    JsonlWorkerConfig config;

    if (!readArguments(argc, argv, config))
    {
        std::cerr << "Usage: disaster_jsonl_worker.exe "
                  << "[--locations FILE] [--roads FILE] [--risks FILE] "
                  << "[--restricted-road-penalty NUMBER]" << std::endl;
        return 2;
    }

    JsonlWorkerAdapter adapter(config);
    std::string initializationError;

    // Existing CSV loaders report diagnostics through cout. Redirect those
    // startup messages only; stdout is reserved for JSONL protocol responses.
    std::streambuf* originalCoutBuffer =
        std::cout.rdbuf(std::cerr.rdbuf());
    const bool initialized = adapter.initialize(initializationError);
    std::cout.rdbuf(originalCoutBuffer);

    if (!initialized)
    {
        std::cerr << "Worker initialization failed: "
                  << initializationError << std::endl;
        return 1;
    }

    std::string line;

    while (std::getline(std::cin, line))
    {
        bool shutdownRequested = false;
        const std::string response = adapter.handleLine(
            line, shutdownRequested);

        std::cout << response << '\n' << std::flush;

        if (shutdownRequested)
        {
            return 0;
        }
    }

    return 0;
}
