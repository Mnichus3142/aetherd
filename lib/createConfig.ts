import os from 'os';
import fs from 'fs';

const homeDir = os.homedir();
const appname = 'aetherd';
const configDir = `${homeDir}/.config/${appname}`;
const configFile = `${configDir}/config.json`;

export class Config {
    constructor() {
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir);
        }
        if (!fs.existsSync(configFile)) {
            const defaultConfig = {
                "aether-launcher": {
                    "searchQuery": "https://www.google.com/search?q=%s"
                }
            };
            fs.writeFileSync(configFile, JSON.stringify(defaultConfig));
        }
    }

    getConfig(app: string): any {
        const configData = fs.readFileSync(configFile, 'utf-8');
        const config = JSON.parse(configData);
        return config[app];
    }
}