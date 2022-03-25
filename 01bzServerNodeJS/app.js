/*
 * @Author: LXX
 * @Date: 2022-03-14 09:33:39
 * @LastEditTime: 2022-03-25 11:04:28
 * @LastEditors: LXX
 * @Description:
 * @FilePath: \dybz\01bzServerNodeJS\app.js
 */
const express = require("express");
const bodyParser = require("body-parser");
const urls = require("./src/urls.js");

const app = express();
// 解析 application/json
app.use(bodyParser.json({ limit: "50mb" }));
// 解析 application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

Object.keys(urls).forEach((path) => {
    const { method, message } = urls[path];
    switch (method) {
        case "post": {
            app.post(path, message);
            break;
        }
        default: {
            app.get(path, message);
        }
    }
});

const server = app.listen(8010, function () {
    const host = server.address().address;
    const port = server.address().port;

    console.log("应用实例，访问地址为 http://%s:%s", host, port);
});
