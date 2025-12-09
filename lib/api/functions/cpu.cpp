#include <napi.h>
#include <iostream>
#include <fstream>
#include "../globals.h"

void cpuUsage(Napi::ThreadSafeFunction tsfn) {
    while (running.load()) {
        int msg;
        int32_t total_jiffies_1 = 0, total_jiffies_2 = 0, work_jiffies_1 = 0, work_jiffies_2 = 0;

        std::ifstream proc_stat_1("/proc/stat");
        std::string line;

        while (proc_stat_1 >> line) {
            if (line == "cpu") {
                for (int i = 0; i < 10; ++i) {
                    int32_t value;
                    proc_stat_1 >> value;
                    total_jiffies_1 += value;
                    if (i < 3) {
                        work_jiffies_1 += value;
                    }
                }
                break;
            }
        }

        proc_stat_1.close();
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
        std::ifstream proc_stat_2("/proc/stat");
        while (proc_stat_2 >> line) {
            if (line == "cpu") {
                for (int i = 0; i < 10; ++i) {
                    int32_t value;
                    proc_stat_2 >> value;
                    total_jiffies_2 += value;
                    if (i < 3) {
                        work_jiffies_2 += value;
                    }
                }
                break;
            }
        }
        
        proc_stat_2.close();

        int8_t cpu_usage = 100.0 * (work_jiffies_2 - work_jiffies_1) / (total_jiffies_2 - total_jiffies_1);

        msg = (int)cpu_usage;

        tsfn.BlockingCall(
            [msg](Napi::Env env, Napi::Function jsCallback) {
                Napi::Object obj = Napi::Object::New(env);

                obj.Set("cpu_usage", msg);

                jsCallback.Call({ obj });
            }
        );

        std::this_thread::sleep_for(std::chrono::seconds(2));
    }

    tsfn.Release();
}