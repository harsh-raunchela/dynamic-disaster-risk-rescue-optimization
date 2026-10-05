#ifndef DISASTERX_EMERGENCY_H
#define DISASTERX_EMERGENCY_H

#include <string>

struct Emergency
{
    std::string id;
    std::string locationId;

    int severity;
    int peopleAffected;

    std::string reportedTime;
};

#endif