/*
 * @Author: LXX
 * @Date: 2022-03-14 09:33:39
 * @LastEditTime: 2022-03-14 17:53:13
 * @LastEditors: LXX
 * @Description:
 * @FilePath: \dybz\01bzServerNodeJS\app.js
 */
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const moment = require("moment");

const app = express();
// 解析 application/json
app.use(bodyParser.json());
// 解析 application/x-www-form-urlencoded
app.use(bodyParser.urlencoded());

/**
 * @description:
 * @query {string} userName, password
 * @data {json} {data: {imgMapChar,user}}
 * @return {*}
 */
app.post("/sync/pushCache", function (req, res) {
    let originData = null;
    fs.open("data.json", "r", (e, num) => {
        if (e) {
            console.error(e);
            res.send({ status: "readFileError" });
        } else {
            fs.readFile(
                "data.json",
                // 读取文件完成时调用的回调函数
                function (e, data) {
                    if (e) {
                        console.error(e);
                        res.send({ status: "readFileError" });
                    } else {
                        try {
                            originData = JSON.parse(data);
                        } catch (error) {
                            console.log("数据有问题:", data);
                            originData = {};
                        } finally {
                            const { userName, password } = req.body;
                            const foundUser = {};
                            if (originData.users) {
                                Object.keys(originData.users).forEach((userNameTemp) => {
                                    if (userNameTemp === userName) {
                                        foundUser.name = userName;
                                        foundUser.password = originData.users[userName].password;
                                    }
                                });
                            }
                            // 如果有合适的user，或者没有这个user，那就写入，当存在密码错误时， 不允许写入
                            if ((foundUser.name && foundUser.password === password) || !foundUser.name) {
                                console.log(originData.users);
                                fs.writeFile(
                                    "data.json",
                                    JSON.stringify(
                                        {
                                            imgMapChar: {
                                                ...originData.imgMapChar,
                                                ...req.body.data.imgMapChar,
                                            },
                                            users: {
                                                ...originData.users,
                                                [userName]: {
                                                    ...req.body.data.user,
                                                    password,
                                                    lastUpdate: moment().format("YYYY-MM-DD HH:mm:ss"),
                                                },
                                            },
                                        },
                                        null,
                                        4
                                    ),
                                    (e) => {
                                        if (e) {
                                            console.error(e);
                                            res.send({ status: "readFileError" });
                                        } else {
                                            res.send({ status: "success" });
                                        }
                                    }
                                );
                            } else {
                                res.send({ status: "userError" });
                            }
                        }
                    }
                }
            );
        }
    });
});

/**
 * @description:
 * @query {string} userName, password
 * @return {*}
 */
app.get("/sync/pullCache", function (req, res) {
    fs.open("data.json", "r", (e, num) => {
        if (e) {
            console.error(e);
            res.send({ status: "readFileError" });
        } else {
            fs.readFile(
                "data.json",
                // 读取文件完成时调用的回调函数
                function (e, data) {
                    if (e) {
                        console.error(e);
                        res.send({ status: "readFileError" });
                    } else {
                        let originData = null;
                        try {
                            originData = JSON.parse(data);
                        } catch (error) {
                            console.log("数据有问题:", data);
                            originData = {};
                        } finally {
                            const { userName, password } = req.query;
                            const foundUser = {};
                            if (originData.users) {
                                Object.keys(originData.users).forEach((userNameTemp) => {
                                    if (userNameTemp === userName) {
                                        foundUser.name = userName;
                                        foundUser.password = originData.users[userName].password;
                                    }
                                });
                            }
                            if (foundUser.name && foundUser.password === password) {
                                res.send({
                                    status: "success",
                                    imgMapChar: originData.imgMapChar || {},
                                    user: originData.users[userName] || {},
                                });
                            } else {
                                res.send({ status: "userError" });
                            }
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
