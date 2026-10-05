#ifndef DISASTERX_LOCATION_HASH_MAP_H
#define DISASTERX_LOCATION_HASH_MAP_H

#include "Location.h"
#include <string>

using namespace std;

class LocationHashMap
{
private:
    static const int TABLE_SIZE = 101;

    struct Node
    {
        Location data;
        Node* next;
    };

    Node* table[TABLE_SIZE];

    int hashFunction(const string& key) const;

public:
    LocationHashMap();
    ~LocationHashMap();

    void insert(const Location& location);
    Location* search(const string& id);
    bool contains(const string& id) const;
    void remove(const string& id);
    void display() const;
};

#endif