
#include <iostream>
#include <string>
#include "EmergencyPriorityQueue.h"

using namespace std;

Emergency createEmergency(string id, int severity)
{
    Emergency e;
    e.id = id;
    e.locationId = "LOC_0001";
    e.severity = severity;
    e.peopleAffected = 10;
    e.reportedTime = "10:00";
    return e;
}

int main()
{
    EmergencyPriorityQueue queue;
    bool allPassed = true;

    cout << "=== PHASE 7.2: EMERGENCY QUEUE TEST ===\n";

    // Test 1: Empty queue
    cout << "\n[TEST 1] Empty queue\n";

    bool emptyInitially = queue.isEmpty();

    cout << "Initially empty: "
         << (emptyInitially ? "PASS" : "FAIL") << endl;

    allPassed = allPassed && emptyInitially;

    // Test 2: Single emergency
    cout << "\n[TEST 2] Single emergency\n";

    queue.enqueue(createEmergency("E1", 2));

    bool singleCorrect =
        !queue.isEmpty() && queue.peek().id == "E1";

    cout << "Single emergency retrieved correctly: "
         << (singleCorrect ? "PASS" : "FAIL") << endl;

    allPassed = allPassed && singleCorrect;

    Emergency single = queue.dequeue();

    bool emptyAfterDequeue = queue.isEmpty();

    cout << "Empty after dequeue: "
         << (emptyAfterDequeue ? "PASS" : "FAIL") << endl;

    allPassed = allPassed && emptyAfterDequeue;

    // Test 3: Severity priority
    cout << "\n[TEST 3] Severity priority\n";

    queue.enqueue(createEmergency("LOW", 1));
    queue.enqueue(createEmergency("CRITICAL", 4));
    queue.enqueue(createEmergency("MEDIUM", 2));
    queue.enqueue(createEmergency("HIGH", 3));

    string expected[] = {
        "CRITICAL", "HIGH", "MEDIUM", "LOW"
    };

    bool priorityCorrect = true;

    for (const string& id : expected)
    {
        Emergency current = queue.dequeue();

        cout << "Expected: " << id
             << " | Received: " << current.id << endl;

        if (current.id != id)
        {
            priorityCorrect = false;
        }
    }

    cout << "Severity ordering: "
         << (priorityCorrect ? "PASS" : "FAIL") << endl;

    allPassed = allPassed && priorityCorrect;

    // Test 4: Equal-severity FIFO ordering
    cout << "\n[TEST 4] Equal-severity FIFO ordering\n";

    queue.enqueue(createEmergency("E5", 3));
    queue.enqueue(createEmergency("E6", 3));
    queue.enqueue(createEmergency("E7", 3));

    bool fifoCorrect =
        queue.dequeue().id == "E5" &&
        queue.dequeue().id == "E6" &&
        queue.dequeue().id == "E7";

    cout << "Equal-severity FIFO: "
         << (fifoCorrect ? "PASS" : "FAIL") << endl;

    allPassed = allPassed && fifoCorrect;

    // Test 5: Queue empty after processing
    cout << "\n[TEST 5] Final queue state\n";

    bool finallyEmpty = queue.isEmpty();

    cout << "Queue empty: "
         << (finallyEmpty ? "PASS" : "FAIL") << endl;

    allPassed = allPassed && finallyEmpty;

    // Test 6: Dequeue from empty queue
    cout << "\n[TEST 6] Dequeue from empty queue\n";

    Emergency emptyResult = queue.dequeue();

    bool emptyDequeueSafe =
        queue.isEmpty() && emptyResult.severity == -1;

    cout << "Empty dequeue handled safely: "
         << (emptyDequeueSafe ? "PASS" : "FAIL") << endl;

    allPassed = allPassed && emptyDequeueSafe;

    // Final result
    cout << "\n=== PHASE 7.2 RESULT: "
         << (allPassed ? "ALL TESTS PASSED" : "SOME TESTS FAILED")
         << " ===\n";

    return allPassed ? 0 : 1;
}
