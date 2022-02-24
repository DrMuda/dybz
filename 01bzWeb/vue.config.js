/*
 * @Author: LXX
 * @Date: 2022-02-24 14:37:21
 * @LastEditTime: 2022-02-24 17:03:35
 * @LastEditors: LXX
 * @Description:
 * @FilePath: \01bz\vue.config.js
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
            "/getPic": {
                target: "http://www.diyibanzhu111.xyz/",
                changeOrigin: true,
                pathRewrite: {},
                logLevel: "debug",
            },
        },
    },
};
