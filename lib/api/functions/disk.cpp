#include <napi.h>
#include <iostream>
#include <fstream>
#include <sys/statvfs.h>
#include "../globals.h"

void diskUsage(Napi::ThreadSafeFunction tsfn) {
    while (running.load()) {
        std::string msg;

        struct statvfs stat;
        statvfs("/", &stat);

        float total_disk = (float)stat.f_blocks;
        float free_disk = (float)stat.f_bavail;

        msg = std::to_string((int)((total_disk - free_disk) / total_disk * 100.0));

        tsfn.BlockingCall(
            [msg](Napi::Env env, Napi::Function jsCallback) {
                Napi::Object obj = Napi::Object::New(env);

                obj.Set("disk", msg);

                jsCallback.Call({ obj });
            }
        );

        std::this_thread::sleep_for(std::chrono::seconds(5));
    }

    tsfn.Release();
}