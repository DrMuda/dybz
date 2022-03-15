/*
 * @Author: LXX
 * @Date: 2022-03-15 16:26:48
 * @LastEditTime: 2022-03-15 17:27:49
 * @LastEditors: LXX
 * @Description:
 * @FilePath: \dybz\01bzServerNodeJS\webpack.config.js
 */
const path = require("path");

module.exports = {
    entry: "./app.js",
    mode: "production",
    target:"node",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "app.js",
    },
    resolve: {
        fallback: {
            fs: "empty",
            net: "empty",
        },
    },
};
