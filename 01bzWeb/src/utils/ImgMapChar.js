/*
 * @Author: LXX
 * @Date: 2022-03-11 09:58:09
 * @LastEditTime: 2022-03-11 15:05:18
 * @LastEditors: LXX
 * @Description:
 * @FilePath: \dybz\01bzWeb\src\utils\ImgMapChar.js
 */
import moment from "moment";
class ImgMapChar {
    get() {
        try {
            return JSON.parse(localStorage.getItem("imgMapChar")) || {};
        } catch (e) {
            console.error(e);
            return {};
        }
    }
    set(nextImgMapChar) {
        localStorage.setItem("imgMapChar", JSON.stringify(nextImgMapChar));
        localStorage.setItem("lastUpdate", moment().format("YYYY-MM-DD HH:mm:ss"));
    }
}
const imgMapChar = new ImgMapChar();
export default imgMapChar;
