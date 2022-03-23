/*
 * @Author: LXX
 * @Date: 2022-03-23 10:41:28
 * @LastEditTime: 2022-03-23 15:59:07
 * @LastEditors: LXX
 * @Description:
 * @FilePath: \dybz\01bzServerNodeJS\src\utils\Users.js
 */
// interface Novel {
//     id: string | undefined | null;
//     url: string | undefined | null;
//     name: string | undefined | null;
//     history: {
//         title: string | undefined | null;
//         url: string | undefined | null;
//     };
//     firstChapter: {
//         title: string | undefined | null;
//         url: string | undefined | null;
//     };
// }

// interface User {
//     novelList: Array<Novel>;
//     ocrToken: string | undefined | null;
//     password: string;
//     lastUpdate: string;
// }

const isFileExistedAndCreate = require("./isFileExistedAndCreate");
const fs = require("fs");
const moment = require("moment");
const fileName = "../users.json";

class Users {
    users = {};

    constructor() {
        this._init();
    }

    async _init() {
        const isExist = await isFileExistedAndCreate(fileName, "{}");
        if (isExist) {
            fs.open(fileName, "r", (e) => {
                if (e) {
                    console.error(`文件读取有误：${fileName}`);
                } else {
                    fs.readFile(fileName, (e, data) => {
                        if (e) {
                            console.error(`文件读取有误：${fileName}`);
                        } else {
                            this.users = JSON.parse(data);
                        }
                    });
                }
            });
        } else {
            console.error(`文不存在且创建失败：${fileName}`);
        }
    }

    // 将数据更新到文件或从文件更新到内存
    async _updateFile(reverse = false) {
        return new Promise((resolve, reject) => {
            isFileExistedAndCreate(fileName, "{}").then((isExist) => {
                if (isExist) {
                    if (!reverse) {
                        fs.open(fileName, "r", (e) => {
                            if (e) {
                                console.error(`文件读取有误：${fileName}`);
                                reject(false);
                            } else {
                                fs.writeFile(fileName, JSON.stringify(this.users, null, 4), (e) => {
                                    if (e) {
                                        console.error(`文件写入失败：${fileName}`);
                                        console.error(e);
                                        reject(false);
                                    } else {
                                        console.log(`文件写入成功：${fileName}`);
                                        resolve(true);
                                    }
                                });
                            }
                        });
                    } else {
                        fs.open(fileName, "r", (e) => {
                            if (e) {
                                console.error(`文件读取有误：${fileName}`);
                                reject(false);
                            } else {
                                fs.readFile(fileName, (e, data) => {
                                    if (e) {
                                        console.error(`文件读取有误：${fileName}`);
                                        reject(false);
                                    } else {
                                        this.users = JSON.parse(data);
                                        console.log(`已更新内存数据：${fileName}`);
                                        resolve(true);
                                    }
                                });
                            }
                        });
                    }
                } else {
                    console.error(`文不存在且创建失败：${fileName}`);
                    reject(false);
                }
            });
        });
    }

    get() {
        return this.users;
    }

    getUser(id, password) {
        if (this.users[id]) {
            if (this.users[id].password === password) {
                return this.users[id];
            }
            return "user error";
        }
        return "not exist";
    }

    async set(users) {
        this.users = users;
        return await this._updateFile();
    }

    async setUser(id, password, user) {
        if (this.users[id]) {
            if (this.users[id].password === password) {
                this.users[id] = { ...user, password, lastUpdate: moment().format("YYYY-MM-dd HH:mm:ss") };
                return await this._updateFile();
            }
            return "user error";
        } else {
            this.users[id] = { ...user, password, lastUpdate: moment().format("YYYY-MM-dd HH:mm:ss") };
            return await this._updateFile();
        }
    }
}

module.exports = new Users();
