#include "JsonlWorkerAdapter.h"
#include "nlohmann/json.hpp"

#include <iostream>
#include <string>

using json = nlohmann::json;

namespace
{
    int passed = 0;
    int failed = 0;

    void check(bool condition, const std::string& name)
    {
        if (condition)
        {
            std::cout << "[PASS] " << name << '\n';
            ++passed;
        }
        else
        {
            std::cout << "[FAIL] " << name << '\n';
            ++failed;
        }
    }

    json call(
        JsonlWorkerAdapter& adapter,
        const json& request,
        bool& shutdownRequested)
    {
        return json::parse(adapter.handleLine(
            request.dump(), shutdownRequested));
    }
}

int main()
{
    std::cout << "=== JSONL WORKER ADAPTER TESTS ===\n";

    JsonlWorkerAdapter adapter;
    std::string initializationError;
    check(adapter.initialize(initializationError),
          "Worker adapter initializes from repository datasets");

    if (failed > 0)
    {
        std::cout << "Initialization error: " << initializationError << '\n';
        return 1;
    }

    bool shutdownRequested = false;
    json response = call(adapter, {
        {"requestId", "health-1"},
        {"operation", "health"}
    }, shutdownRequested);

    check(response.value("ok", false) &&
          response["result"].value("ready", false) &&
          response["result"].value("locationCount", 0) == 500 &&
          response["result"].value("roadCount", 0) == 2500 &&
          response["result"].value("riskPredictionCount", 0) == 2500,
          "Health response reports loaded graph and prediction counts");

    response = call(adapter, {
        {"requestId", "locations-1"},
        {"operation", "get_locations"}
    }, shutdownRequested);

    check(response.value("ok", false) &&
          response["result"]["locations"].is_array() &&
          response["result"]["locations"].size() == 500 &&
          response["result"]["locations"][0].contains("latitude"),
          "Location snapshot returns all mapped location fields");

    response = call(adapter, {
        {"requestId", "roads-1"},
        {"operation", "get_roads"}
    }, shutdownRequested);

    check(response.value("ok", false) &&
          response["result"]["roads"].is_array() &&
          response["result"]["roads"].size() == 2500 &&
          response["result"]["roads"][0].contains("roadCondition"),
          "Road snapshot returns all mapped road fields");

    response = call(adapter, {
        {"requestId", "route-1"},
        {"operation", "plan_route"},
        {"sourceLocationId", "LOC_0001"},
        {"destinationLocationId", "LOC_0010"}
    }, shutdownRequested);

    check(response.value("ok", false) &&
          response["result"]["locationIds"].is_array() &&
          response["result"]["locationIds"].size() >= 2 &&
          response["result"]["roadIds"].size() + 1 ==
              response["result"]["locationIds"].size() &&
          response["result"]["breakdown"].is_array(),
          "Route planning returns locations, exact road IDs and cost details");

    response = call(adapter, {
        {"requestId", "invalid-location"},
        {"operation", "plan_route"},
        {"sourceLocationId", "LOC_UNKNOWN"},
        {"destinationLocationId", "LOC_0010"}
    }, shutdownRequested);

    check(!response.value("ok", true) &&
          response["error"].value("code", "") == "INVALID_LOCATION_ID",
          "Invalid location IDs return a structured error");

    response = call(adapter, {
        {"requestId", "invalid-road"},
        {"operation", "block_road"},
        {"roadId", "ROAD_UNKNOWN"}
    }, shutdownRequested);

    check(!response.value("ok", true) &&
          response["error"].value("code", "") == "INVALID_ROAD_ID",
          "Invalid road IDs return a structured error");

    json roadsResponse = call(adapter, {
        {"requestId", "roads-for-parallel"},
        {"operation", "get_roads"}
    }, shutdownRequested);
    const json& roads = roadsResponse["result"]["roads"];
    int selectedIndex = -1;
    int siblingIndex = -1;

    for (size_t i = 0; i < roads.size() && selectedIndex < 0; ++i)
    {
        if (roads[i]["status"] == "Closed")
            continue;

        for (size_t j = i + 1; j < roads.size(); ++j)
        {
            if (roads[i]["source"] == roads[j]["source"] &&
                roads[i]["destination"] == roads[j]["destination"] &&
                roads[j]["status"] != "Closed")
            {
                selectedIndex = static_cast<int>(i);
                siblingIndex = static_cast<int>(j);
                break;
            }
        }
    }

    check(selectedIndex >= 0,
          "Dataset contains a usable parallel-road pair for ID mutation");

    if (selectedIndex >= 0)
    {
        const std::string selectedRoadId = roads[selectedIndex]["id"];
        const std::string siblingRoadId = roads[siblingIndex]["id"];
        const std::string siblingInitialStatus = roads[siblingIndex]["status"];

        response = call(adapter, {
            {"requestId", "block-one"},
            {"operation", "block_road"},
            {"roadId", selectedRoadId}
        }, shutdownRequested);

        json afterBlock = call(adapter, {
            {"requestId", "roads-after-block"},
            {"operation", "get_roads"}
        }, shutdownRequested);

        std::string selectedStatus;
        std::string siblingStatus;
        for (const json& road : afterBlock["result"]["roads"])
        {
            if (road["id"] == selectedRoadId)
                selectedStatus = road["status"];
            if (road["id"] == siblingRoadId)
                siblingStatus = road["status"];
        }

        check(response.value("ok", false) && selectedStatus == "Closed" &&
              siblingStatus == siblingInitialStatus,
              "Blocking one road ID leaves its parallel sibling unchanged");

        response = call(adapter, {
            {"requestId", "unblock-one"},
            {"operation", "unblock_road"},
            {"roadId", selectedRoadId}
        }, shutdownRequested);

        json afterUnblock = call(adapter, {
            {"requestId", "roads-after-unblock"},
            {"operation", "get_roads"}
        }, shutdownRequested);

        selectedStatus.clear();
        siblingStatus.clear();
        for (const json& road : afterUnblock["result"]["roads"])
        {
            if (road["id"] == selectedRoadId)
                selectedStatus = road["status"];
            if (road["id"] == siblingRoadId)
                siblingStatus = road["status"];
        }

        check(response.value("ok", false) && selectedStatus == "Open" &&
              siblingStatus == siblingInitialStatus,
              "Unblocking restores only the requested road and state persists");
    }

    response = json::parse(adapter.handleLine("{not json", shutdownRequested));
    check(!response.value("ok", true) &&
          response["error"].value("code", "") == "MALFORMED_JSON",
          "Malformed JSON returns one safe structured error");

    response = call(adapter, {
        {"requestId", "shutdown-1"},
        {"operation", "shutdown"}
    }, shutdownRequested);

    check(response.value("ok", false) && shutdownRequested &&
          response["result"].value("shuttingDown", false),
          "Shutdown returns a response and requests a clean worker exit");

    std::cout << "\nPassed: " << passed << "\nFailed: " << failed << '\n';
    return failed == 0 ? 0 : 1;
}
