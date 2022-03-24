/*
 * @Author: LXX
 * @Date: 2022-03-23 11:22:36
 * @LastEditTime: 2022-03-24 15:51:51
 * @LastEditors: LXX
 * @Description:
 * @FilePath: \dybz\01bzServerNodeJS\src\utils\OldNewKey.js
 */

const isFileExistedAndCreate = require("./isFileExistedAndCreate");
const fs = require("fs");
const fileName = "../oldNewKey.json";
const Log = require("./Log");

class OldNewKey {
    oldNewKey = {};
    hasNewData = false;

    constructor() {
        this._init();
        setInterval(() => {
            if (this.hasNewData) {
                this._updateFile();
            }
        }, 5000);
    }

    async _init() {
        const isExist = await isFileExistedAndCreate(fileName, "{}");
        if (isExist) {
            fs.open(fileName, "r", (e) => {
                if (e) {
                    Log.error(`文件读取有误：${fileName}`);
                } else {
                    fs.readFile(fileName, (e, data) => {
                        if (e) {
                            Log.error(`文件读取有误：${fileName}`);
                        } else {
                            this.oldNewKey = JSON.parse(data);
                        }
                    });
                }
            });
        } else {
            Log.error(`文不存在且创建失败：${fileName}`);
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
                                Log.error(`文件读取有误：${fileName}`);
                            } else {
                                fs.writeFile(fileName, JSON.stringify(this.oldNewKey, null, 4), (e) => {
                                    if (e) {
                                        Log.error(`文件写入失败：${fileName}`);
                                        Log.error(e);
                                        reject(false);
                                    } else {
                                        Log.info(`文件写入成功：${fileName}`);
                                        this.hasNewData = false;
                                        resolve(true);
                                    }
                                });
                            }
                        });
                    } else {
                        fs.open(fileName, "r", (e) => {
                            if (e) {
                                Log.error(`文件读取有误：${fileName}`);
                                reject(false);
                            } else {
                                fs.readFile(fileName, (e, data) => {
                                    if (e) {
                                        Log.error(`文件读取有误：${fileName}`);
                                        reject(false);
                                    } else {
                                        this.oldNewKey = JSON.parse(data);
                                        Log.info(`已更新内存数据：${fileName}`);
                                        resolve(true);
                                    }
                                });
                            }
                        });
                    }
                } else {
                    Log.error(`文不存在且创建失败：${fileName}`);
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
        this.hasNewData = true;
        return true;
        // return await this._updateFile();
    }

    async setByOldKey(oldKey, newKey) {
        this.oldNewKey[oldKey] = newKey;
        this.hasNewData = true;
        return true;
        // return await this._updateFile();
    }
}

module.exports = new OldNewKey();
