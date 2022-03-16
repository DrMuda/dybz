/*
 * @Author: LXX
 * @Date: 2022-03-16 11:37:42
 * @LastEditTime: 2022-03-16 14:21:38
 * @LastEditors: LXX
 * @Description:
 * @FilePath: \dybz\01bzServerNodeJS\src\urls.js
 */

const fs = require("fs");
const moment = require("moment");
const isFileExistedAndCreate = require("./utils/isFileExistedAndCreate.js");

function pushCache(req, res) {
    let originData = null;
    isFileExistedAndCreate("data.json").then(
        () => {
            fs.open("data.json", "r", (e, num) => {
                if (e) {
                    console.error(e);
                    res.send({ status: "readFileError1" });
                } else {
                    fs.readFile(
                        "data.json",
                        // 读取文件完成时调用的回调函数
                        function (e, data) {
                            if (e) {
                                console.error(e);
                                res.send({ status: "readFileError2" });
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
                                                    res.send({ status: "readFileError3" });
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
        },
        () => {
            res.send({ status: "readFileError4" });
        }
    );
}

function pullCache(req, res) {
    isFileExistedAndCreate("data.json").then(
        () => {
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
        },
        () => {
            res.send({ status: "readFileError" });
        }
    );
}

module.exports = {
    "/sync/pushCache": {
        method: "post",
        message: pushCache,
    },
    "/sync/pullCache": {
        method: "get",
        message: pullCache,
    },
};
