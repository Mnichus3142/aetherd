#include <napi.h>
#include <thread>
#include "globals.h"
#include "functions/cpu.h"
#include "functions/mem.h"
#include "functions/disk.h"
#include "functions/network.h"
#include "functions/battery.h"
#include "functions/brightness.h"

std::atomic<bool> running(true);

Napi::Value startWatcher(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::Function cb = info[0].As<Napi::Function>();

    auto tsfn = Napi::ThreadSafeFunction::New(
        env,
        cb,
        "WatcherCallback",
        0,
        2
    );

    std::thread(cpuUsage, tsfn).detach();
    std::thread(memUsage, tsfn).detach();
    std::thread(diskUsage, tsfn).detach();
    std::thread(networkStatus, tsfn).detach();
    std::thread(batteryStatus, tsfn).detach();
    std::thread(brightness, tsfn).detach();
    return env.Undefined();
}

Napi::Object Init (Napi::Env env, Napi::Object exports) {
    exports.Set("startWatcher", Napi::Function::New(env, startWatcher));
    return exports;
}

NODE_API_MODULE(info, Init)
