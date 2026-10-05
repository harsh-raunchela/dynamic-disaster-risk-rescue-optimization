#ifndef DISASTERX_PATH_STACK_H
#define DISASTERX_PATH_STACK_H

#include <string>

using namespace std;

class PathStack
{
private:

    struct Node
    {
        string locationId;
        Node* next;
    };

    Node* top;

public:

    PathStack();

    ~PathStack();

    void push(const string& locationId);

    string pop();

    string peek() const;

    bool isEmpty() const;

    void display() const;
};

#endif
