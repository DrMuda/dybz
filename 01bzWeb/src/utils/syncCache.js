/*
 * @Author: LXX
 * @Date: 2022-03-22 11:21:46
 * @LastEditTime: 2022-03-22 16:14:14
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
            });
            let imgAndChar = ImgAndChar.get();
            console.log(imgAndChar);
            let novelList = null;
            let ocrToken = null;
            try {
                novelList = JSON.parse(localStorage.getItem("novelList") || {});
            } catch (e) {
                novelList = {};
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
                        user: {
                            novelList,
                            ocrToken,
                        },
                    },
                })
                .then((res) => {
                    ElMessage.closeAll();
                    if (res.data.status === "success") {
                        ElMessage({
                            type: "success",
                            message: "上传成功",
                        });
                    } else {
                        ElMessage({
                            type: "error",
                            message: "上传失败",
                        });
                    }
                    resolve();
                });
        });
    },
    pullCache() {
        return new Promise((resolve1) => {
            services.pullCache().then(async (res) => {
                if (res.data.status === "success") {
                    const localLastUpdate = moment(localStorage.getItem("lastUpdate"));
                    const cloudLastUpdate = moment(res.data.user.lastUpdate);
                    let canUpdate = false;
                    await new Promise((resolve2) => {
                        if (moment().isValid(localLastUpdate) && moment().isValid(cloudLastUpdate)) {
                            if (localLastUpdate > cloudLastUpdate) {
                                ElMessageBox.alert(
                                    `<p>本地记录较新，确定更新?</p>
                                    <p>本地：${localStorage.getItem("lastUpdate")}</p>
                                    <p>云端：${res.data.user.lastUpdate}</p>`,
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
                        ImgAndChar.set({ ...ImgAndChar.get(), ...res.data.imgAndChar });
                        localStorage.setItem("novelList", JSON.stringify(res.data.user.novelList));
                        localStorage.setItem("ocrToken", res.data.user.ocrToken);
                        localStorage.setItem("lastUpdate", res.data.user.lastUpdate);
                        ElMessage({
                            type: "info",
                            message: "已更新本地记录",
                        });
                        resolve1()
                    }
                } else {
                    ElMessage({
                        type: "error",
                        message: "更新失败",
                    });
                    resolve1()
                }
            });
        });
    },
};
