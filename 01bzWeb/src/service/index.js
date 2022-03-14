/*
 * @Author: LXX
 * @Date: 2022-03-14 17:24:41
 * @LastEditTime: 2022-03-14 18:16:02
 * @LastEditors: LXX
 * @Description:
 * @FilePath: \dybz\01bzWeb\src\service\index.js
 */

import axios from "axios";
import { ElMessage } from "element-plus";

export function pushCache({ data }) {
    const userName = localStorage.getItem("userName");
    const password = localStorage.getItem("password");
    if (userName && password) {
        return axios.post("/nodeApi/sync/pushCache", {
            data,
            userName,
            password,
        });
    }
    ElMessage.warning("先在设置中填写账号密码吧！");
    return Promise.reject({ status: "userError" });
}

export function pullCache() {
    const userName = localStorage.getItem("userName");
    const password = localStorage.getItem("password");
    if (userName && password) {
        return axios.get("/nodeApi/sync/pullCache", {
            params: {
                userName,
                password,
            },
        });
    }
    ElMessage.warning("先在设置中填写账号密码吧！");
    return Promise.reject({ status: "userError" });
}

export function getNovelHtml(novelId) {
    return axios.get(`/pythonApi/getNovelHtml/${localStorage.getItem("chanel")}${novelId}`, {
        responseType: "blob",
        transformResponse: [
            async function (data) {
                return new Promise((resolve) => {
                    let reader = new FileReader();
                    reader.readAsText(data, "GBK");
                    reader.onload = function () {
                        resolve(reader.result);
                    };
                });
            },
        ],
    });
}

export function getImg(key) {
    return axios.get(`/pythonApi/getImg/${localStorage.getItem("chanel")}${key}`, {
        responseType: "blob",
        transformResponse: [
            async function (data) {
                return new Promise((resolve2, reject2) => {
                    const fileReader = new FileReader();
                    fileReader.onload = (e) => {
                        resolve2(e?.target?.result);
                    };
                    // readAsDataURL
                    fileReader.readAsDataURL(data);
                    // fileReader.readAsArrayBuffer(data);
                    fileReader.onerror = () => {
                        reject2(new Error("blobToBase64 error"));
                    };
                });
            },
        ],
    });
}

export function getChapter(novelId, currPage) {
    return axios.get(`/pythonApi/getChapter/${localStorage.getItem("chanel")}${novelId}${currPage > 0 ? `_${currPage}` : ""}`, {
        responseType: "blob",
        transformResponse: [
            function (data) {
                return new Promise((resolve, reject) => {
                    const fileReader = new FileReader();
                    fileReader.readAsText(data, "GBK");
                    fileReader.onload = function () {
                        resolve(fileReader.result);
                    };
                    fileReader.onerror = () => {
                        reject(new Error("blobToBase64 error"));
                    };
                });
            },
        ],
    });
}

export function requestOCR(options) {
    return axios(options);
}
