#include <iostream>
#include "LocationHashMap.h"

using namespace std;

LocationHashMap::LocationHashMap()
{
    for (int i = 0; i < TABLE_SIZE; i++)
    {
        table[i] = nullptr;
    }
}

LocationHashMap::~LocationHashMap()
{
    for (int i = 0; i < TABLE_SIZE; i++)
    {
        Node* current = table[i];

        while (current != nullptr)
        {
            Node* temp = current;
            current = current->next;
            delete temp;
        }
    }
}

int LocationHashMap::hashFunction(const string& key) const
{
    unsigned long hash = 0;

    for (char ch : key)
    {
        hash = hash * 31 + ch;
    }

    return hash % TABLE_SIZE;
}

void LocationHashMap::insert(const Location& location)
{
    int index = hashFunction(location.id);

    Node* current = table[index];

    while (current != nullptr)
    {
        if (current->data.id == location.id)
        {
            current->data = location;
            return;
        }

        current = current->next;
    }

    Node* newNode = new Node;

    newNode->data = location;
    newNode->next = table[index];

    table[index] = newNode;
}

Location* LocationHashMap::search(const string& id)
{
    int index = hashFunction(id);

    Node* current = table[index];

    while (current != nullptr)
    {
        if (current->data.id == id)
        {
            return &current->data;
        }

        current = current->next;
    }

    return nullptr;
}

bool LocationHashMap::contains(const string& id) const
{
    int index = hashFunction(id);

    Node* current = table[index];

    while (current != nullptr)
    {
        if (current->data.id == id)
        {
            return true;
        }

        current = current->next;
    }

    return false;
}

void LocationHashMap::remove(const string& id)
{
    int index = hashFunction(id);

    Node* current = table[index];
    Node* previous = nullptr;

    while (current != nullptr)
    {
        if (current->data.id == id)
        {
            if (previous == nullptr)
            {
                table[index] = current->next;
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

void LocationHashMap::display() const
{
    cout << "\nLocation Hash Map:\n";

    for (int i = 0; i < TABLE_SIZE; i++)
    {
        Node* current = table[i];

        if (current != nullptr)
        {
            cout << "Bucket " << i << ": ";

            while (current != nullptr)
            {
                cout << current->data.id;

                if (current->next != nullptr)
                {
                    cout << " -> ";
                }

                current = current->next;
            }

            cout << endl;
        }
    }
}