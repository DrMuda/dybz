/*
 * @Author: LXX
 * @Date: 2022-03-22 11:21:46
 * @LastEditTime: 2022-04-15 17:50:57
 * @LastEditors: LXX
 * @Description:
 * @FilePath: \dybz\01bzWeb\src\utils\syncCache.js
 */

import ImgAndChar from "./ImgAndChar";
import { ElMessage, ElMessageBox } from "element-plus";
import moment from "moment";
import * as services from "@/service/index.js";

// 分块上传ImgAndChar
async function blockPushImgAndChar(imgAndChar) {
    let block = {};
    const keys = Object.keys(imgAndChar);
    for (let index = 1; index <= keys.length; index += 1) {
        const key = keys[index];
        block[key] = imgAndChar[key];
        if (index % 100 === 0) {
            await services.pushCache({ data: { imgAndChar: block } });
            block = {};
        }
    }
    services.pushCache({ data: { imgAndChar: block } });
}

// 分块上传OldNewKey
async function blockPushOldNewKey(oldNewKey) {
    let block = {};
    const keys = Object.keys(oldNewKey);
    for (let index = 0; index < keys.length; index += 1) {
        const key = keys[index];
        block[key] = oldNewKey[key];
        if ((index + 1) % 300 === 0) {
            await services.pushCache({ data: { oldNewKey: block } });
            block = {};
        }
    }
    services.pushCache({ data: { oldNewKey: block } });
}

function pullImgAndChar(page = 1, size = 100) {
    services.pullImgAndChar(page, size).then((res) => {
        const { status, imgAndChar, page, totalPage } = res.data || {};
        if (status === "success") {
            ImgAndChar.set({ ...ImgAndChar.get(), ...imgAndChar });
            if (page < totalPage) {
                pullImgAndChar(page + 1, size);
            }
        }
    });
}

function pullOldNewKey(page = 1, size = 300) {
    services.pullOldNewKey(page, size).then((res) => {
        const { status, oldNewKey, page, totalPage } = res.data || {};
        if (status === "success") {
            let tempOldNewKey = null;
            try {
                tempOldNewKey = JSON.parse(localStorage.getItem("oldNewKey") || {});
            } catch (e) {
                tempOldNewKey = {};
            }
            tempOldNewKey = {
                ...tempOldNewKey,
                ...oldNewKey,
            };
            localStorage.setItem("oldNewKey", JSON.stringify(tempOldNewKey));
            if (page < totalPage) {
                pullOldNewKey(page + 1, size);
            }
        }
    });
}

export default {
    pushCache() {
        return new Promise((resolve) => {
            ElMessage({
                type: "info",
                message: "上传数据中...",
                duration: 1000,
                showClose: true,
            });
            let tempImgAndChar = ImgAndChar.get();
            let imgAndChar = {};
            // 筛选已设值的数据
            imgAndChar &&
                Object.keys(tempImgAndChar).forEach((key) => {
                    if (tempImgAndChar[key].char) {
                        imgAndChar[key] = tempImgAndChar[key];
                    }
                });
            let novelList = null;
            let ocrToken = null;
            let oldNewKey = null;
            try {
                novelList = JSON.parse(localStorage.getItem("novelList") || {});
            } catch (e) {
                novelList = {};
            }
            try {
                oldNewKey = localStorage.getItem("oldNewKey") || "{}";
            } catch (e) {
                oldNewKey = "{}";
            }
            oldNewKey = JSON.parse(oldNewKey);

            try {
                ocrToken = localStorage.getItem("ocrToken") || "";
            } catch (e) {
                ocrToken = "";
            }
            services
                .pushCache({
                    data: {
                        user: {
                            novelList,
                            ocrToken,
                        },
                    },
                })
                .then(
                    (res) => {
                        if (res.data.status === "success") {
                            ElMessage({
                                type: "success",
                                message: "上传成功",
                                duration: 1000,
                                showClose: true,
                            });
                        } else {
                            ElMessage({
                                type: "error",
                                message: "上传失败",
                                duration: 1000,
                                showClose: true,
                            });
                        }

                        blockPushImgAndChar(imgAndChar);
                        blockPushOldNewKey(oldNewKey);
                        resolve();
                    },
                    (res) => {
                        ElMessage({
                            type: "error",
                            message: "上传失败",
                            duration: 1000,
                            showClose: true,
                        });
                        console.error(res);

                        blockPushImgAndChar(imgAndChar);
                        blockPushOldNewKey(oldNewKey);
                        resolve();
                    }
                );
        });
    },
    pullCache() {
        return new Promise((resolve1) => {
            services.pullUser().then(async (res) => {
                const { status, user } = res.data || {};
                if (status === "success") {
                    const localLastUpdate = moment(localStorage.getItem("lastUpdate"));
                    const cloudLastUpdate = moment(user.lastUpdate);
                    let canUpdate = false;
                    await new Promise((resolve2) => {
                        if (moment().isValid(localLastUpdate) && moment().isValid(cloudLastUpdate)) {
                            if (localLastUpdate > cloudLastUpdate) {
                                ElMessageBox.alert(
                                    `<p>本地记录较新，确定更新?</p>
                                    <p>本地：${localStorage.getItem("lastUpdate")}</p>
                                    <p>云端：${user.lastUpdate}</p>`,
                                    "更新提示",
                                    {
                                        confirmButtonText: "确定",
                                        type: "warning",
                                        dangerouslyUseHTMLString: true,
                                    }
                                )
                                    .then(() => {
                                        canUpdate = true;
                                        resolve2();
                                    })
                                    .catch(() => {
                                        ElMessage({
                                            type: "info",
                                            message: "推荐将本地记录上传",
                                            duration: 1000,
                                            showClose: true,
                                        });
                                        resolve2();
                                    });
                            } else {
                                canUpdate = true;
                                resolve2();
                            }
                        } else {
                            canUpdate = true;
                            resolve2();
                        }
                    });

                    if (canUpdate) {
                        localStorage.setItem("novelList", JSON.stringify(user.novelList));
                        localStorage.setItem("ocrToken", user.ocrToken);
                        localStorage.setItem("lastUpdate", user.lastUpdate);
                        ElMessage({
                            type: "info",
                            message: "已更新本地记录",
                            duration: 1000,
                            showClose: true,
                        });
                        resolve1();
                    }
                } else {
                    ElMessage({
                        type: "error",
                        message: "更新失败",
                        duration: 1000,
                        showClose: true,
                    });
                }
                pullImgAndChar(1, 100);
                pullOldNewKey(1, 300);
                resolve1();
            });
        });
    },
};
