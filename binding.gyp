{
  "targets": [
    {
      "target_name": "info",
      "sources": [
        "lib/api/info.cpp", 
        "lib/api/globals.h",
        "lib/api/functions/cpu.h",
        "lib/api/functions/cpu.cpp",
        "lib/api/functions/mem.h",
        "lib/api/functions/mem.cpp",
        "lib/api/functions/disk.h",
        "lib/api/functions/disk.cpp"
      ],
      "cflags!": ["-fno-exceptions"],
      "cflags_cc!": ["-fno-exceptions"],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "defines": [ "NAPI_CPP_EXCEPTIONS" ]
    }
  ]
}
