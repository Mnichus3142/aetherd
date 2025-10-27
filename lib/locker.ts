import { execSync } from "child_process";

export class Locker {
    private vault = new Map<string, any>();
    private vaultSize = 0;

    getInfo(appName: string): string {
        try {
            const info = execSync(`cat /usr/share/applications/${appName}`, {
                encoding: "utf-8",
            });
            return info;
        } catch (error) {
            return `No information found for ${appName}`;
        }
    }

    getAppCount(): number {
        return execSync(`ls /usr/share/applications | wc -l`, {
            encoding: "utf-8",
        }).trim() as unknown as number;
    }

    getAppName(appName: string): string {
        try {
            const appNameMatch = this.getInfo(appName).match(/Name=(.*)/);
            if (appNameMatch && appNameMatch[1]) {
                return appNameMatch[1];
            } else {
                return "";
            }
        } catch (error) {
            return "";
        }
    }

    prepare(): void {
        if (this.vaultSize === 0 || this.vaultSize !== this.getAppCount()) {
            const apps = execSync(`ls /usr/share/applications`, {
                encoding: "utf-8",
            });
            const appList = apps
                .split("\n")
                .filter((app: string) => app.endsWith(".desktop"));

            appList.forEach((key) => {
                const realName = this.getAppName(key);
                if (!this.vault.has(realName[0])) {
                    this.vault.set(realName[0], []);
                }
                const existing = this.vault.get(realName[0]);
                existing.push(this.getAppName(key));
                this.vault.set(realName[0], existing);
            });
        }
    }

    async response(key: string, howMany: number): Promise<string[]> {
        console.log("Searching for key:", key);
        const responses = this.vault.get(key[0]);

        if (responses) {
            return responses.filter((app: string) => app.toLowerCase().includes(key.toLowerCase())).slice(0, howMany);
        } else {
            return [];
        }
    }
}
