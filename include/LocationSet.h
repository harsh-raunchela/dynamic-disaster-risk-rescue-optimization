#ifndef DISASTERX_LOCATION_SET_H
#define DISASTERX_LOCATION_SET_H

#include <string>

using namespace std;

class LocationSet
{
private:
    struct Node
    {
        string locationId;
        Node* next;
    };

    Node* head;

public:
    LocationSet();
    ~LocationSet();

    void insert(const string& locationId);
    bool contains(const string& locationId) const;
    void remove(const string& locationId);
    bool isEmpty() const;
    void display() const;
};

#endif