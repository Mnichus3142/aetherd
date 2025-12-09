#include <napi.h>
#include <iostream>
#include <fstream>
#include "../globals.h"

std::string exec(const char* cmd) {
    std::unique_ptr<FILE, decltype(&pclose)> pipe(popen(cmd, "r"), pclose);
    if (!pipe) {
        return "ERROR";
    }

    char buffer[128];
    std::string result = "";

    while (fgets(buffer, sizeof(buffer), pipe.get()) != nullptr) {
        result += buffer;
    }
    return result;
}

void volume(Napi::ThreadSafeFunction tsfn) {
    while (running.load()) {
        int msg = 0;

        std::string cmd = "wpctl get-volume @DEFAULT_AUDIO_SINK@";
        std::string output = exec(cmd.c_str());

        if (output.find("[MUTED]") < 20) {
            tsfn.BlockingCall(
                [msg](Napi::Env env, Napi::Function jsCallback) {
                    Napi::Object obj = Napi::Object::New(env);

                    obj.Set("audio_status", msg);

                    jsCallback.Call({ obj });
                }
            );
        } 
        
        else {
            msg = 1;
            std::string volume_level;

            size_t pos1 = output.find("Volume: ") + 8;
            size_t pos2 = output.find("%", pos1);
            volume_level = output.substr(pos1, pos2 - pos1);

            tsfn.BlockingCall(
                [msg, volume_level](Napi::Env env, Napi::Function jsCallback) {
                    Napi::Object obj = Napi::Object::New(env);

                    obj.Set("audio_status", msg);
                    obj.Set("audio_level", (int)(std::stof(volume_level) * 100));

                    jsCallback.Call({ obj });
                }
            );
        }

        std::this_thread::sleep_for(std::chrono::milliseconds(500));
    }

    tsfn.Release();
}
