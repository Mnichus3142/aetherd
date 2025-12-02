#include <napi.h>
#include <iostream>
#include <fstream>
#include "../globals.h"

void memUsage(Napi::ThreadSafeFunction tsfn) {
    while (running.load()) {
        int msg;

        std::ifstream proc_mem("/proc/meminfo");
        std::string line;
        int64_t total_mem = 0;
        int64_t free_mem = 0;

        while (std::getline(proc_mem, line)) {
            if (line.find("MemTotal:") == 0) {
                sscanf(line.c_str(), "MemTotal: %ld kB", &total_mem);
            } else if (line.find("MemAvailable:") == 0) {
                sscanf(line.c_str(), "MemAvailable: %ld kB", &free_mem);
                break;
            }
        }

        proc_mem.close();

        msg = (int)((double)(total_mem - free_mem) / (double)total_mem * 100.0);

        tsfn.BlockingCall(
            [msg](Napi::Env env, Napi::Function jsCallback) {
                Napi::Object obj = Napi::Object::New(env);

                obj.Set("mem", msg);

                jsCallback.Call({ obj });
            }
        );

        std::this_thread::sleep_for(std::chrono::seconds(2));
    }

    tsfn.Release();
}