import { BrowserWindow } from "electron";

////////////////////////////////////////////////////////////////////////////////////////
// ipcListeners sends messages from main to a renderer using an emitter
// which the render process will subscribe to with a handler
//
// If you want to add or update an ipcListener. Typescript will error if done wrong.
// 1) Update ipcListenerHandlersType with the API you want
// 2) Update the appropriate key in ipcListenerKeys
// 3) Update the rest of your codebase accordingly. Typescript will assist.
////////////////////////////////////////////////////////////////////////////////////////
// This defines the typescript API that the render process epects

export type ipcListenerHandlersType = {
    testListener: (serverSays: string) => void;
    
};
// This is a conveniences function to emit to a render listener on the server type safely
// Don't modify this unless you know what you are doing
// When used, try to use the "ipcListenerKeys" variable instead
// of a string literal for the name argument. This allows the IDE to make better
// automatic adjustments.

export const ipcEmit = <T extends keyof ipcListenerHandlersType>(
    window: BrowserWindow,
    name: T,
    parameters: Parameters<ipcListenerHandlersType[T]>[0],
) => {
    window.webContents.send(name, parameters);
};

export const ipcEmitAll = <T extends keyof ipcListenerHandlersType>(
    name: T,
    parameters: Parameters<ipcListenerHandlersType[T]>[0],
) => {
    BrowserWindow.getAllWindows().map((w) => ipcEmit(w, name, parameters));
};