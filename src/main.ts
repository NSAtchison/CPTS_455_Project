/* eslint-disable @typescript-eslint/no-require-imports */
// This is the webpack entry point. It is what starts everything (or prevents things from starting if second instance)
// This runs in the main process and runs every time regardless if there is another instance going

import { app, crashReporter } from "electron";

// Log Crashes to crashDumps https://www.electronjs.org/docs/latest/api/crash-reporter
crashReporter.start({ uploadToServer: false });

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// https://www.electronforge.io/config/makers/squirrel.windows#handling-startup-events
// eslint-disable-next-line unicorn/prefer-module
if (require("electron-squirrel-startup")) {
    console.log("Quitting Immediately: Startup");
    app.quit();
}
// Don't allow a second instance to start
else if (app.requestSingleInstanceLock()) {
    // eslint-disable-next-line unicorn/prefer-module
    require("./mainStartup");
} else {
    console.log("Quitting Immediately: Duplicate");
    app.quit();
}