import { BrowserWindow, app } from "electron";
import type { routes } from "../imports/api/constants";
import { exec } from "child_process";
import path from "path";
import os from "os";
import process from "process";
import { filterDefined } from "./typescriptHelpers";



export const assetPath = path.join(
    app.getAppPath(),
    ".webpack/renderer/assets/"
);

export const getAsset = (fileUrl: string) => path.join(assetPath, fileUrl);

export const myIps = () =>
    filterDefined(
        Object.entries(os.networkInterfaces())
            .flatMap((v) => v[1])
            .filter((v) => v?.family === "IPv4" && v.internal === false)
            .map((v) => v?.address),
    );

export const isWindows = () => {
    return process.platform === "win32"
}

export const openFileOrFolder = async (myPath: string) => {
    const isDirectory = !path.parse(myPath).ext;
    return isWindows()
        ? isDirectory
            ? exec(`"${myPath}"`)
            : exec(`explorer "${myPath}"`)
        : exec(`open "${myPath}"`)
};

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

export const createWindow = (
    path: (typeof routes)[keyof typeof routes],
    {
        title,
        ...options
    }: { title?: string } & Electron.BrowserWindowConstructorOptions = {},
) => {
    // Create the browser window.
    const position = BrowserWindow.getAllWindows().at(0)?.getPosition();
    const [x, y] = [position?.at(0), position?.at(1)] as const;
    const myWindow = new BrowserWindow({
        height: 600,
        width: 800,
        x: x ? x + 50 : undefined,
        y: y ? y + 50 : undefined,
        show: false,
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
            webSecurity: false,
        },
        ...options
    });

    // Allow the title to get set & set it
    myWindow.on("page-title-updated", function (event) {
        event.preventDefault();
    });
    if (title !== undefined) myWindow.setTitle(title);
    myWindow.on("ready-to-show", () => myWindow.show());
    // and load the index.html of the app.
    myWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY + "#" + path).then(() => {
        // Reset title in case it was overwritten during loadURL
        if (title !== undefined) myWindow.setTitle(title);
        // Open the DevTools.
        // mainWindow.webContents.openDevTools();

        if (myWindow.isMinimized()) myWindow.restore();
        myWindow.focus();
    });

    return myWindow;
};