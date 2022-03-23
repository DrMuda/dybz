/*
 * @Author: LXX
 * @Date: 2022-03-16 14:16:18
 * @LastEditTime: 2022-03-23 10:54:56
 * @LastEditors: LXX
 * @Description:
 * @FilePath: \dybz\01bzServerNodeJS\src\utils\isFileExistedAndCreate.js
 */

const fs = require("fs");
module.exports = function (path_way, defaultData = "") {
    return new Promise((resolve, reject) => {
        fs.access(path_way, (err) => {
            if (err) {
                fs.appendFile(path_way, defaultData, "utf-8", (err) => {
                    if (err) {
                        console.log("该文件不存在，重新创建失败！");
                        reject(false);
                    } else {
                        console.log("文件不存在，已重新创建");
                        resolve(true);
                    }
                });
            } else {
                resolve(true);
            }
        });
    });
};
