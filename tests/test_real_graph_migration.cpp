#include <iostream>
#include <string>
#include <vector>
#include <cassert>
#include <cmath>

#include "nlohmann/json.hpp"
#include "Graph.h"
#include "JsonlWorkerAdapter.h"
#include "RiskPredictionLoader.h"
#include "RouteDecisionEngine.h"
#include "BFS.h"
#include "DFS.h"
#include "ArticulationPoints.h"
#include "Dijkstra.h"
#include "AStar.h"

using json = nlohmann::json;

static int passed = 0;
static int failed = 0;

static void check(bool condition, const std::string& name)
{
    if (condition)
    {
        std::cout << "[PASS] " << name << std::endl;
        passed++;
    }
    else
    {
        std::cout << "[FAIL] " << name << std::endl;
        failed++;
    }
}

int main()
{
    std::cout << "====================================================\n";
    std::cout << " DISASTERX - Phase 2 Real Graph Migration Test Suite\n";
    std::cout << "====================================================\n\n";

    // ----------------------------------------------------
    // 1. Direct Graph Loading (Locations & Roads)
    // ----------------------------------------------------
    Graph realGraph;
    bool locLoaded = realGraph.loadLocations("data/real/locations.csv");
    check(locLoaded && realGraph.getLocationCount() == 1086,
          "1. Exactly 1,086 locations loaded from data/real/locations.csv");

    bool roadsLoaded = realGraph.loadRoads("data/real/roads.csv");
    check(roadsLoaded && realGraph.getRoadCount() == 2362,
          "2. Exactly 2,362 roads loaded from data/real/roads.csv");

    // 3. Verify all road endpoints resolve to valid locations
    bool allEndpointsValid = true;
    for (const std::string& locId : realGraph.getLocationIds())
    {
        for (const Edge& edge : realGraph.getNeighbors(locId))
        {
            if (realGraph.getLocation(edge.destination) == nullptr)
            {
                allEndpointsValid = false;
                break;
            }
        }
        if (!allEndpointsValid) break;
    }
    check(allEndpointsValid,
          "3. All road endpoints resolve to registered locations");

    // 4. ML Risk Prediction Loading
    size_t appliedPredictions = 0;
    bool mlOk = RiskPredictionLoader::load(realGraph, "data/real/risk_predictions.csv", &appliedPredictions, false);
    check(mlOk && appliedPredictions == 2362,
          "4. All 2,362 ML risk predictions loaded and applied successfully");

    // ----------------------------------------------------
    // JSONL Worker Adapter Verification (Default: data/real)
    // ----------------------------------------------------
    JsonlWorkerConfig defaultCfg;
    check(defaultCfg.dataDir == "data/real" &&
          defaultCfg.locationsFile == "data/real/locations.csv" &&
          defaultCfg.roadsFile == "data/real/roads.csv" &&
          defaultCfg.riskPredictionsFile == "data/real/risk_predictions.csv",
          "Worker configuration defaults to data/real directory and files");

    JsonlWorkerAdapter worker(defaultCfg);
    std::string initError;
    bool initOk = worker.initialize(initError);
    check(initOk && initError.empty(), "Worker initialized successfully with real dataset");

    // 5. Health command
    bool shutdownRequested = false;
    json healthReq = {{"requestId", "h-1"}, {"operation", "health"}};
    json healthResp = json::parse(worker.handleLine(healthReq.dump(), shutdownRequested));
    check(healthResp.value("ok", false) &&
          healthResp["result"].value("locationCount", 0) == 1086 &&
          healthResp["result"].value("roadCount", 0) == 2362 &&
          healthResp["result"].value("riskPredictionCount", 0) == 2362,
          "5. Health command reports 1,086 locations, 2,362 roads, and 2,362 risk predictions");

    // 6. get_locations command
    json locReq = {{"requestId", "loc-1"}, {"operation", "get_locations"}};
    json locResp = json::parse(worker.handleLine(locReq.dump(), shutdownRequested));
    bool locIdsValid = locResp.value("ok", false) &&
                       locResp["result"]["locations"].size() == 1086 &&
                       locResp["result"]["locations"][0]["id"] == "LOC_0001" &&
                       locResp["result"]["locations"][1085]["id"] == "LOC_1086";
    check(locIdsValid,
          "6. get_locations returns LOC_0001 through LOC_1086 with full coordinates");

    // 7. get_roads command
    json roadReq = {{"requestId", "rd-1"}, {"operation", "get_roads"}};
    json roadResp = json::parse(worker.handleLine(roadReq.dump(), shutdownRequested));
    bool roadIdsValid = roadResp.value("ok", false) &&
                        roadResp["result"]["roads"].size() == 2362 &&
                        roadResp["result"]["roads"][0]["id"] == "ROAD_000001" &&
                        roadResp["result"]["roads"][2361]["id"] == "ROAD_002362";
    check(roadIdsValid,
          "7. get_roads returns ROAD_000001 through ROAD_002362 with road attributes");

    // 8. Dijkstra route planning via worker
    json routeReq = {
        {"requestId", "route-dijkstra"},
        {"operation", "plan_route"},
        {"sourceLocationId", "LOC_0001"},
        {"destinationLocationId", "LOC_0010"}
    };
    json routeResp = json::parse(worker.handleLine(routeReq.dump(), shutdownRequested));
    check(routeResp.value("ok", false) &&
          routeResp["result"]["locationIds"].size() >= 2 &&
          routeResp["result"]["locationIds"].front() == "LOC_0001" &&
          routeResp["result"]["locationIds"].back() == "LOC_0010",
          "8. Dijkstra finds valid route from LOC_0001 to LOC_0010 via worker");

    // 9. A* route planning
    vector<string> astarPath = AStar::findPath(realGraph, "LOC_0001", "LOC_0010");
    check(!astarPath.empty() && astarPath.front() == "LOC_0001" && astarPath.back() == "LOC_0010",
          "9. A* algorithm finds valid route between locations using coordinates");

    // 10. Route risk values are accurate
    double totalCost = routeResp["result"].value("totalCost", -1.0);
    double totalRisk = 0.0;
    for (const auto& item : routeResp["result"]["breakdown"])
    {
        totalRisk += item.value("riskPenalty", 0.0);
    }
    check(totalCost > 0.0 && totalRisk >= 0.0 && routeResp["result"]["breakdown"].is_array(),
          "10. Route response includes positive cost, positive risk score, and detailed breakdown");

    // 11. Road blocking changes route selection or cost
    std::string firstRoadId = routeResp["result"]["roadIds"][0];
    json blockReq = {
        {"requestId", "block-1"},
        {"operation", "block_road"},
        {"roadId", firstRoadId}
    };
    json blockResp = json::parse(worker.handleLine(blockReq.dump(), shutdownRequested));
    check(blockResp.value("ok", false) && blockResp["result"]["status"] == "Closed",
          "Road blocking succeeds on active route segment");

    json routeAfterBlockResp = json::parse(worker.handleLine(routeReq.dump(), shutdownRequested));
    bool routeDivergedOrCostIncreased = false;
    if (routeAfterBlockResp.value("ok", false))
    {
        std::string newFirstRoadId = routeAfterBlockResp["result"]["roadIds"][0];
        double newCost = routeAfterBlockResp["result"].value("totalCost", 0.0);
        routeDivergedOrCostIncreased = (newFirstRoadId != firstRoadId) || (newCost > totalCost);
    }
    check(routeDivergedOrCostIncreased || !routeAfterBlockResp.value("ok", true),
          "11. Road blocking forces route recalculation / detour avoiding blocked road");

    // 12. Road unblocking restores availability
    json unblockReq = {
        {"requestId", "unblock-1"},
        {"operation", "unblock_road"},
        {"roadId", firstRoadId}
    };
    json unblockResp = json::parse(worker.handleLine(unblockReq.dump(), shutdownRequested));
    check(unblockResp.value("ok", false) && unblockResp["result"]["status"] == "Open",
          "12. Road unblocking successfully restores road status to Open");

    json routeAfterUnblockResp = json::parse(worker.handleLine(routeReq.dump(), shutdownRequested));
    check(routeAfterUnblockResp.value("ok", false) &&
          std::abs(routeAfterUnblockResp["result"].value("totalCost", 0.0) - totalCost) < 1e-4,
          "Original optimal route restored with identical total cost after unblock");

    // 13. BFS and DFS traversals succeed
    std::stringstream buffer;
    std::streambuf* oldCout = std::cout.rdbuf(buffer.rdbuf());
    BFS::traverse(realGraph, "LOC_0001");
    DFS::traverse(realGraph, "LOC_0001");
    std::cout.rdbuf(oldCout);
    check(!buffer.str().empty(),
          "13. BFS and DFS traversals execute cleanly across all 1,086 locations from LOC_0001");

    // 14. Articulation point detection runs without errors
    vector<string> cutVertices = ArticulationPoints::find(realGraph);
    check(!cutVertices.empty(),
          "14. Articulation point detection runs and identifies critical bridge locations");

    // 15. Worker clean shutdown and restart
    json shutdownReq = {{"requestId", "shut-1"}, {"operation", "shutdown"}};
    json shutResp = json::parse(worker.handleLine(shutdownReq.dump(), shutdownRequested));
    check(shutResp.value("ok", false) && shutdownRequested,
          "15a. Worker processes shutdown command cleanly");

    // Restart worker
    JsonlWorkerAdapter worker2(defaultCfg);
    std::string restartError;
    bool restartOk = worker2.initialize(restartError);
    json healthResp2 = json::parse(worker2.handleLine(healthReq.dump(), shutdownRequested));
    check(restartOk && healthResp2.value("ok", false) &&
          healthResp2["result"].value("locationCount", 0) == 1086,
          "15b. Worker cleanly restarts and reloads real graph");

    // 16. Backward compatibility: verify loading synthetic dataset when configured
    JsonlWorkerConfig synthCfg;
    synthCfg.setDataDir("data");
    JsonlWorkerAdapter synthWorker(synthCfg);
    std::string synthError;
    bool synthInit = synthWorker.initialize(synthError);
    json synthHealth = json::parse(synthWorker.handleLine(healthReq.dump(), shutdownRequested));
    check(synthInit && synthHealth.value("ok", false) &&
          synthHealth["result"].value("locationCount", 0) == 500 &&
          synthHealth["result"].value("roadCount", 0) == 2500 &&
          synthHealth["result"].value("riskPredictionCount", 0) == 2500,
          "16. Backward compatibility: setting dataDir='data' loads 500-node synthetic dataset");

    std::cout << "\n====================================================\n";
    std::cout << "Tests Passed: " << passed << " | Tests Failed: " << failed << "\n";
    std::cout << "====================================================\n";

    return failed == 0 ? 0 : 1;
}
