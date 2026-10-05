#include <iostream>
#include "LocationSet.h"

using namespace std;

LocationSet::LocationSet()
{
    head = nullptr;
}

LocationSet::~LocationSet()
{
    Node* current = head;

    while (current != nullptr)
    {
        Node* temp = current;
        current = current->next;
        delete temp;
    }
}

void LocationSet::insert(const string& locationId)
{
    // Do not insert duplicates
    if (contains(locationId))
    {
        return;
    }

    Node* newNode = new Node;

    newNode->locationId = locationId;
    newNode->next = head;

    head = newNode;
}

bool LocationSet::contains(const string& locationId) const
{
    Node* current = head;

    while (current != nullptr)
    {
        if (current->locationId == locationId)
        {
            return true;
        }

        current = current->next;
    }

    return false;
}

void LocationSet::remove(const string& locationId)
{
    Node* current = head;
    Node* previous = nullptr;

    while (current != nullptr)
    {
        if (current->locationId == locationId)
        {
            if (previous == nullptr)
            {
                head = current->next;
            }
            else
            {
                previous->next = current->next;
            }

            delete current;
            return;
        }

        previous = current;
        current = current->next;
    }
}

bool LocationSet::isEmpty() const
{
    return head == nullptr;
}

void LocationSet::display() const
{
    if (isEmpty())
    {
        cout << "Set is empty.\n";
        return;
    }

    Node* current = head;

    cout << "\nLocation Set:\n";

    while (current != nullptr)
    {
        cout << current->locationId << endl;
        current = current->next;
    }
}