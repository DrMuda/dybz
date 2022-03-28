/*
 * @Author: LXX
 * @Date: 2022-02-25 15:07:32
 * @LastEditTime: 2022-03-28 11:40:50
 * @LastEditors: LXX
 * @Description:
 * @FilePath: \dybz\01bzWeb\src\utils\strToDom.ts
 */

export default (str: string | undefined): NodeListOf<ChildNode> | null => {
    try {
        const tempEle = document.createElement("div");
        str && (tempEle.innerHTML = str);
        return tempEle.childNodes;
    } catch (e) {
        console.error(e);
        return null;
    }
};
