#include <iostream>
#include <string>
using namespace std;

int main() {
    string emergencyId;
    int severity;

    cout << "Enter emergency ID: ";
    cin >> emergencyId;

    cout << "Enter severity (1-5): ";
    cin >> severity;

    if (severity < 1 || severity > 5) {
        cout << "Invalid severity. Enter a value from 1 to 5.\n";
        return 1;
    }

    cout << "Emergency " << emergencyId
         << " accepted with severity " << severity << ".\n";

    return 0;
}
