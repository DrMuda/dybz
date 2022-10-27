import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";

Vue.use(VueRouter);

const ReadNovel = () => {
  return import("../views/ReadNovel.vue");
};
const ChooseNovel = () => {
  return import("../views/ChooseNovel.vue");
};
const SelectChapter = () => {
  return import("../views/SelectChapter.vue");
};
const SetChar = () => {
  return import("../views/SetChar.vue");
};
const Test = () => {
  return import("../views/Test.vue");
};
const routes: Array<RouteConfig> = [
  { path: "/", redirect: "/ChooseNovel" },
  { name: "ChooseNovel", path: "/ChooseNovel", component: ChooseNovel },
  { name: "ReadNovel", path: "/ReadNovel", component: ReadNovel },
  { name: "SelectChapter", path: "/SelectChapter", component: SelectChapter },
  { name: "SetChar", path: "/SetChar", component: SetChar },
  { name: "Test", path: "/Test", component: Test },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
