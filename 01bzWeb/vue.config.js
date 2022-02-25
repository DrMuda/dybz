/*
 * @Author: LXX
 * @Date: 2022-02-24 14:37:21
 * @LastEditTime: 2022-02-25 17:23:13
 * @LastEditors: LXX
 * @Description:
 * @FilePath: \dybz\01bzWeb\vue.config.js
 */

module.exports = {
    devServer: {
        proxy: {
            "/getHtml": {
                target: "http://127.0.0.1:8010/",
                changeOrigin: true,
                pathRewrite: {},
                logLevel: "debug",
            },
            "/getImg": {
                target: "http://127.0.0.1:8010/",
                changeOrigin: true,
                pathRewrite: {},
                logLevel: "debug",
            },
        },
    },
};
