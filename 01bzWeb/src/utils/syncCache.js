/*
 * @Author: LXX
 * @Date: 2022-03-22 11:21:46
 * @LastEditTime: 2022-03-24 15:42:37
 * @LastEditors: LXX
 * @Description:
 * @FilePath: \dybz\01bzWeb\src\utils\syncCache.js
 */

import ImgAndChar from "./ImgAndChar";
import { ElMessage, ElMessageBox } from "element-plus";
import moment from "moment";
import * as services from "@/service/index.js";

export default {
    pushCache() {
        return new Promise((resolve) => {
            ElMessage({
                type: "info",
                message: "上传数据中...",
                duration: 1000,
                showClose: true,
            });
            let imgAndChar = ImgAndChar.get();
            let novelList = null;
            let ocrToken = null;
            let oldNewKey = null;
            try {
                novelList = JSON.parse(localStorage.getItem("novelList") || {});
            } catch (e) {
                novelList = {};
            }
            try {
                oldNewKey = JSON.parse(localStorage.getItem("oldNewKey") || {});
            } catch (e) {
                oldNewKey = {};
            }
            try {
                ocrToken = localStorage.getItem("ocrToken") || "";
            } catch (e) {
                ocrToken = "";
            }
            services
                .pushCache({
                    data: {
                        imgAndChar,
                        oldNewKey,
                        user: {
                            novelList,
                            ocrToken,
                        },
                    },
                })
                .then((res) => {
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
                    resolve();
                });
        });
    },
    pullCache() {
        return new Promise((resolve1) => {
            services.pullCache().then(async (res) => {
                const { imgAndChar, oldNewKey, status, user } = res.data || {};
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
                    ImgAndChar.set({ ...ImgAndChar.get(), ...imgAndChar });

                    ElMessage({
                        type: "error",
                        message: "更新失败",
                        duration: 1000,
                        showClose: true,
                    });
                    resolve1();
                }
            });
        });
    },
};
