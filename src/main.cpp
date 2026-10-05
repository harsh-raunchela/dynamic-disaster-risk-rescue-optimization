#include <iostream>

#include "PathStack.h"

using namespace std;

int main()
{
    PathStack pathStack;


    // ==========================================
    // PUSH LOCATIONS
    // ==========================================

    cout << "Building path...\n";

    pathStack.push("LOC_0001");
    pathStack.push("LOC_0042");
    pathStack.push("LOC_0105");
    pathStack.push("LOC_0231");


    // ==========================================
    // DISPLAY STACK
    // ==========================================

    cout << "\nStack after pushing locations:";

    pathStack.display();


    // ==========================================
    // PEEK
    // ==========================================

    cout << "\nTop location:\n";

    cout << pathStack.peek() << endl;


    // ==========================================
    // POP
    // ==========================================

    cout << "\nRemoving top location:\n";

    cout << "Removed: "
         << pathStack.pop()
         << endl;


    // ==========================================
    // DISPLAY AGAIN
    // ==========================================

    cout << "\nRemaining path:";

    pathStack.display();


    return 0;
}