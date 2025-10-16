/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable unicorn/prefer-module */
/* eslint-disable @typescript-eslint/no-var-requires */
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
// Store static assets in .webpack location when built for static reference at runtime
// Right nowthe only folder that will get moved is the static folder
const assetFolders = ["assets"]
const copyPlugins = new CopyWebpackPlugin({
    patterns: assetFolders.map((asset) => ({
        from: path.resolve(__dirname, asset),
        to: path.resolve(__dirname, ".webpack/renderer", asset)
    })),
});

export const plugins = [
    new ForkTsCheckerWebpackPlugin(),
    copyPlugins,
    // https://thecodersblog.com/polyfill-node-core-modules-webpack-5
    new NodePolyfillPlugin()
]