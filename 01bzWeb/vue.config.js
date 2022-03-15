/*
 * @Author: LXX
 * @Date: 2022-02-24 14:37:21
 * @LastEditTime: 2022-03-15 17:26:58
 * @LastEditors: LXX
 * @Description:
 * @FilePath: \dybz\01bzWeb\vue.config.js
 */

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
};
