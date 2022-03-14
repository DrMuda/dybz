/*
 * @Author: LXX
 * @Date: 2022-03-14 17:24:41
 * @LastEditTime: 2022-03-14 18:16:02
 * @LastEditors: LXX
 * @Description:
 * @FilePath: \dybz\01bzWeb\src\service\index.js
 */

import axios from "axios";

export function checkUser({ data, params }) {
    return axios.get("/nodeApi/sync/checkUser", { data, params });
}

export function pushCache({ data, params }) {
    return axios.post("/nodeApi/sync/pushCache", {
        data,
        params: {
            userName: "drMuda",
            password: "123456",
        },
    });
}

export function pullCache() {
    return axios.get("/nodeApi/sync/pullCache", {
        params: {
            userName: "drMuda",
            password: "123456",
        },
    });
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
