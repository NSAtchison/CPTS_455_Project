// This is only run in the main process
import { forceIpcType } from "../imports/api/constants"

////////////////////////////////////////////////////////////////////////////////////////////
// This implements patters two and three from
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

// Implementation of the ipcMethods. Event is always first, that whatever custom args.
// This is the ONLY PLACE node imports (or imports with ndoe imports) are allowed on render side.
// See the example method as a demo of this pattern.
export const ipcMethodHandlers = forceIpcType({
    exampleMethod: async (event, argument1: string) => {
        console.log("This is run in the main process", event, argument1);
        const { homedir } = await import("os");
        return argument1 + "Called On Main where homedir is: " + homedir();
    },
    exampleMethod2: async (
        event,
        { argument1, argument2 }: {argument1: string, argument2: number},
    ) => {
        console.log("This is run in the main process", event, argument1);
        const { homedir } = await import("os");
        return (argument1 + argument2 + "Called On Main where homedir is: " + homedir());
    },
} as const);

export type ipcMethodHandlersType = typeof ipcMethodHandlers;
