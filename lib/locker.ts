import { execSync, exec } from "child_process";
import open from "open";

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

    getExecutable(appName: string): string {
        try {
            const appNameMatch = this.getInfo(appName).match(/Exec=(.*)/);
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
                const exec = this.getExecutable(key)
                if (!this.vault.has(realName[0][0])) {
                    this.vault.set(realName[0], []);
                }
                const existing = this.vault.get(realName[0]);
                existing.push([realName, exec]);
                this.vault.set(realName[0], existing);
            });
        }
    }

    async response(key: string, howMany: number): Promise<string[]> {
        const keyLower = key.toLowerCase();
        const startsWithResults: string[] = [];
        const containsResults: string[] = [];

        for (const [, apps] of this.vault.entries()) {
            for (const app of apps) {
                const appNameLower = app[0].toLowerCase();
                if (appNameLower.startsWith(keyLower)) {
                    startsWithResults.push(app);
                } else if (appNameLower.includes(keyLower)) {
                    containsResults.push(app);
                }
            }
        }

        return [...startsWithResults, ...containsResults].slice(0, howMany);
    }

    openApp(appName: string, searchInWeb: boolean, searchQuery: string): void {
        console.log("Opening app:", appName, "Search in web:", searchInWeb);
        if (searchInWeb) {
            open(searchQuery.replace("%s", appName));
        } else {
            const letterSet = this.vault.get(appName[0]).filter((app: string[]) => app[0] === appName)[0][1];
            exec(`nohup ${letterSet} >/dev/null 2>&1 &`);
        }
    }
}
