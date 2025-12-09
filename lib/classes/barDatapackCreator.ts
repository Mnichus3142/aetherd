class barDatapackCreator {
    data : any = {
        // Batery status
        // 0 - Discharging, 1 - Charging
        "bat_status" : 0,
        // Battery percentage
        "bat_capacity" : 100,
        // Brightness level
        "brightness" : 100,
        // CPU usage percentage
        "cpu_usage" : 0,
        // Disk usage percentage
        "disk_usage" : 0,
        // RAM usage percentage
        "ram_usage" : 0,
        // Network status
        // -1 - down, 0 - eth, 1 - wlan
        "net_status" : -1,
        // Network signal strength
        "net_signal_strength" : 0,
        // Audio status
        // 0 - muted, 1 - unmuted
        "audio_status" : 1,
        // Audio volume level
        "audio_level" : 100
    }

    constructor() {
        console.log("barDatapackCreator initialized");
    }

    setter(data: any) {
        this.data = { ...this.data, ...data };
    }

	getter() {
		return this.data;
	}
}

export { barDatapackCreator };
