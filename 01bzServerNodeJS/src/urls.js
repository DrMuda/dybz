/*
 * @Author: LXX
 * @Date: 2022-03-16 11:37:42
 * @LastEditTime: 2022-03-23 17:00:14
 * @LastEditors: LXX
 * @Description:
 * @FilePath: \dybz\01bzServerNodeJS\src\urls.js
 */

const Users = require("./utils/Users.js");
const OldNewKey = require("./utils/OldNewKey.js");
const ImgAndChar = require("./utils/ImgAndChar.js");
const Log = require("./utils/Log")

async function pushCache(req, res) {
    const { oldNewKey, imgAndChar, user } = req.body?.data || {};
    const { userName, password } = req.body || {};
    Log.info(`pushCache: ${userName} ${password}`);
    if (user) {
        if (userName) {
            Users.setUser(userName, password, user).then((status) => {
                if (typeof status === "boolean") {
                    res.send({ status: status ? "success" : "file io fail" });
                } else {
                    res.send({ status });
                }
            });
        } else {
            res.send({ status: "user error" });
        }
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
}

async function pullCache(req, res) {
    const { userName, password } = req.query;
    Log.info(`pullCache: ${userName} ${password}`);
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
