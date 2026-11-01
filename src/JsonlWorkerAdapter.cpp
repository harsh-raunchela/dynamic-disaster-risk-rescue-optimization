#include "JsonlWorkerAdapter.h"

#include "RiskPredictionLoader.h"
#include "RouteDecisionEngine.h"
#include "nlohmann/json.hpp"

#include <algorithm>
#include <exception>
#include <utility>
#include <vector>

using json = nlohmann::json;

namespace
{
    json makeError(
        const json& requestId,
        const std::string& code,
        const std::string& message)
    {
        return {
            {"requestId", requestId},
            {"ok", false},
            {"error", {
                {"code", code},
                {"message", message}
            }}
        };
    }

    json makeSuccess(const json& requestId, const json& result)
    {
        return {
            {"requestId", requestId},
            {"ok", true},
            {"result", result}
        };
    }

    bool getRequiredString(
        const json& request,
        const char* field,
        std::string& value,
        json& error)
    {
        if (!request.contains(field) || !request.at(field).is_string())
        {
            error = makeError(
                request.value("requestId", json(nullptr)),
                "INVALID_REQUEST",
                std::string("Field '") + field + "' must be a string.");
            return false;
        }

        value = request.at(field).get<std::string>();

        if (value.empty())
        {
            error = makeError(
                request.value("requestId", json(nullptr)),
                "INVALID_REQUEST",
                std::string("Field '") + field + "' must not be empty.");
            return false;
        }

        return true;
    }

    json locationToJson(const Location& location)
    {
        return {
            {"id", location.id},
            {"name", location.name},
            {"type", location.type},
            {"latitude", location.latitude},
            {"longitude", location.longitude},
            {"capacity", location.capacity}
        };
    }

    json roadToJson(const std::string& source, const Edge& road)
    {
        return {
            {"id", road.id},
            {"source", source},
            {"destination", road.destination},
            {"distance", road.distance},
            {"travelTime", road.travelTime},
            {"risk", road.risk},
            {"traffic", road.traffic},
            {"roadCondition", road.roadCondition},
            {"status", road.status}
        };
    }
}

JsonlWorkerAdapter::JsonlWorkerAdapter(const JsonlWorkerConfig& config)
    : config(config)
{
}

bool JsonlWorkerAdapter::initialize(std::string& errorMessage)
{
    ready = false;
    loadedRiskPredictionCount = 0;
    RouteDecisionEngine::setRestrictedRoadPenalty(
        config.restrictedRoadPenalty);

    if (!graph.loadLocations(config.locationsFile))
    {
        errorMessage = "Unable to load locations CSV.";
        return false;
    }

    if (!graph.loadRoads(config.roadsFile))
    {
        errorMessage = "Unable to load roads CSV.";
        return false;
    }

    if (!RiskPredictionLoader::load(
            graph,
            config.riskPredictionsFile,
            &loadedRiskPredictionCount,
            false))
    {
        errorMessage = "Unable to load risk predictions CSV.";
        return false;
    }

    ready = true;
    return true;
}

std::string JsonlWorkerAdapter::handleLine(
    const std::string& requestLine,
    bool& shutdownRequested)
{
    shutdownRequested = false;
    json request = json::parse(requestLine, nullptr, false);

    if (request.is_discarded())
    {
        return makeError(
            nullptr,
            "MALFORMED_JSON",
            "Request must be one valid JSON object per line.").dump();
    }

    if (!request.is_object())
    {
        return makeError(
            nullptr,
            "INVALID_REQUEST",
            "Request must be a JSON object.").dump();
    }

    const json requestId = request.value("requestId", json(nullptr));

    try
    {
        if (!ready)
        {
            return makeError(
                requestId,
                "NOT_READY",
                "Worker initialization did not complete.").dump();
        }

        std::string operation;
        json validationError;

        if (!getRequiredString(request, "operation", operation,
                               validationError))
        {
            return validationError.dump();
        }

        if (operation == "health")
        {
            return makeSuccess(requestId, {
                {"ready", true},
                {"locationCount", graph.getLocationCount()},
                {"roadCount", graph.getRoadCount()},
                {"riskPredictionCount", loadedRiskPredictionCount},
                {"restrictedRoadPenalty",
                    RouteDecisionEngine::getRestrictedRoadPenalty()}
            }).dump();
        }

        if (operation == "get_locations")
        {
            std::vector<std::string> ids = graph.getLocationIds();
            std::sort(ids.begin(), ids.end());
            json locations = json::array();

            for (const std::string& id : ids)
            {
                const Location* location = graph.getLocation(id);
                if (location != nullptr)
                {
                    locations.push_back(locationToJson(*location));
                }
            }

            return makeSuccess(requestId, {{"locations", locations}}).dump();
        }

        if (operation == "get_roads")
        {
            std::vector<std::string> sources = graph.getLocationIds();
            std::sort(sources.begin(), sources.end());
            json roads = json::array();

            for (const std::string& source : sources)
            {
                for (const Edge& road : graph.getNeighbors(source))
                {
                    roads.push_back(roadToJson(source, road));
                }
            }

            return makeSuccess(requestId, {{"roads", roads}}).dump();
        }

        if (operation == "plan_route")
        {
            std::string source;
            std::string destination;

            if (!getRequiredString(request, "sourceLocationId", source,
                                   validationError) ||
                !getRequiredString(request, "destinationLocationId",
                                   destination, validationError))
            {
                return validationError.dump();
            }

            if (graph.getLocation(source) == nullptr ||
                graph.getLocation(destination) == nullptr)
            {
                return makeError(
                    requestId,
                    "INVALID_LOCATION_ID",
                    "Source and destination must be existing location IDs.").dump();
            }

            std::vector<std::string> route =
                RouteDecisionEngine::findBestRoute(
                    graph, source, destination);

            if (route.empty())
            {
                return makeError(
                    requestId,
                    "NO_ROUTE",
                    "No usable route exists between the requested locations.").dump();
            }

            std::vector<RouteSegmentCost> segments;
            double totalCost = 0.0;

            if (!RouteDecisionEngine::getRouteCostBreakdown(
                    graph, route, segments, totalCost))
            {
                return makeError(
                    requestId,
                    "ROUTE_DETAILS_UNAVAILABLE",
                    "The planned route could not be converted to cost details.").dump();
            }

            json roadIds = json::array();
            json breakdown = json::array();

            for (const RouteSegmentCost& segment : segments)
            {
                roadIds.push_back(segment.roadId);
                breakdown.push_back({
                    {"roadId", segment.roadId},
                    {"source", segment.source},
                    {"destination", segment.destination},
                    {"travelTime", segment.travelTime},
                    {"riskPenalty", segment.riskPenalty},
                    {"trafficPenalty", segment.trafficPenalty},
                    {"roadConditionPenalty", segment.roadConditionPenalty},
                    {"statusPenalty", segment.statusPenalty},
                    {"totalCost", segment.totalCost}
                });
            }

            return makeSuccess(requestId, {
                {"sourceLocationId", source},
                {"destinationLocationId", destination},
                {"locationIds", route},
                {"roadIds", roadIds},
                {"totalCost", totalCost},
                {"breakdown", breakdown}
            }).dump();
        }

        if (operation == "block_road" || operation == "unblock_road")
        {
            std::string roadId;
            if (!getRequiredString(request, "roadId", roadId,
                                   validationError))
            {
                return validationError.dump();
            }

            bool changed = operation == "block_road"
                ? graph.blockRoadById(roadId)
                : graph.unblockRoadById(roadId);

            if (!changed)
            {
                return makeError(
                    requestId,
                    "INVALID_ROAD_ID",
                    "Road ID does not exist in the loaded graph.").dump();
            }

            return makeSuccess(requestId, {
                {"roadId", roadId},
                {"status", operation == "block_road" ? "Closed" : "Open"}
            }).dump();
        }

        if (operation == "shutdown")
        {
            shutdownRequested = true;
            return makeSuccess(requestId, {{"shuttingDown", true}}).dump();
        }

        return makeError(
            requestId,
            "INVALID_OPERATION",
            "Unsupported operation.").dump();
    }
    catch (const std::exception& exception)
    {
        return makeError(
            requestId,
            "INTERNAL_ERROR",
            "Worker request failed safely: " +
                std::string(exception.what())).dump();
    }
}
