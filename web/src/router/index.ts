import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";

Vue.use(VueRouter);

const ReadNovel = () => import("../views/ReadNovel.vue");
const ChooseNovel = () => import("../views/ChooseNovel.vue");
const SelectChapter = () => import("../views/SelectChapter.vue");
const SetChar = () => import("../views/SetChar.vue");
const Search = () => import("../views/Search.vue");
const routes: Array<RouteConfig> = [
  { path: "/", redirect: "/ChooseNovel" },
  { name: "ChooseNovel", path: "/ChooseNovel", component: ChooseNovel },
  { name: "ReadNovel", path: "/ReadNovel", component: ReadNovel },
  { name: "SelectChapter", path: "/SelectChapter", component: SelectChapter },
  { name: "SetChar", path: "/SetChar", component: SetChar },
  { name: "Search", path: "/Search", component: Search },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
