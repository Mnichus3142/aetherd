#include <napi.h>

Napi::Number GetInfo(const Napi::CallbackInfo& info) {
    return Napi::Number::New(info.Env(), 42);
}

Napi::Object Init (Napi::Env env, Napi::Object exports) {
    exports.Set("info", Napi::Function::New(env, GetInfo));
    return exports;
}

NODE_API_MODULE(info, Init)