<<<<<<< HEAD
=======
#include <iostream>
#include "LocationHashMap.h"
#include "PathStack.h"
#include "LocationHashMap.h"
#include "PathStack.h"
#include "RouteDecisionEngine.h"

using namespace std;

int main()
{
    PathStack pathStack;


    // ==========================================
    // PUSH LOCATIONS
    // ==========================================

    cout << "Building path...\n";

    pathStack.push("LOC_0001");
    pathStack.push("LOC_0042");
    pathStack.push("LOC_0105");
    pathStack.push("LOC_0231");


    // ==========================================
    // DISPLAY STACK
    // ==========================================

    cout << "\nStack after pushing locations:";

    pathStack.display();


    // ==========================================
    // PEEK
    // ==========================================

    cout << "\nTop location:\n";

    cout << pathStack.peek() << endl;


    // ==========================================
    // POP
    // ==========================================

    cout << "\nRemoving top location:\n";

    cout << "Removed: "
         << pathStack.pop()
         << endl;


    // ==========================================
    // DISPLAY AGAIN
    // ==========================================

    cout << "\nRemaining path:";

    pathStack.display();

    LocationHashMap locationMap;

    Location loc1;
    loc1.id = "LOC_0001";
    loc1.name = "Village A";
    loc1.type = "Village";
    loc1.latitude = 30.3165;
    loc1.longitude = 78.0322;
    loc1.capacity = 100;

    Location loc2;
    loc2.id = "LOC_0042";
    loc2.name = "Hospital A";
    loc2.type = "Hospital";
    loc2.latitude = 30.3200;
    loc2.longitude = 78.0400;
    loc2.capacity = 200;

    Location loc3;
    loc3.id = "LOC_0105";
    loc3.name = "Shelter A";
    loc3.type = "Shelter";
    loc3.latitude = 30.3250;
    loc3.longitude = 78.0450;
    loc3.capacity = 500;

    cout << "\nAdding locations...\n";

    locationMap.insert(loc1);
    locationMap.insert(loc2);
    locationMap.insert(loc3);

    Location* result = locationMap.search("LOC_0042");

    cout << "\nSearching for LOC_0042:\n";

    if (result != nullptr)
    {
        cout << "Found: "
             << result->id << " | "
             << result->name << " | "
             << result->type << endl;
    }
    else
    {
        cout << "Location not found.\n";
    }

    cout << "\nChecking LOC_0105:\n";

    if (locationMap.contains("LOC_0105"))
    {
        cout << "Location exists.\n";
    }
    else
    {
        cout << "Location does not exist.\n";
    }

    cout << "\nRemoving LOC_0042...\n";

    locationMap.remove("LOC_0042");

    cout << "\nSearching again for LOC_0042:\n";

    if (locationMap.search("LOC_0042") == nullptr)
    {
        cout << "Location not found.\n";
    }

    locationMap.display();
    
          return 0;
}
>>>>>>> e99e837 (Implement dynamic route rerouting)
