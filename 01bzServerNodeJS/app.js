const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const moment = require("moment");

const app = express();
// 解析 application/json
app.use(bodyParser.json());
// 解析 application/x-www-form-urlencoded
app.use(bodyParser.urlencoded());

app.post("/sync/pushCache", function (req, res) {
    let originData = null;
    fs.open("data.json", "w+", (e, num) => {
        if (e) {
            console.error(e);
            res.send("error");
        } else {
            fs.readFile(
                "data.json",
                // 读取文件完成时调用的回调函数
                function (err, data) {
                    if (e) {
                        console.error(e);
                        res.send("error");
                    } else {
                        try {
                            originData = JSON.parse(data);
                        } catch (error) {
                            originData = {};
                        } finally {
                            fs.writeFile(
                                "data.json",
                                JSON.stringify(
                                    {
                                        imgMapChar: {
                                            ...originData.imgMapChar,
                                            ...req.body.data.imgMapChar,
                                        },
                                        users: {
                                            drMuda: { ...originData.users, ...req.body.data.user, lastUpdate: moment().format("YYYY-MM-DD HH:mm:ss") },
                                        },
                                    },
                                    null,
                                    4
                                ),
                                (e) => {
                                    if (e) {
                                        console.error(e);
                                        res.send("error");
                                    } else {
                                        res.send("success");
                                    }
                                }
                            );
                        }
                    }
                }
            );
        }
    });
});
app.get("/sync/pullCache", function (req, res) {
    fs.open("data.json", "r", (e, num) => {
        if (e) {
            console.error(e);
            res.send("error");
        } else {
            fs.readFile(
                "data.json",
                // 读取文件完成时调用的回调函数
                function (err, data) {
                    if (e) {
                        console.error(e);
                        res.send("error");
                    } else {
                        let originData = null;
                        try {
                            originData = JSON.parse(data);
                        } catch (error) {
                            originData = {};
                        } finally {
                            res.send({
                                imgMapChar: originData.imgMapChar || {},
                                user: originData.users.drMuda || {},
                            });
                        }
                    }
                }
            );
        }
    });
});

const server = app.listen(8081, function () {
    const host = server.address().address;
    const port = server.address().port;

    console.log("应用实例，访问地址为 http://%s:%s", host, port);
});
