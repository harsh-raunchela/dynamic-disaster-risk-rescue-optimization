#include <iostream>
#include "MinHeap.h"

using namespace std;

int main()
{
    MinHeap resourceHeap;

    RescueResource r1;
    r1.id = "RES_001";
    r1.type = "Ambulance";
    r1.locationId = "LOC_0010";
    r1.priority = 25;

    RescueResource r2;
    r2.id = "RES_002";
    r2.type = "Rescue Team";
    r2.locationId = "LOC_0025";
    r2.priority = 10;

    RescueResource r3;
    r3.id = "RES_003";
    r3.type = "Helicopter";
    r3.locationId = "LOC_0040";
    r3.priority = 40;

    RescueResource r4;
    r4.id = "RES_004";
    r4.type = "Ambulance";
    r4.locationId = "LOC_0015";
    r4.priority = 15;

    cout << "Adding rescue resources...\n";

    resourceHeap.insert(r1);
    resourceHeap.insert(r2);
    resourceHeap.insert(r3);
    resourceHeap.insert(r4);

    resourceHeap.display();

    cout << "\nBest resource to dispatch:\n";

    RescueResource best = resourceHeap.peek();

    cout << "ID: " << best.id
         << " | Type: " << best.type
         << " | Priority: " << best.priority
         << endl;

    cout << "\nExtracting resources in priority order:\n";

    while (!resourceHeap.isEmpty())
    {
        RescueResource resource = resourceHeap.extractMin();

        cout << "Dispatched: "
             << resource.id
             << " | Priority: "
             << resource.priority
             << endl;
    }

    return 0;
}