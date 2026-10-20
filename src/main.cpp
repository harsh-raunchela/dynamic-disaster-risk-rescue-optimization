
#include <iostream>
#include <string>
#include <limits>
#include <sstream>

#include "Graph.h"
#include "DisasterEngine.h"

using namespace std;

// Read a complete line of input.
string readText(const string& prompt)
{
    string value;

    cout << prompt;
    getline(cin, value);

    return value;
}

// Read a number safely.
template <typename T>
bool readNumber(const string& prompt, T& value)
{
    string line;

    cout << prompt;
    getline(cin, line);

    stringstream ss(line);
    T input;

    if (!(ss >> input))
    {
        cout << "Invalid input. Please enter a valid number.\n";
        return false;
    }

    ss >> ws;

    if (!ss.eof())
    {
        cout << "Invalid input. Please enter only a number.\n";
        return false;
    }

    value = input;
    return true;
}

void displayBanner()
{
    cout << "\n";
    cout << "====================================================\n";
    cout << "                     DISASTERX\n";
    cout << "       Dynamic Disaster Risk, Evacuation &\n";
    cout << "              Rescue Optimization System\n";
    cout << "====================================================\n";
}

void displayMainMenu(
    const Graph& graph,
    bool datasetLoaded,
    bool mlLoaded)
{
    cout << "\n================== MAIN MENU ==================\n";
    cout << "1. Load Disaster Dataset\n";
    cout << "2. Load ML Risk Predictions\n";
    cout << "3. Emergency Management\n";
    cout << "4. Rescue Resource Management\n";
    cout << "5. Route Planning\n";
    cout << "6. Road / Disaster Control\n";
    cout << "7. Run Complete Disaster Simulation\n";
    cout << "8. Algorithm Information\n";
    cout << "0. Exit\n";
    cout << "================================================\n";

    cout << "\nSystem Status\n";
    cout << "Dataset: "
         << (datasetLoaded ? "LOADED" : "NOT LOADED") << "\n";

    cout << "Locations: "
         << (datasetLoaded ? graph.getLocationCount() : 0) << "\n";

    cout << "Roads: "
         << (datasetLoaded ? graph.getRoadCount() : 0) << "\n";

    cout << "ML Risk Predictions: "
         << (mlLoaded ? "LOADED" : "NOT LOADED") << "\n";
}

// --------------------------------------------------
// EMERGENCY MANAGEMENT
// --------------------------------------------------

void emergencyMenu(DisasterEngine& engine, bool datasetLoaded)
{
    if (!datasetLoaded)
    {
        cout << "\nLoad the disaster dataset first.\n";
        return;
    }

    while (true)
    {
        cout << "\n========== EMERGENCY MANAGEMENT ==========\n";
        cout << "1. Add Emergency\n";
        cout << "2. Process Next Emergency\n";
        cout << "3. Display Pending Emergencies\n";
        cout << "0. Back to Main Menu\n";

        int choice;

        if (!readNumber("Enter choice: ", choice))
            continue;

        switch (choice)
        {
            case 1:
            {
                Emergency emergency;

                emergency.id =
                    readText("Emergency ID (e.g. EMG_0100): ");

                emergency.locationId =
                    readText("Location ID (e.g. LOC_0010): ");

                if (!readNumber("Severity (1-10): ",
                                emergency.severity))
                    break;

                if (emergency.severity < 1 ||
                    emergency.severity > 10)
                {
                    cout << "Severity must be between 1 and 10.\n";
                    break;
                }

                if (!readNumber("People affected: ",
                                emergency.peopleAffected))
                    break;

                if (emergency.peopleAffected < 0)
                {
                    cout << "People affected cannot be negative.\n";
                    break;
                }

                emergency.reportedTime =
                    readText("Reported time (e.g. 14:30): ");

                engine.addEmergency(emergency);
                break;
            }

            case 2:
                engine.processNextEmergency();
                break;

            case 3:
                engine.displayEmergencies();
                break;

            case 0:
                return;

            default:
                cout << "Invalid choice.\n";
        }
    }
}

// --------------------------------------------------
// RESCUE RESOURCE MANAGEMENT
// --------------------------------------------------

void resourceMenu(DisasterEngine& engine, bool datasetLoaded)
{
    if (!datasetLoaded)
    {
        cout << "\nLoad the disaster dataset first.\n";
        return;
    }

    while (true)
    {
        cout << "\n========== RESCUE RESOURCE MANAGEMENT ==========\n";
        cout << "1. Add Rescue Resource\n";
        cout << "2. Dispatch Best Available Resource\n";
        cout << "0. Back to Main Menu\n";

        int choice;

        if (!readNumber("Enter choice: ", choice))
            continue;

        switch (choice)
        {
            case 1:
            {
                RescueResource resource;

                resource.id =
                    readText("Resource ID (e.g. RES_001): ");

                resource.type =
                    readText("Resource type (e.g. Ambulance): ");

                resource.locationId =
                    readText("Location ID (e.g. LOC_0001): ");

                if (!readNumber(
                        "Priority (lower value = higher priority): ",
                        resource.priority))
                    break;

                engine.addResource(resource);
                break;
            }

            case 2:
                engine.dispatchResource();
                break;

            case 0:
                return;

            default:
                cout << "Invalid choice.\n";
        }
    }
}

// --------------------------------------------------
// ROUTE PLANNING
// --------------------------------------------------

void routeMenu(DisasterEngine& engine, bool datasetLoaded)
{
    if (!datasetLoaded)
    {
        cout << "\nLoad the disaster dataset first.\n";
        return;
    }

    while (true)
    {
        cout << "\n=============== ROUTE PLANNING ===============\n";
        cout << "1. Find Best Route\n";
        cout << "0. Back to Main Menu\n";

        int choice;

        if (!readNumber("Enter choice: ", choice))
            continue;

        switch (choice)
        {
            case 1:
            {
                string source =
                    readText("Source location ID: ");

                string destination =
                    readText("Destination location ID: ");

                engine.findRoute(source, destination);
                break;
            }

            case 0:
                return;

            default:
                cout << "Invalid choice.\n";
        }
    }
}

// --------------------------------------------------
// ROAD / DISASTER CONTROL
// --------------------------------------------------

void roadControlMenu(
    DisasterEngine& engine,
    bool datasetLoaded)
{
    if (!datasetLoaded)
    {
        cout << "\nLoad the disaster dataset first.\n";
        return;
    }

    while (true)
    {
        cout << "\n============= ROAD / DISASTER CONTROL =============\n";
        cout << "1. Block Road\n";
        cout << "2. Unblock Road\n";
        cout << "3. Update Road Information\n";
        cout << "4. Display Outgoing Roads\n";
        cout << "0. Back to Main Menu\n";

        int choice;

        if (!readNumber("Enter choice: ", choice))
            continue;

        switch (choice)
        {
            case 1:
            case 2:
            {
                string source =
                    readText("Source location ID: ");

                string destination =
                    readText("Destination location ID: ");

                if (choice == 1)
                    engine.blockRoad(source, destination);
                else
                    engine.unblockRoad(source, destination);

                break;
            }

            case 3:
            {
                string source =
                    readText("Source location ID: ");

                string destination =
                    readText("Destination location ID: ");

                Edge updatedEdge;
                updatedEdge.destination = destination;

                if (!readNumber("New distance: ",
                                updatedEdge.distance))
                    break;

                if (!readNumber("New travel time: ",
                                updatedEdge.travelTime))
                    break;

                if (updatedEdge.distance < 0 ||
                    updatedEdge.travelTime < 0)
                {
                    cout << "Distance and travel time cannot be negative.\n";
                    break;
                }

                updatedEdge.risk =
                    readText("New risk level: ");

                updatedEdge.traffic =
                    readText("New traffic level: ");

                updatedEdge.roadCondition =
                    readText("New road condition: ");

                updatedEdge.status =
                    readText("Status (Open/Closed): ");

                if (updatedEdge.status != "Open" &&
                    updatedEdge.status != "Closed")
                {
                    cout << "Status must be Open or Closed.\n";
                    break;
                }

                engine.updateRoad(
                    source, destination, updatedEdge);

                break;
            }

            case 4:
            {
                string locationId =
                    readText("Location ID: ");

                engine.displayRoads(locationId);
                break;
            }

            case 0:
                return;

            default:
                cout << "Invalid choice.\n";
        }
    }
}

// --------------------------------------------------
// ALGORITHM INFORMATION
// --------------------------------------------------

void displayAlgorithmInformation()
{
    cout << "\n============= ALGORITHM INFORMATION =============\n";

    cout << "1. Graph with an adjacency list\n";
    cout << "   Represents locations and connecting roads.\n\n";

    cout << "2. Dijkstra's Algorithm\n";
    cout << "   Finds a minimum-travel-time route using\n";
    cout << "   available roads and non-negative costs.\n\n";

    cout << "3. A* Route Function\n";
    cout << "   Currently uses a zero heuristic, making it\n";
    cout << "   equivalent to Dijkstra's algorithm.\n\n";

    cout << "4. Emergency Priority Queue\n";
    cout << "   Processes emergencies according to priority.\n\n";

    cout << "5. Min Heap\n";
    cout << "   Selects rescue resources according to priority.\n\n";

    cout << "6. Dynamic Rerouting\n";
    cout << "   Recalculates a route when a road is unavailable.\n\n";

    cout << "7. ML Risk Integration\n";
    cout << "   Loads risk predictions and updates road data.\n";

    cout << "==================================================\n";
}

// --------------------------------------------------
// MAIN
// --------------------------------------------------

int main()
{
    displayBanner();

    Graph graph;
    DisasterEngine engine(&graph);

    bool datasetLoaded = false;
    bool mlLoaded = false;

    while (true)
    {
        displayMainMenu(graph, datasetLoaded, mlLoaded);

        int choice;

        if (!readNumber("Enter choice: ", choice))
            continue;

        switch (choice)
        {
            case 1:
            {
                cout << "\nLoading disaster dataset...\n";

                bool locationsLoaded =
                    graph.loadLocations("data/locations.csv");

                bool roadsLoaded = false;

                if (locationsLoaded)
                {
                    roadsLoaded =
                        graph.loadRoads("data/roads.csv");
                }

                datasetLoaded =
                    locationsLoaded && roadsLoaded;

                if (datasetLoaded)
                {
                    mlLoaded = false;

                    cout << "\nDataset loaded successfully.\n";
                    cout << "Locations: "
                         << graph.getLocationCount() << "\n";
                    cout << "Roads: "
                         << graph.getRoadCount() << "\n";
                }
                else
                {
                    cout << "\nDataset loading failed.\n";
                    cout << "Check data/locations.csv and "
                         << "data/roads.csv.\n";
                }

                break;
            }

            case 2:
            {
                if (!datasetLoaded)
                {
                    cout << "\nLoad the disaster dataset first.\n";
                    break;
                }

                cout << "\nLoading ML risk predictions...\n";

                mlLoaded = engine.loadMLRiskPredictions(
                    "data/risk_predictions.csv");

                if (mlLoaded)
                    cout << "ML risk predictions loaded successfully.\n";
                else
                    cout << "ML risk predictions could not be loaded.\n";

                break;
            }

            case 3:
                emergencyMenu(engine, datasetLoaded);
                break;

            case 4:
                resourceMenu(engine, datasetLoaded);
                break;

            case 5:
                routeMenu(engine, datasetLoaded);
                break;

            case 6:
                roadControlMenu(engine, datasetLoaded);
                break;

            case 7:
                if (!datasetLoaded)
                {
                    cout << "\nLoad the disaster dataset first.\n";
                    break;
                }

                engine.runDisasterSimulation();
                break;

            case 8:
                displayAlgorithmInformation();
                break;

            case 0:
                cout << "\nExiting DisasterX. Goodbye!\n";
                return 0;

            default:
                cout << "Invalid choice. Select an option from the menu.\n";
        }
    }
}
