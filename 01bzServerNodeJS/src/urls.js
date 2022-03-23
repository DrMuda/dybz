/*
 * @Author: LXX
 * @Date: 2022-03-16 11:37:42
 * @LastEditTime: 2022-03-23 15:10:05
 * @LastEditors: LXX
 * @Description:
 * @FilePath: \dybz\01bzServerNodeJS\src\urls.js
 */

const fs = require("fs");
const moment = require("moment");
const isFileExistedAndCreate = require("./utils/isFileExistedAndCreate.js");
const Users = require("./utils/Users.js");
const OldNewKey = require("./utils/OldNewKey.js");
const ImgAndChar = require("./utils/ImgAndChar.js");

async function pushCache(req, res) {
    const { oldNewKey, imgAndChar, user, userName, password } = req.body?.data || {};
    if (user) {
        Users.setUser(userName, password, user).then((status) => {
            if (typeof status === "boolean") {
                res.send({ status: status ? "success" : "file io fail" });
            } else {
                res.send({ status });
            }
        });
    }
    if (imgAndChar) {
        ImgAndChar.set({
            ...ImgAndChar.get(),
            ...imgAndChar,
        });
    }
    if (oldNewKey) {
        OldNewKey.set({
            ...OldNewKey.get(),
            ...oldNewKey,
        });
    }
    // let originData = null;

    // isFileExistedAndCreate("data.json").then(
    //     () => {
    //         fs.open("data.json", "r", (e, num) => {
    //             if (e) {
    //                 console.error(e);
    //                 res.send({ status: "readFileError1" });
    //                 return;
    //             } else {
    //                 fs.readFile(
    //                     "data.json",
    //                     // 读取文件完成时调用的回调函数
    //                     function (e, data) {
    //                         if (e) {
    //                             console.error(e);
    //                             res.send({ status: "readFileError2" });
    //                             return;
    //                         } else {
    //                             try {
    //                                 originData = JSON.parse(data);
    //                             } catch (error) {
    //                                 console.error("数据有问题:", data);
    //                                 originData = {};
    //                             } finally {
    //                                 const newData = {
    //                                     ...originData,
    //                                     imgAndChar: {
    //                                         ...originData.imgAndChar,
    //                                         ...req.body.data.imgAndChar,
    //                                     },
    //                                 };
    //                                 const { userName, password } = req.body;
    //                                 const foundUser = {};
    //                                 if (originData.users) {
    //                                     Object.keys(originData.users).forEach((userNameTemp) => {
    //                                         if (userNameTemp === userName) {
    //                                             foundUser.name = userName;
    //                                             foundUser.password = originData.users[userName].password;
    //                                         }
    //                                     });
    //                                 }
    //                                 // 如果有合适的user，或者没有这个user，那就写入，当存在密码错误时， 不允许写入
    //                                 if ((foundUser.name && foundUser.password === password) || !foundUser.name) {
    //                                     newData.users = {
    //                                         ...newData.users,
    //                                         [userName]: {
    //                                             ...req.body.data.user,
    //                                             password,
    //                                             lastUpdate: moment().format("YYYY-MM-DD HH:mm:ss"),
    //                                         },
    //                                     };
    //                                     fs.writeFile("data.json", JSON.stringify(newData, null, 4), (e) => {
    //                                         if (e) {
    //                                             console.error(e);
    //                                             res.send({ status: "readFileError3" });
    //                                             return;
    //                                         } else {
    //                                             res.send({ status: "success" });
    //                                             return;
    //                                         }
    //                                     });
    //                                 } else {
    //                                     res.send({ status: "userError" });
    //                                     return;
    //                                 }
    //                             }
    //                         }
    //                     }
    //                 );
    //             }
    //         });
    //     },
    //     () => {
    //         res.send({ status: "readFileError4" });
    //         return;
    //     }
    // );
}

async function pullCache(req, res) {
    const { userName, password } = req.query;
    console.log(`pullCache: ${userName} ${password}`);
    const user = await Users.getUser(userName, password);
    const oldNewKey = await OldNewKey.get();
    const imgAndChar = await ImgAndChar.get();
    const data = { status: undefined, imgAndChar, user, oldNewKey };
    if (typeof user === "string") {
        data.user = null;
        data.status = user;
    } else {
        data.status = "success";
    }
    res.send(data);

    // isFileExistedAndCreate("data.json").then(
    //     () => {
    //         fs.open("data.json", "r", (e, num) => {
    //             if (e) {
    //                 console.error(e);
    //                 res.send({ status: "readFileError" });
    //                 return;
    //             } else {
    //                 fs.readFile(
    //                     "data.json",
    //                     // 读取文件完成时调用的回调函数
    //                     function (e, data) {
    //                         if (e) {
    //                             console.error(e);
    //                             res.send({ status: "readFileError" });
    //                             return;
    //                         } else {
    //                             let originData = null;
    //                             try {
    //                                 originData = JSON.parse(data);
    //                             } catch (error) {
    //                                 console.error("数据有问题:", data);
    //                                 originData = {};
    //                             } finally {
    //                                 const { userName, password } = req.query;
    //                                 const foundUser = {};
    //                                 if (originData.users) {
    //                                     Object.keys(originData.users).forEach((userNameTemp) => {
    //                                         if (userNameTemp === userName) {
    //                                             foundUser.name = userName;
    //                                             foundUser.password = originData.users[userName].password;
    //                                         }
    //                                     });
    //                                 }
    //                                 if (foundUser.name && foundUser.password === password) {
    //                                     res.send({
    //                                         status: "success",
    //                                         imgAndChar: originData.imgAndChar || {},
    //                                         user: originData.users[userName] || {},
    //                                     });
    //                                     return;
    //                                 } else {
    //                                     res.send({ status: "userError" });
    //                                     return;
    //                                 }
    //                             }
    //                         }
    //                     }
    //                 );
    //             }
    //         });
    //     },
    //     () => {
    //         res.send({ status: "readFileError" });
    //         return;
    //     }
    // );
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
