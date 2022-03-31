/*
 * @Author: LXX
 * @Date: 2022-03-14 17:24:41
 * @LastEditTime: 2022-03-31 16:16:55
 * @LastEditors: LXX
 * @Description:
 * @FilePath: \dybz\01bzWeb\src\service\index.js
 */

/* eslint-disable */
import axios from "axios";
import { ElMessage } from "element-plus";

export function pushCache({ data }) {
    const userName = localStorage.getItem("userName");
    const password = localStorage.getItem("password");

    if (!userName || !password) {
        ElMessage({
            message: "先在设置中填写账号密码吧！",
            type: "warning",
            duration: 1000,
            showClose: true,
        });
    }
    return axios.post("/nodeApi/sync/pushCache", {
        data,
        userName,
        password,
    });
}

export function pullCache() {
    const userName = localStorage.getItem("userName");
    const password = localStorage.getItem("password");
    if (!userName || !password) {
        ElMessage({
            message: "先在设置中填写账号密码吧！",
            type: "warning",
            duration: 1000,
            showClose: true,
        });
    }
    return axios.get("/nodeApi/sync/pullCache", {
        params: {
            userName,
            password,
        },
    });
}

export function getNovelHtml(novelUrl, cancelTokenList, chanel) {
    novelUrl = novelUrl.replace(".html", "");
    return axios.get(`/pythonApi/getNovelHtml/${chanel || localStorage.getItem("chanel")}${novelUrl}`, {
        responseType: "blob",
        transformResponse: [
            async function (data) {
                return new Promise((resolve) => {
                    const fileReader = new FileReader();
                    fileReader.readAsText(data, "GBK");
                    fileReader.onload = function () {
                        resolve(fileReader.result);
                    };
                    fileReader.onerror = () => {
                        reject2(new Error("blobToBase64 error"));
                    };
                });
            },
        ],
        cancelToken: new axios.CancelToken((c) => {
            cancelTokenList.push(c);
        }),
    });
}

export function getImg(key, chanel) {
    return axios.get(`/pythonApi/getImg/${chanel || localStorage.getItem("chanel")}${key}`, {
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

export function getChapter(novelUrl, currPage, chanel) {
    novelUrl = novelUrl.replace(".html", "");
    return axios.get(`/pythonApi/getChapter/${chanel || localStorage.getItem("chanel")}${novelUrl}${currPage > 0 ? `_${currPage}` : ""}`, {
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
                        reject(new Error("file reader error"));
                    };
                });
            },
        ],
    });
}

export function requestOCR(options) {
    return axios(options);
}

export function getChanelList() {
    return axios({
        method: "get",
        url: "/pythonApi/getChanelList",
        // transformResponse: [
        //     function (data) {
        //         return new Promise((resolve, reject) => {
        //             const fileReader = new FileReader();
        //             fileReader.readAsText(data, "UTF-8");
        //             fileReader.onload = function () {
        //                 resolve(fileReader.result);
        //             };
        //             fileReader.onerror = () => {
        //                 reject(new Error("file reader error"));
        //             };
        //         });
        //     },
        // ],
    });
}
