#include <napi.h>
#include <iostream>
#include <fstream>
#include "../globals.h"

void brightness(Napi::ThreadSafeFunction tsfn) {
    while (running.load()) {
        int brightness_value = -1;
        std::ifstream brightness_file("/sys/class/backlight/intel_backlight/brightness");
        brightness_file >> brightness_value;
        brightness_file.close();

        brightness_value /= 1000;

        int full = brightness_value / 5;
        int remainings = brightness_value % 5;

        brightness_value = full * 5 + (remainings > 0 ? 5 : 0);

        tsfn.BlockingCall(
                [brightness_value](Napi::Env env, Napi::Function jsCallback) {
                    Napi::Object obj = Napi::Object::New(env);

                    obj.Set("brightness", brightness_value);

                    jsCallback.Call({ obj });
                }
            );

        std::this_thread::sleep_for(std::chrono::seconds(1));
    }

    tsfn.Release();
}