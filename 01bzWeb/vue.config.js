/*
 * @Author: LXX
 * @Date: 2022-02-24 14:37:21
 * @LastEditTime: 2022-03-31 17:45:13
 * @LastEditors: LXX
 * @Description:
 * @FilePath: \dybz\01bzWeb\vue.config.js
 */

module.exports = {
    publicPath: "/dybz",
    productionSourceMap: false,
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
    chainWebpack: (config) => {
        config.when(process.env.NODE_ENV !== "development", (config) => {
            config
                .plugin("CompressionPlugin")
                .use("compression-webpack-plugin", [
                    {
                        test: /\.js$|\.css$|\.html$/, // gzip压缩规则
                        threshold: 10240, // 大于10K的数据会被压缩
                        algorithm: "gzip", // 压缩方式
                        minRatio: 0.8, // 压缩比小于这个的才压缩
                    },
                ])
                .end();
        });
    },
};
