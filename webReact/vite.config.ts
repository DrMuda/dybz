import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://0.0.0.0:8010",
        changeOrigin: true,
        rewrite:  (path) => path.replace(/^\/api/, "/api"),
      },
    },
  },
  base: "./",
});
