#include <iostream>
#include "MinHeap.h"

using namespace std;

MinHeap::MinHeap(int capacity)
{
    this->capacity = capacity;
    size = 0;

    heap = new RescueResource[capacity];
}

MinHeap::~MinHeap()
{
    delete[] heap;
}

void MinHeap::heapifyUp(int index)
{
    while (index > 0)
    {
        int parent = (index - 1) / 2;

        if (heap[parent].priority <= heap[index].priority)
        {
            break;
        }

        RescueResource temp = heap[parent];
        heap[parent] = heap[index];
        heap[index] = temp;

        index = parent;
    }
}

void MinHeap::heapifyDown(int index)
{
    while (true)
    {
        int left = 2 * index + 1;
        int right = 2 * index + 2;

        int smallest = index;

        if (left < size &&
            heap[left].priority < heap[smallest].priority)
        {
            smallest = left;
        }

        if (right < size &&
            heap[right].priority < heap[smallest].priority)
        {
            smallest = right;
        }

        if (smallest == index)
        {
            break;
        }

        RescueResource temp = heap[index];
        heap[index] = heap[smallest];
        heap[smallest] = temp;

        index = smallest;
    }
}

void MinHeap::insert(const RescueResource& resource)
{
    if (size == capacity)
    {
        cout << "Heap is full.\n";
        return;
    }

    heap[size] = resource;

    heapifyUp(size);

    size++;
}

RescueResource MinHeap::extractMin()
{
    if (isEmpty())
    {
        cout << "Heap is empty.\n";

        RescueResource emptyResource;
        emptyResource.id = "";
        emptyResource.type = "";
        emptyResource.locationId = "";
        emptyResource.priority = -1;

        return emptyResource;
    }

    RescueResource minimum = heap[0];

    heap[0] = heap[size - 1];

    size--;

    if (size > 0)
    {
        heapifyDown(0);
    }

    return minimum;
}

bool MinHeap::isEmpty() const
{
    return size == 0;
}

RescueResource MinHeap::peek() const
{
    if (isEmpty())
    {
        cout << "Heap is empty.\n";

        RescueResource emptyResource;
        emptyResource.id = "";
        emptyResource.type = "";
        emptyResource.locationId = "";
        emptyResource.priority = -1;

        return emptyResource;
    }

    return heap[0];
}

void MinHeap::display() const
{
    if (isEmpty())
    {
        cout << "Heap is empty.\n";
        return;
    }

    cout << "\nMin Heap:\n";

    for (int i = 0; i < size; i++)
    {
        cout << "ID: " << heap[i].id
             << " | Type: " << heap[i].type
             << " | Location: " << heap[i].locationId
             << " | Priority: " << heap[i].priority
             << endl;
    }
}