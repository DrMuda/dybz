/*
 * @Author: LXX
 * @Date: 2022-03-23 11:22:36
 * @LastEditTime: 2022-03-23 14:35:56
 * @LastEditors: LXX
 * @Description:
 * @FilePath: \dybz\01bzServerNodeJS\src\utils\OldNewKey.js
 */

 
const isFileExistedAndCreate = require("./isFileExistedAndCreate");
const fs = require("fs");
const fileName = "../oldNewKey.json";

class OldNewKey {

    oldNewKey = {};

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
                            this.oldNewKey = JSON.parse(data);
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
                            } else {
                                fs.writeFile(fileName, JSON.stringify(this.oldNewKey, null, 4), (e) => {
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
                                        this.oldNewKey = JSON.parse(data);
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
        return this.oldNewKey;
    }

    getByOldKey(oldKey) {
        return this.oldNewKey[oldKey];
    }

    async set(oldNewKey) {
        this.oldNewKey = oldNewKey;
        return await this._updateFile();
    }

    async setByOldKey(oldKey, newKey) {
        this.oldNewKey[oldKey] = newKey;
        return await this._updateFile();
    }
}

module.exports = new OldNewKey();
