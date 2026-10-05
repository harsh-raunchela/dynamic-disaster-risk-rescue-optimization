#ifndef DISASTERX_EMERGENCY_QUEUE_H
#define DISASTERX_EMERGENCY_QUEUE_H

#include "Emergency.h"

class EmergencyQueue
{
private:

    struct Node
    {
        Emergency data;
        Node* next;
    };

    Node* front;
    Node* rear;

public:

    EmergencyQueue();
    ~EmergencyQueue();

    void enqueue(const Emergency& emergency);

    Emergency dequeue();

    bool isEmpty() const;

    Emergency peek() const;

    void display() const;
};

#endif