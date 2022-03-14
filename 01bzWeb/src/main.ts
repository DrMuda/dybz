import { createApp } from "vue";
import App from "./App.vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import routes from "./routes/index";
import { createRouter, createWebHistory } from "vue-router";

const app = createApp(App);
const router = createRouter({
    history: createWebHistory("/dybz/"),
    routes,
});
app.use(ElementPlus);
app.use(router);
app.mount("#app");
