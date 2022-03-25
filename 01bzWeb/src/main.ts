import { createApp } from "vue";
import App from "./App.vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import router from "./routes/index.js";
// import VConsole from "vconsole";

const app = createApp(App);

app.use(ElementPlus);
app.use(router);
app.mount("#app");

// if (process.env.NODE_ENV === "development") {
//     const vConsole = new VConsole();
// }
