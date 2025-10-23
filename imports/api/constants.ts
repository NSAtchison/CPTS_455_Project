const assetProtocol = "asset://";
export const getAssetUri = <T extends string>(path: T) => `${assetProtocol}${path}` as const;
// I recommend avoiding magic strings as much as possible to make the code maintainable
// This is one way to do so by abstracting away as many strings as possible,
// keeping them together in one place, and not using strings directly within the codebase
export const images = {
    testImage: getAssetUri("images/TEST.png"),
    testImage2: getAssetUri("TEST.jpg"),
} as const;

export const isRenderer = () => {
    if (!process.type) return true;
    return process.type === "renderer";
};

export const ports = {
    TCPServerPort: 0,
    discoveryPort: 41234,
    discoveryInternal: 3000,
}

export const forceIpcType = <T extends Record<string,(event: Electron.IpcMainInvokeEvent, arguments_: any) => Promise<any>>,>(v: T,) => v;

export const routes = {
    mainPage: "/mainPage/",
} as const;

export type SetState<T> = React.Dispatch<React.SetStateAction<T>>;