
#include <iostream>
#include <string>
#include "MinHeap.h"

using namespace std;

RescueResource createResource(string id, int priority)
{
    RescueResource resource;
    resource.id = id;
    resource.type = "Ambulance";
    resource.locationId = "LOC_0001";
    resource.priority = priority;
    return resource;
}

int main()
{
    bool allPassed = true;

    cout << "=== PHASE 7.3: MIN HEAP TEST ===\n";

    MinHeap heap(10);

    // Test 1: Empty heap
    cout << "\n[TEST 1] Empty heap\n";

    bool initiallyEmpty = heap.isEmpty();

    cout << "Initially empty: "
         << (initiallyEmpty ? "PASS" : "FAIL") << endl;

    allPassed = allPassed && initiallyEmpty;

    // Test 2: Single resource
    cout << "\n[TEST 2] Single resource\n";

    heap.insert(createResource("R1", 3));

    bool singleCorrect =
        !heap.isEmpty() && heap.peek().id == "R1";

    cout << "Single resource at top: "
         << (singleCorrect ? "PASS" : "FAIL") << endl;

    allPassed = allPassed && singleCorrect;

    RescueResource one = heap.extractMin();

    bool extractedCorrectly =
        one.id == "R1" && heap.isEmpty();

    cout << "Extraction and empty state: "
         << (extractedCorrectly ? "PASS" : "FAIL") << endl;

    allPassed = allPassed && extractedCorrectly;

    // Test 3: Priority ordering
    cout << "\n[TEST 3] Priority ordering\n";

    heap.insert(createResource("LOW", 5));
    heap.insert(createResource("HIGHEST", 1));
    heap.insert(createResource("MEDIUM", 3));
    heap.insert(createResource("HIGH", 2));

    string expected[] = {
        "HIGHEST", "HIGH", "MEDIUM", "LOW"
    };

    bool orderingCorrect = true;

    for (const string& expectedId : expected)
    {
        RescueResource actual = heap.extractMin();

        cout << "Expected: " << expectedId
             << " | Received: " << actual.id << endl;

        if (actual.id != expectedId)
        {
            orderingCorrect = false;
        }
    }

    cout << "Priority ordering: "
         << (orderingCorrect ? "PASS" : "FAIL") << endl;

    allPassed = allPassed && orderingCorrect;

    // Test 4: Equal priorities
    cout << "\n[TEST 4] Equal priorities\n";

    heap.insert(createResource("E1", 2));
    heap.insert(createResource("E2", 2));
    heap.insert(createResource("E3", 2));

    bool allEqualPriorities = true;

    for (int i = 0; i < 3; i++)
    {
        RescueResource resource = heap.extractMin();

        cout << "Extracted: " << resource.id
             << " | Priority: " << resource.priority << endl;

        if (resource.priority != 2)
        {
            allEqualPriorities = false;
        }
    }

    cout << "All equal-priority resources extracted: "
         << (allEqualPriorities ? "PASS" : "FAIL") << endl;

    allPassed = allPassed && allEqualPriorities;

    // Test 5: Capacity limit
    cout << "\n[TEST 5] Heap capacity\n";

    MinHeap smallHeap(2);

    smallHeap.insert(createResource("A", 2));
    smallHeap.insert(createResource("B", 1));
    smallHeap.insert(createResource("C", 0));

    bool capacityCorrect =
        smallHeap.extractMin().id == "B" &&
        smallHeap.extractMin().id == "A" &&
        smallHeap.isEmpty();

    cout << "Capacity limit handled: "
         << (capacityCorrect ? "PASS" : "FAIL") << endl;

    allPassed = allPassed && capacityCorrect;

    // Test 6: Capacity overflow preserves existing resources
    cout << "\n[TEST 6] Capacity overflow preservation\n";

    MinHeap overflowHeap(2);

    overflowHeap.insert(createResource("A", 2));
    overflowHeap.insert(createResource("B", 1));
    overflowHeap.insert(createResource("C", 0));

    bool overflowCorrect =
        overflowHeap.peek().id == "B" &&
        overflowHeap.extractMin().id == "B" &&
        overflowHeap.extractMin().id == "A" &&
        overflowHeap.isEmpty();

    cout << "Existing resources preserved after overflow: "
         << (overflowCorrect ? "PASS" : "FAIL") << endl;

    allPassed = allPassed && overflowCorrect;

    // Final result
    cout << "\n=== PHASE 7.3 RESULT: "
         << (allPassed ? "ALL TESTS PASSED" : "SOME TESTS FAILED")
         << " ===\n";

    return allPassed ? 0 : 1;
}
