#ifndef DISASTERX_MIN_HEAP_H
#define DISASTERX_MIN_HEAP_H

#include "RescueResource.h"

using namespace std;

class MinHeap
{
private:
    RescueResource* heap;
    int capacity;
    int size;

    void heapifyUp(int index);
    void heapifyDown(int index);

public:
    MinHeap(int capacity = 100);
    ~MinHeap();

    void insert(const RescueResource& resource);
    RescueResource extractMin();

    bool isEmpty() const;
    RescueResource peek() const;

    void display() const;
};

#endif