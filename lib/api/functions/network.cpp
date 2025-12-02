#include <napi.h>
#include <iostream>
#include <fstream>
#include "../globals.h"

#include <sys/socket.h>
#include <sys/ioctl.h>
#include <net/if.h>

#define BAD_SIGNAL_LEVEL -110
#define GOOD_SIGNAL_LEVEL -40

bool isInterfaceUp(const char *ifname, int sock) {
    struct ifreq ifr;
    memset(&ifr, 0, sizeof(ifr));
    strncpy(ifr.ifr_name, ifname, IFNAMSIZ - 1);

    if (ioctl(sock, SIOCGIFFLAGS, &ifr) == -1) {
        return false;
    }

    return (ifr.ifr_flags & IFF_UP) && (ifr.ifr_flags & IFF_RUNNING);
}

int8_t getSignalStrength() {
    std::ifstream wireless_file("/proc/net/wireless");
    std::string line;

    std::getline(wireless_file, line);
    std::getline(wireless_file, line);

    while (std::getline(wireless_file, line)) {
        if (line.find("wlan0:") != std::string::npos) {
            int status;
            float link_quality, signal_level, noise_level;
            sscanf(line.c_str(), " wlan0: %d %f %f %f", &status, &link_quality, &signal_level, &noise_level);
            wireless_file.close();
            return static_cast<int8_t>(signal_level);
        }
    }

    wireless_file.close();

    return -1;
}

float parseSignalStrengthToPercentage(int8_t signal_level) {
    return (float)(signal_level - BAD_SIGNAL_LEVEL) / (float)(GOOD_SIGNAL_LEVEL - BAD_SIGNAL_LEVEL) * 100.0;
}

void networkStatus(Napi::ThreadSafeFunction tsfn) {
    int sock = socket(AF_INET, SOCK_DGRAM, 0);
    while (running.load()) {
        int8_t msg = -1; // -1: down, 0: eth0 up, 1: wifi up

        if (isInterfaceUp("eth0", sock)) {
            msg = 0; // Ethernet up
            tsfn.BlockingCall(
                [msg](Napi::Env env, Napi::Function jsCallback) {
                    Napi::Object obj = Napi::Object::New(env);

                    obj.Set("net_status", msg);

                    jsCallback.Call({ obj });
                }
            );
        } 
        
        else if (isInterfaceUp("wlan0", sock)) {
            msg = 1; // WiFi up
            float signal_strength = parseSignalStrengthToPercentage(getSignalStrength());
            tsfn.BlockingCall(
                [msg, signal_strength](Napi::Env env, Napi::Function jsCallback) {
                    Napi::Object obj = Napi::Object::New(env);

                    obj.Set("net_status", msg);
                    obj.Set("net_signal_strength", (int)signal_strength);

                    jsCallback.Call({ obj });
                }
            );
        }

        else {
            // Network down
            tsfn.BlockingCall(
                [msg](Napi::Env env, Napi::Function jsCallback) {
                    Napi::Object obj = Napi::Object::New(env);

                    obj.Set("net_status", msg);

                    jsCallback.Call({ obj });
                }
            );
        }

        std::this_thread::sleep_for(std::chrono::seconds(1));
    }

    tsfn.Release();
}