import { rules } from "./webpack.rules"
import { plugins } from "./webpack.plugins"
import type { Configuration } from "webpack";

rules.push({
    test: /\.css$/,
    use: [{ loader: "style-loader"}, { loader: "css-loader"}],
});

export const rendererConfig: Configuration = {
    module: {
        rules,
    },
    plugins,
    resolve: {
        fallback: {
            fs: false,
            child_process: false,
        },
        extensions: [".js", ".ts", ".jsx", ".tsx", ".css"]
    }
}
