// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";
import { ipcListenerKeys, ipcMethodKeys } from './ipcPreloadHelpers';
import type { ipcMethodHandlersType } from "./ipcMethods";
import { fromEntries, getKeys, getValues } from "./typescriptHelpers";
import { ipcListenerHandlersType } from './ipcListeners';

////////////////////////////////////////////////////////////////////////////////////////////
// This implements patterns two and three from
// https://www.electronjs.org/docs/latest/tutorial/ipc#pattern2-renderer-to-main-two-way
//
// I'm using the meteor terminology of method, specializing it into ipcMethod.
// They allow the render process to call funcs in main process
// ipcListeners allow the main process to call methods in render using listeners
////////////////////////////////////////////////////////////////////////////////////////////

// Methods
type ipcMethodKeyType = keyof ipcMethodHandlersType;

type functionType<T extends ipcMethodKeyType> = ipcMethodHandlersType[T];

type voided<T> = T extends undefined ? void : T;

type ipcMethodReturnType<T extends ipcMethodKeyType> = (
    argument: voided<Parameters<functionType<T>>[1]>,
) => Promise<Awaited<ReturnType<functionType<T>>>>;

const genIPCMethod: <T extends ipcMethodKeyType>(
    name: T,
) => ipcMethodReturnType<T> = (name) => {
    return (argument) => ipcRenderer.invoke(name, argument);
};

const ipcMethods = fromEntries(
    getKeys(ipcMethodKeys).map(
        (key) =>
            [key, genIPCMethod(key)] as {
                [T in ipcMethodKeyType]: [T, ipcMethodReturnType<T>];
            }[ipcMethodKeyType],
    ),
) as {
    // Using keyof instead of ipcMethodKeyType for ease of IDE use
    [T in keyof ipcMethodHandlersType]: ipcMethodReturnType<T>;
};
contextBridge.exposeInMainWorld("ipcMethods", ipcMethods);

// Listeners
type removeListernerFunctionType = () => void;

export type listenerCallbackType<T extends keyof ipcListenerHandlersType> = (
    event: Electron.IpcRendererEvent,
    arguments_: Parameters<ipcListenerHandlersType[T]>[0],
) => void;

type listenerReturnType<T extends keyof ipcListenerHandlersType> = (
    callback: listenerCallbackType<T>,
) => removeListernerFunctionType;

const genIPCListener = <T extends keyof ipcListenerHandlersType>(
    name: T,
): listenerReturnType<T> => {
    return (callback) => {
        const r = ipcRenderer.on(ipcListenerKeys[name], callback);
        return () => {
            r.removeListener(ipcListenerKeys[name], callback);
        };
    };
};

const ipcListeners = fromEntries(
    getValues(ipcListenerKeys).map(
        (v) =>
            [v, genIPCListener(v)] as {
                [T in keyof ipcListenerHandlersType]: [T, listenerReturnType<T>];
            }[keyof ipcListenerHandlersType],
    ),
);
contextBridge.exposeInMainWorld("ipcListeners", ipcListeners);

declare global {
    interface Window {
        ipcMethods: typeof ipcMethods;
        ipcListeners: typeof ipcListeners;
    }
}
