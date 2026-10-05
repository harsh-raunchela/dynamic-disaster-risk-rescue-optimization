#ifndef DISASTERX_RESCUE_RESOURCE_H
#define DISASTERX_RESCUE_RESOURCE_H

#include <string>

using namespace std;

struct RescueResource
{
    string id;
    string type;
    string locationId;

    int priority;
};

#endif