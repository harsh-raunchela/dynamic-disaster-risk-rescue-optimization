with open('src/main.cpp', 'r', encoding='utf-8') as f:
    content = f.read()

target_route_menu = """void routeMenu(DisasterEngine& engine, bool datasetLoaded)
{
    if (!datasetLoaded)
    {
        cout << "\\nLoad the disaster dataset first.\\n";
        return;
    }

    while (true)
    {
        cout << "\\n=============== ROUTE PLANNING ===============\\n";
        cout << "1. Find Best Route\\n";
        cout << "0. Back to Main Menu\\n";

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
                cout << "Invalid choice.\\n";
        }
    }
}"""

replacement_route_menu = """void routeMenu(
    DisasterEngine& engine,
    bool datasetLoaded,
    bool& mlLoaded)
{
    if (!datasetLoaded)
    {
        cout << "\\nLoad the disaster dataset first.\\n";
        return;
    }

    while (true)
    {
        cout << "\\n=============== ROUTE PLANNING ===============\\n";
        cout << "1. Find Best Route\\n";
        cout << "0. Back to Main Menu\\n";

        int choice;

        if (!readNumber("Enter choice: ", choice))
            continue;

        switch (choice)
        {
            case 1:
            {
                // Ensure ML risk predictions are loaded first.
                if (!mlLoaded)
                {
                    cout << "\\nML risk predictions are not loaded.\\n";
                    cout << "Loading ML risk predictions...\\n";

                    mlLoaded = engine.loadMLRiskPredictions(
                        "data/risk_predictions.csv"
                    );

                    if (!mlLoaded)
                    {
                        cout << "ERROR: Could not load ML risk predictions.\\n";
                        cout << "Route planning cancelled.\\n";
                        break;
                    }

                    cout << "ML risk predictions loaded successfully.\\n";
                }

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
                cout << "Invalid choice.\\n";
        }
    }
}"""

target_case5 = """            case 5:
                routeMenu(engine, datasetLoaded);
                break;"""

replacement_case5 = """            case 5:
                routeMenu(engine, datasetLoaded, mlLoaded);
                break;"""

if target_route_menu in content and target_case5 in content:
    content = content.replace(target_route_menu, replacement_route_menu, 1)
    content = content.replace(target_case5, replacement_case5, 1)
    with open('src/main.cpp', 'w', encoding='utf-8', newline='') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("TARGET NOT FOUND")

