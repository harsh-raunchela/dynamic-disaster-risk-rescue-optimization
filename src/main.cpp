#include <iostream>
#include "EmergencyPriorityQueue.h"

using namespace std;

int main()
{
    EmergencyPriorityQueue priorityQueue;

    Emergency e1;
    e1.id = "EMG_0001";
    e1.locationId = "LOC_0010";
    e1.severity = 3;
    e1.peopleAffected = 10;
    e1.reportedTime = "10:30";

    Emergency e2;
    e2.id = "EMG_0002";
    e2.locationId = "LOC_0025";
    e2.severity = 9;
    e2.peopleAffected = 50;
    e2.reportedTime = "10:35";

    Emergency e3;
    e3.id = "EMG_0003";
    e3.locationId = "LOC_0040";
    e3.severity = 5;
    e3.peopleAffected = 25;
    e3.reportedTime = "10:40";

    Emergency e4;
    e4.id = "EMG_0004";
    e4.locationId = "LOC_0055";
    e4.severity = 10;
    e4.peopleAffected = 100;
    e4.reportedTime = "10:45";

    cout << "Adding emergency reports...\n";

    priorityQueue.enqueue(e1);
    priorityQueue.enqueue(e2);
    priorityQueue.enqueue(e3);
    priorityQueue.enqueue(e4);

    priorityQueue.display();

    cout << "\nMost critical emergency:\n";

    Emergency critical = priorityQueue.peek();

    cout << "ID: " << critical.id
         << " | Severity: " << critical.severity
         << endl;

    cout << "\nProcessing emergencies by priority:\n";

    while (!priorityQueue.isEmpty())
    {
        Emergency emergency = priorityQueue.dequeue();

        cout << "Processing: "
             << emergency.id
             << " | Severity: "
             << emergency.severity
             << endl;
    }

    return 0;
}