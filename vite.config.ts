import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue2";
// import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 8080,
  },
  plugins: [
    vue({
      // resolve: {
      //   alias: {
      //     "@": path.resolve(__dirname, "./src"),
      //   },
      // },
    }),
  ],
});
