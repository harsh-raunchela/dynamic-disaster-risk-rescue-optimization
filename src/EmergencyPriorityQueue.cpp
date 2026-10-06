#include <iostream>
#include "EmergencyPriorityQueue.h"

using namespace std;

EmergencyPriorityQueue::EmergencyPriorityQueue()
{
    front = nullptr;
}

EmergencyPriorityQueue::~EmergencyPriorityQueue()
{
    while (!isEmpty())
    {
        dequeue();
    }
}

void EmergencyPriorityQueue::enqueue(const Emergency& emergency)
{
    Node* newNode = new Node;

    newNode->data = emergency;
    newNode->next = nullptr;

    // Queue is empty
    if (front == nullptr)
    {
        front = newNode;
        return;
    }

    // Higher severity goes to the front
    if (emergency.severity > front->data.severity)
    {
        newNode->next = front;
        front = newNode;
        return;
    }

    // Find correct position
    Node* current = front;

    while (current->next != nullptr &&
           current->next->data.severity >= emergency.severity)
    {
        current = current->next;
    }

    newNode->next = current->next;
    current->next = newNode;
}

Emergency EmergencyPriorityQueue::dequeue()
{
    if (isEmpty())
    {
        cout << "Priority Queue is empty.\n";

        Emergency emptyEmergency;
        emptyEmergency.id = "";
        emptyEmergency.locationId = "";
        emptyEmergency.severity = -1;
        emptyEmergency.peopleAffected = 0;
        emptyEmergency.reportedTime = "";

        return emptyEmergency;
    }

    Node* temp = front;

    Emergency emergency = temp->data;

    front = front->next;

    delete temp;

    return emergency;
}

bool EmergencyPriorityQueue::isEmpty() const
{
    return front == nullptr;
}

Emergency EmergencyPriorityQueue::peek() const
{
    if (isEmpty())
    {
        cout << "Priority Queue is empty.\n";

        Emergency emptyEmergency;
        emptyEmergency.id = "";
        emptyEmergency.locationId = "";
        emptyEmergency.severity = -1;
        emptyEmergency.peopleAffected = 0;
        emptyEmergency.reportedTime = "";

        return emptyEmergency;
    }

    return front->data;
}

void EmergencyPriorityQueue::display() const
{
    if (isEmpty())
    {
        cout << "Priority Queue is empty.\n";
        return;
    }

    Node* current = front;

    cout << "\nEmergency Priority Queue:\n";

    while (current != nullptr)
    {
        cout << "ID: " << current->data.id
             << " | Location: " << current->data.locationId
             << " | Severity: " << current->data.severity
             << " | People Affected: "
             << current->data.peopleAffected
             << " | Reported: "
             << current->data.reportedTime
             << endl;

        current = current->next;
    }
}