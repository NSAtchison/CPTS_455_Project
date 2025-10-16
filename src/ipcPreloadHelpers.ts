// This is only run in the main process
import type { ipcMethodHandlersType } from "./ipcMethods";
import type { ipcListenerHandlersType } from "./ipcListeners";

////////////////////////////////////////////////////////////////////////////////////////////
// This implements patterns two and three from
// https://www.electronjs.org/docs/latest/tutorial/ipc#pattern2-renderer-to-main-two-way
//
// I'm using the meteor terminology of method, specializing it into ipcMethod.
// They allow the render process to call funcs in main process
// ipcListeners allow the main process to call methods in render using listeners
////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////
// ipcMethodHandlers are called from a render process to the main process, run in the main process,
// then the result is returned to the render process
//
// If you want to add or update an ipcMethodHandler. Typescript will error if done wrong.
// 1) Update ipcMethodHandlers in ./ipcMethods.ts with the functionality that should happen on call
// 2) Update the below constants to match the new set of keys
// 3) Update the rest of your codebase accordingly. Typescript will assist.
////////////////////////////////////////////////////////////////////////////////////////////

// These are the strings used under the hood. The values always match the keys.
// There should be exactly one entry for each listenerHandler in the above type.
export const ipcMethodKeys: { [P in keyof ipcMethodHandlersType]: P} = {
    exampleMethod: "exampleMethod",
    exampleMethod2: "exampleMethod2",
};

////////////////////////////////////////////////////////////////////////////////////////////
// ipcListeners send messages from main to a renderer using an emitter
// which the render process wil subscribe to with a handler
//
// If you want to add or update an ipcListener. Typescript will error if done wrong.
// 1) Update ipcListenerHandlersType with the API you want
// 2) Update the appropriate key in ipcListenerKeys
// 3) Update the rest of your codebase accordingly. Typescript will assist.
////////////////////////////////////////////////////////////////////////////////////////////

// These are the strings used under the hood. The values always match the keys.
// There should be exactly one entry for each listenerHandler in the above type.
export const ipcListenerKeys: { [P in keyof ipcListenerHandlersType]: P} = {
    testListener: "testListener",
};