/*
 * @Author: LXX
 * @Date: 2022-03-02 10:05:02
 * @LastEditTime: 2022-03-02 14:14:02
 * @LastEditors: LXX
 * @Description:
 * @FilePath: \dybz\01bzWeb\src\routes\index.ts
 */
import ReadNovel from "@/pages/ReadNovel.vue";
import ChooseNovel from "@/pages/ChooseNovel.vue";
import SelectChapter from '@/pages/SelectChapter.vue'

export default [
    { path: "/", redirect: "/ChooseNovel" },
    { path: "/ChooseNovel", component: ChooseNovel },
    { path: "/ReadNovel", component: ReadNovel },
    { path: "/SelectChapter", component: SelectChapter },
];
