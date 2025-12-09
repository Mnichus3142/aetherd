#include <napi.h>
#include <iostream>
#include <fstream>
#include "../globals.h"

void batteryStatus(Napi::ThreadSafeFunction tsfn) {
    while (running.load()) {
        std::string status = "";
        int energy_now = -1;
        int energy_full = -1;

        std::ifstream status_file("/sys/class/power_supply/BAT0/status");
        std::getline(status_file, status);
        status_file.close();

        std::ifstream energy_now_file("/sys/class/power_supply/BAT0/energy_now");
        energy_now_file >> energy_now;
        energy_now_file.close();

        std::ifstream energy_full_file("/sys/class/power_supply/BAT0/energy_full");
        energy_full_file >> energy_full;
        energy_full_file.close();

        int capacity = ((float)energy_now / (float)energy_full) * 100.0;

        tsfn.BlockingCall(
                [status, capacity](Napi::Env env, Napi::Function jsCallback) {
                    Napi::Object obj = Napi::Object::New(env);

                    obj.Set("bat_status", status == "Discharging" ? 0 : 1);
                    obj.Set("bat_capacity", capacity);

                    jsCallback.Call({ obj });
                }
            );

        std::this_thread::sleep_for(std::chrono::milliseconds(500));
    }

    tsfn.Release();
}
