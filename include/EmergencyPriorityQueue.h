#ifndef DISASTERX_EMERGENCY_PRIORITY_QUEUE_H
#define DISASTERX_EMERGENCY_PRIORITY_QUEUE_H

#include "Emergency.h"

class EmergencyPriorityQueue
{
private:
    struct Node
    {
        Emergency data;
        Node* next;
    };

    Node* front;

public:
    EmergencyPriorityQueue();
    ~EmergencyPriorityQueue();

    void enqueue(const Emergency& emergency);
    Emergency dequeue();

    bool isEmpty() const;
    Emergency peek() const;

    void display() const;
};

#endif