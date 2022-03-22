/*
 * @Author: LXX
 * @Date: 2022-03-02 10:05:02
 * @LastEditTime: 2022-03-22 16:06:07
 * @LastEditors: LXX
 * @Description:
 * @FilePath: \dybz\01bzWeb\src\routes\index.js
 */

import { createRouter, createWebHistory } from "vue-router";

const ReadNovel = () => {
    return import("../pages/ReadNovel.vue");
};
const ChooseNovel = () => {
    return import("../pages/ChooseNovel.vue");
};
const SelectChapter = () => {
    return import("../pages/SelectChapter.vue");
};
const SetChar = () => {
    return import("../pages/SetChar.vue");
};

const router = createRouter({
    history: createWebHistory("/dybz/"),
    routes: [
        { path: "/", redirect: "/ChooseNovel" },
        { path: "/ChooseNovel", component: ChooseNovel },
        { path: "/ReadNovel", component: ReadNovel },
        { path: "/SelectChapter", component: SelectChapter },
        { path: "/SetChar", component: SetChar },
    ],
});

export default router;
