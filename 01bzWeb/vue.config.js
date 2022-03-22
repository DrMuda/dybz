/*
 * @Author: LXX
 * @Date: 2022-02-24 14:37:21
 * @LastEditTime: 2022-03-22 16:30:49
 * @LastEditors: LXX
 * @Description:
 * @FilePath: \dybz\01bzWeb\vue.config.js
 */

 const CompositionPlugin = require("compression-webpack-plugin")

module.exports = {
    publicPath: "/dybz",
    devServer: {
        proxy: {
            "/nodeApi": {
                target: "http://127.0.0.1:8010/",
                changeOrigin: true,
                pathRewrite: {
                    "/nodeApi": "",
                },
                logLevel: "debug",
            },
            "/pythonApi": {
                target: "http://127.0.0.1:8011/",
                changeOrigin: true,
                pathRewrite: {
                    "/pythonApi": "",
                },
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
    chainWebpack: (config) => {},
    configureWebpack: {
        plugins: [
            new CompositionPlugin({
                filename: "[path].gz[query]",
                algorithm: "gzip",
                test: new RegExp("\\.(js|css)$"),
                threshold: 10240,
                minRatio: 0.8,
                deleteOriginalAssets: false,
            }),
        ],
    },
};
