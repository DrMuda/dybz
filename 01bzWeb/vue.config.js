/*
 * @Author: LXX
 * @Date: 2022-02-24 14:37:21
 * @LastEditTime: 2022-03-14 14:26:39
 * @LastEditors: LXX
 * @Description:
 * @FilePath: \dybz\01bzWeb\vue.config.js
 */

module.exports = {
    publicPath: "/dybz",
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
            "/sync": {
                target: "http://127.0.0.1:8081/",
                changeOrigin: true,
                pathRewrite: {},
                logLevel: "debug",
            },
            "/baiduocr": {
                target: "https://aip.baidubce.com/",
                changeOrigin: true,
                pathRewrite: {
                    "/baiduocr": "/rest/2.0/ocr/v1",
                },
            },
        },
    },
};
