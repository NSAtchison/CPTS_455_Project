// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import type { ForgeConfig } from "@electron-forge/shared-types"
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { WebpackPlugin } from "@electron-forge/plugin-webpack";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";
import * as path from "path";
import { mainConfig } from "./webpack.main.config";
import { rendererConfig } from "./webpack.renderer.config";
import MakerDMG from "@electron-forge/maker-dmg";

const config: ForgeConfig = {
    packagerConfig: {
        icon: path.resolve("./assets/icons/icon"), // no file extension required https://www.electronforge.io/guides/create-and-add-icons
        extraResource: [path.resolve("./assets/")],
    },
    rebuildConfig: {},
    makers: [
        new MakerSquirrel({
            setupIcon: path.resolve("./assets/icons/setup.ico"),
        }),
        new MakerZIP({}, ["darwin"]),
        new MakerRpm({}),
        new MakerDeb({}),
        new MakerDMG({
            background: path.resolve("./assets/TEST.jpg"),
            format: "ULFO",
            appPath: path.resolve("./"),
            icon: path.resolve("./assets/icons/setup.ico"),
        }),
    ],
    plugins: [
        new WebpackPlugin({
            mainConfig,
            devContentSecurityPolicy: "default-src 'self' 'unsafe-eval' 'unsafe-inline' asset: http: https: ws: data: blob:", // This is for static assets
            renderer: {
                config: rendererConfig,
                entryPoints: [
                    {
                        html: path.resolve("./src/index.html"),
                        js: path.resolve("./src/renderer.ts"),
                        name: "main_window",
                        preload: {
                            js: path.resolve("./src/preload.ts"),
                        },
                    },
                ],
            },
            // Change these for multiple testing instances
            port: 3002,
            loggerPort: 9002
        }),
        // Fuses are used to enable/disable various Electron functionality
        // at package time, before code signing the application
        // Should try to re-enable these when possible for security reasons.
        new FusesPlugin({
            version: FuseVersion.V1,
            [FuseV1Options.RunAsNode]: true,
            // [FuseV1Options.EnableCookieEncryption]: true,
            // [FuseV1Options.EnableNodeOptionsEnviromentVariable]: true,
            // [FuseV1Options.EnableNodeCliInspectArguments]: true,
            // [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
            // [FuseV1Options.OnlyLoadAppFromAsar]: true,
        }),
    ],
};

export default config;