/*
 * @Author: LXX
 * @Date: 2022-03-11 09:58:25
 * @LastEditTime: 2022-03-11 10:29:02
 * @LastEditors: LXX
 * @Description:
 * @FilePath: \dybz\01bzWeb\src\utils\ImgBase64.js
 */
class ImgBase64 {
    get() {
        try {
            return JSON.parse(localStorage.getItem("imgBase64")) || {};
        } catch (e) {
            console.error(e);
            return {};
        }
    }
    set(nextImgBase64) {
        localStorage.setItem("imgBase64", JSON.stringify(nextImgBase64));
    }
}
const imgBase64 = new ImgBase64();
export default imgBase64;
