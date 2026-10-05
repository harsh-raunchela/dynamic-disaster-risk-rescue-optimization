#include <iostream>
#include "EmergencyQueue.h"

using namespace std;

EmergencyQueue::EmergencyQueue()
{
    front = nullptr;
    rear = nullptr;
}

EmergencyQueue::~EmergencyQueue()
{
    while (!isEmpty())
    {
        dequeue();
    }
}

void EmergencyQueue::enqueue(const Emergency& emergency)
{
    Node* newNode = new Node;

    newNode->data = emergency;
    newNode->next = nullptr;

    if (rear == nullptr)
    {
        front = newNode;
        rear = newNode;
        return;
    }

    rear->next = newNode;
    rear = newNode;
}

Emergency EmergencyQueue::dequeue()
{
    if (isEmpty())
    {
        cout << "Queue is empty.\n";
        return Emergency{};
    }

    Node* temp = front;

    Emergency emergency = temp->data;

    front = front->next;

    if (front == nullptr)
    {
        rear = nullptr;
    }

    delete temp;

    return emergency;
}

bool EmergencyQueue::isEmpty() const
{
    return front == nullptr;
}

Emergency EmergencyQueue::peek() const
{
    if (isEmpty())
    {
        cout << "Queue is empty.\n";
        return Emergency{};
    }

    return front->data;
}

void EmergencyQueue::display() const
{
    if (isEmpty())
    {
        cout << "Queue is empty.\n";
        return;
    }

    Node* current = front;

    cout << "\nEmergency Queue:\n";

    while (current != nullptr)
    {
        cout << "ID: "
             << current->data.id

             << " | Location: "
             << current->data.locationId

             << " | Severity: "
             << current->data.severity

             << " | People Affected: "
             << current->data.peopleAffected

             << " | Reported: "
             << current->data.reportedTime

             << endl;

        current = current->next;
    }
}