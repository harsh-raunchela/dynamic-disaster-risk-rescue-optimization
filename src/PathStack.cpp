#include <iostream>

#include "PathStack.h"

using namespace std;


// ==================================================
// CONSTRUCTOR
// ==================================================

PathStack::PathStack()
{
    top = nullptr;
}


// ==================================================
// DESTRUCTOR
// ==================================================

PathStack::~PathStack()
{
    while (!isEmpty())
    {
        pop();
    }
}


// ==================================================
// PUSH
// ==================================================

void PathStack::push(const string& locationId)
{
    Node* newNode = new Node;

    newNode->locationId = locationId;
    newNode->next = top;

    top = newNode;
}


// ==================================================
// POP
// ==================================================

string PathStack::pop()
{
    if (isEmpty())
    {
        cout << "Stack is empty.\n";

        return "";
    }

    Node* temp = top;

    string locationId = temp->locationId;

    top = top->next;

    delete temp;

    return locationId;
}


// ==================================================
// PEEK
// ==================================================

string PathStack::peek() const
{
    if (isEmpty())
    {
        cout << "Stack is empty.\n";

        return "";
    }

    return top->locationId;
}


// ==================================================
// IS EMPTY
// ==================================================

bool PathStack::isEmpty() const
{
    return top == nullptr;
}


// ==================================================
// DISPLAY
// ==================================================

void PathStack::display() const
{
    if (isEmpty())
    {
        cout << "Stack is empty.\n";
        return;
    }

    Node* current = top;

    cout << "\nPath Stack:\n";

    while (current != nullptr)
    {
        cout << current->locationId << endl;

        current = current->next;
    }
}
