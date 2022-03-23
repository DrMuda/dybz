/*
 * @Author: LXX
 * @Date: 2022-03-23 16:44:47
 * @LastEditTime: 2022-03-23 17:41:26
 * @LastEditors: LXX
 * @Description:
 * @FilePath: \dybz\01bzServerNodeJS\src\utils\log.js
 */
const isFileExistedAndCreate = require("./isFileExistedAndCreate");
const fs = require("fs");
const fileName = "../nodeServerLog.txt";
const moment = require("moment");
const timeFomat = "YYYY-MM-DD HH:mm:ss x";

class Log {
    list = [];
    constructor() {
        setInterval(async () => {
            for (; this.list.length > 0; ) {
                await this.append(this.list.shift());
            }
        }, 5000);
    }
    append(message) {
        return new Promise((resolve) => {
            isFileExistedAndCreate(fileName, `创建日志文件${moment().format(timeFomat)}`).then((isExist) => {
                if (isExist) {
                    fs.open(fileName, "r", (e, fd) => {
                        if (e) {
                            console.error(`日志读取有误：${fileName}`);
                            fs.close(fd, resolve);
                        } else {
                            fs.readFile(fileName, (e, data) => {
                                if (e) {
                                    console.error(`日志读取有误：${fileName}`);
                                    fs.close(fd, resolve);
                                } else {
                                    fs.writeFile(fileName, data + "\r\n" + message, (e) => {
                                        if (e) {
                                            console.error(`日志写入失败：${fileName}`);
                                            console.error(e);
                                            fs.close(fd, resolve);
                                        } else {
                                            console.log(`日志写入成功：${fileName}`);
                                            fs.close(fd, resolve);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        });
    }

    error(message) {
        let _message = `error(${moment().format(timeFomat)}): ${message}`;
        console.error(_message);
        this.list.push(_message);
    }

    info(message) {
        let _message = `info(${moment().format(timeFomat)}): ${message}`;
        console.log(_message);
        this.list.push(_message);
    }

    warn(message) {
        let _message = `warn(${moment().format(timeFomat)}): ${message}`;
        console.warn(_message);
        this.list.push(_message);
    }
}

module.exports = new Log();
