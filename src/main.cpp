#include <iostream>
#include "Emergency.h"
#include "EmergencyQueue.h"

using namespace std;

int main()
{
    EmergencyQueue emergencyQueue;

    Emergency e1{
        "EMG_0001",
        "LOC_0086",
        5,
        20,
        "10:30"
    };

    Emergency e2{
        "EMG_0002",
        "LOC_0013",
        8,
        50,
        "10:35"
    };

    Emergency e3{
        "EMG_0003",
        "LOC_0023",
        3,
        10,
        "10:40"
    };

    cout << "Adding emergency reports...\n";

    emergencyQueue.enqueue(e1);
    emergencyQueue.enqueue(e2);
    emergencyQueue.enqueue(e3);

    emergencyQueue.display();

    cout << "\nFront emergency:\n";

    Emergency frontEmergency = emergencyQueue.peek();

    cout << frontEmergency.id << endl;

    cout << "\nProcessing emergency:\n";

    Emergency processed = emergencyQueue.dequeue();

    cout << "Processed: "
         << processed.id
         << endl;

    cout << "\nRemaining emergencies:\n";

    emergencyQueue.display();

    return 0;
}