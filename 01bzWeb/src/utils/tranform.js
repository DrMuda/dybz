/*
 * @Author: LXX
 * @Date: 2022-03-21 11:35:36
 * @LastEditTime: 2022-03-21 15:04:42
 * @LastEditors: LXX
 * @Description:
 * @FilePath: \dybz\01bzWeb\src\utils\tranform.js
 */
import ImgAndChar from "./ImgAndChar";
import ImgBase64 from "./ImgBase64";
import ImgMapChar from "./ImgMapChar";
import md5 from "md5";
export default () => {
    const img = ImgBase64.get();
    const char = ImgMapChar.get();
    const imgAndChar = {};
    Object.keys(img).forEach((id) => {
        const base64 = img[id];
        if (base64) {
            imgAndChar[md5(base64)] = {
                img: base64,
                char: char[id] || null,
            };
        } else {
            imgAndChar[id] = {
                img: null,
                char: char[id] || null,
            };
        }
    });
    ImgAndChar.set(imgAndChar);
};
