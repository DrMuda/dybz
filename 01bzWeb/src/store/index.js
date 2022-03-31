/*
 * @Author: LXX
 * @Date: 2022-03-31 16:44:16
 * @LastEditTime: 2022-03-31 17:06:42
 * @LastEditors: LXX
 * @Description:
 * @FilePath: \dybz\01bzWeb\src\store\index.js
 */

import { createStore } from "vuex";
const store = createStore({
    state() {
        return {
            currNovelChanel: sessionStorage.getItem("currNovelChanel"),
        };
    },
    mutations: {
        setCurrNovelChanel(state, chanel) {
            state.currNovelChanel = chanel;
            sessionStorage.setItem("currNovelChanel", chanel);
        },
    },
});
export default store;
