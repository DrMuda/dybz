/*
 * @Author: LXX
 * @Date: 2022-02-24 14:37:21
 * @LastEditTime: 2022-03-03 10:40:04
 * @LastEditors: LXX
 * @Description:
 * @FilePath: \dybz\01bzWeb\vue.config.js
 */

module.exports = {
    devServer: {
        proxy: {
            "/getNovelHtml": {
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
            "/getChapter": {
                target: "http://127.0.0.1:8010/",
                changeOrigin: true,
                pathRewrite: {},
                logLevel: "debug",
            },
        },
    },
};
