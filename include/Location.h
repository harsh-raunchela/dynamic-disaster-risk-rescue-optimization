#ifndef LOCATION_H
#define LOCATION_H

#include <string>

using namespace std;

struct Location
{
    string id;
    string name;
    string type;

    double latitude;
    double longitude;

    int capacity;
};

#endif