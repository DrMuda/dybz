/*
 * @Author: LXX
 * @Date: 2022-03-15 15:12:36
 * @LastEditTime: 2022-03-18 15:30:42
 * @LastEditors: LXX
 * @Description:
 * @FilePath: \dybz\01bzWeb\src\utils\cacheImg.js
 */
/* eslint-disable */ 

import ImgBase64 from "./ImgBase64";
import ImgMapChar from "./ImgMapChar";
import baiduOcr from "@/utils/baiduOcr";
import * as services from "@/service/index.js";

export default (ignoreChar = false) => {
    return new Promise((resolve, reject) => {
        let imgCache = ImgBase64.get(); // 图片与文字的映射
        let imgMapCache = ImgMapChar.get(); // 图片与base64的映射
        const pList = [];
        Object.keys(imgCache).forEach((key) => {
            if (!imgCache[key] && (ignoreChar || !imgMapCache[key])) {
                pList.push(
                    new Promise((resolve, reject) => {
                        services.getImg(key).then(
                            async (res) => {
                                const imgBase64 = await res.data;
                                if (typeof imgBase64 === "string") {
                                    imgCache[key] = imgBase64.replace("data:text/html", "data:image/png");
                                    // imgMapCache[key] = (await baiduOcr(imgBase64)).words_result[0].words;
                                }
                                resolve(`success:${key}`);
                            },
                            () => {
                                reject(`fail:${key}`);
                            }
                        );
                    })
                );
            }
        });
        Promise.allSettled(pList).then(
            () => {
                ImgBase64.set(imgCache);
                baiduOcr();
                resolve();
            },
            () => {
                reject();
            }
        );
    });
};
