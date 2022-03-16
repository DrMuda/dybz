/*
 * @Author: LXX
 * @Date: 2022-03-14 17:24:41
 * @LastEditTime: 2022-03-16 10:46:08
 * @LastEditors: LXX
 * @Description:
 * @FilePath: \dybz\01bzWeb\src\service\index.js
 */

import axios from "axios";
import { ElMessage } from "element-plus";

export function pushCache({ data }) {
    const userName = localStorage.getItem("userName");
    const password = localStorage.getItem("password");
    const imgMapChar = {};
    // 筛选已设值的数据
    data.imgMapChar &&
        Object.keys(data.imgMapChar).forEach((key) => {
            if (data.imgMapChar[key]) {
                imgMapChar[key] = data.imgMapChar[key];
            }
        });
    const nextData = {
        imgMapChar,
        user: data.user,
    };
    if (userName && password) {
        return axios.post("/nodeApi/sync/pushCache", {
            data: nextData,
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

export function getNovelHtml(novelUrl) {
    novelUrl = novelUrl.replace(".html", "");
    return axios.get(`/pythonApi/getNovelHtml/${localStorage.getItem("chanel")}${novelUrl}`, {
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

export function getChapter(novelUrl, currPage) {
    novelUrl = novelUrl.replace(".html", "");
    return axios.get(`/pythonApi/getChapter/${localStorage.getItem("chanel")}${novelUrl}${currPage > 0 ? `_${currPage}` : ""}`, {
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
