/*
 * @Author: LXX
 * @Date: 2022-03-23 16:44:47
 * @LastEditTime: 2022-03-23 17:19:39
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
    append(message) {
        isFileExistedAndCreate(fileName, `创建日志文件${moment().format(timeFomat)}`).then((isExist) => {
            if (isExist) {
                fs.open(fileName, "r", (e) => {
                    if (e) {
                        console.error(`日志读取有误：${fileName}`);
                    } else {
                        fs.readFile(fileName, (e, data) => {
                            if (e) {
                                console.error(`日志读取有误：${fileName}`);
                            } else {
                                fs.writeFile(fileName, data + "\r\n" + message, (e) => {
                                    if (e) {
                                        console.error(`日志写入失败：${fileName}`);
                                        console.error(e);
                                    } else {
                                        console.log(`日志写入成功：${fileName}`);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    error(message) {
        let _message = `error(${moment().format(timeFomat)}): ${message}`;
        console.error(_message);
        this.append(_message);
    }

    info(message) {
        let _message = `info(${moment().format(timeFomat)}): ${message}`;
        console.log(_message);
        this.append(_message);
    }

    warn(message) {
        let _message = `warn(${moment().format(timeFomat)}): ${message}`;
        console.warn(_message);
        this.append(_message);
    }
}

module.exports = new Log();
