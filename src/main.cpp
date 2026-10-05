#include <iostream>
#include "LocationSet.h"

using namespace std;

int main()
{
    LocationSet visitedLocations;

    cout << "Adding visited locations...\n";

    visitedLocations.insert("LOC_0001");
    visitedLocations.insert("LOC_0042");
    visitedLocations.insert("LOC_0105");

    // Try adding duplicate
    visitedLocations.insert("LOC_0042");

    visitedLocations.display();

    cout << "\nChecking LOC_0042:\n";

    if (visitedLocations.contains("LOC_0042"))
    {
        cout << "LOC_0042 has been visited.\n";
    }
    else
    {
        cout << "LOC_0042 has not been visited.\n";
    }

    cout << "\nChecking LOC_0231:\n";

    if (visitedLocations.contains("LOC_0231"))
    {
        cout << "LOC_0231 has been visited.\n";
    }
    else
    {
        cout << "LOC_0231 has not been visited.\n";
    }

    cout << "\nRemoving LOC_0042...\n";

    visitedLocations.remove("LOC_0042");

    cout << "\nChecking LOC_0042 again:\n";

    if (visitedLocations.contains("LOC_0042"))
    {
        cout << "LOC_0042 has been visited.\n";
    }
    else
    {
        cout << "LOC_0042 has not been visited.\n";
    }

    cout << "\nRemaining locations:";

    visitedLocations.display();

    return 0;
}