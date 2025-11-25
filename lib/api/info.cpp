#include <napi.h>
#include <thread>
#include "globals.h"
#include "functions/cpu.h"

std::atomic<bool> running(true);

// void ramUsage(Napi::ThreadSafeFunction tsfn) {
//     while (running.load()) {
//         std::this_thread::sleep_for(std::chrono::seconds(1));

//         std::string msg = "RAM";

//         tsfn.BlockingCall(
//             [msg](Napi::Env env, Napi::Function jsCallback) {
//                 jsCallback.Call({
//                     Napi::String::New(env, msg)
//                 });
//             }
//         );
//     }

//     tsfn.Release();
// }

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
    return env.Undefined();
}

Napi::Object Init (Napi::Env env, Napi::Object exports) {
    exports.Set("startWatcher", Napi::Function::New(env, startWatcher));
    return exports;
}

NODE_API_MODULE(info, Init)
