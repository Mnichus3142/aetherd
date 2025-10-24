import { execSync } from 'child_process';

const getAppName = (appName: string): string | Number => {
    try {
        const appNameMatch = getInfo(appName).match(/Name=(.*)/);
        if (appNameMatch && appNameMatch[1]) {
            return appNameMatch[1];
        } else {
            console.log(`No name found for ${appName}.`);
            return 1;
        }
    } catch (error) {
        console.error(`Failed to open ${appName}:`, error);
        return 1;
    }
}

const listInstalled = (prompt: string): string[] => {
    const apps = execSync(`ls /usr/share/applications | grep ^${prompt} -i`, { encoding: 'utf-8' });
    const appList = apps.split('\n').filter((app: string) => app.endsWith('.desktop'));
    console.log('Installed applications:', appList);
    return appList.map(app => getAppName(app) as string);
}

const getInfo = (appName: string): string => {
    try {
        const info = execSync(`cat /usr/share/applications/${appName}`, { encoding: 'utf-8' });
        return info;
    } catch (error) {
        return `No information found for ${appName}`;
    }
}

const openApp = (appName: string): Number => {
    try {
        const execute = getInfo(appName).match(/Exec=(.*)/);
        if (execute && execute[1]) {
            execSync(execute[1], { stdio: 'inherit' });
            return 0;
        } else {
            console.log(`No executable command found for ${appName}.`);
            return 1;
        }
    } catch (error) {
        console.error(`Failed to open ${appName}:`, error);
        return 1;
    }
}

export { listInstalled, getInfo, openApp, getAppName };