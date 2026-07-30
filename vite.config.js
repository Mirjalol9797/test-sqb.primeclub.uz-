require("dotenv").config();
import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/api/widget": {
        target: "https://chat.primeclub.uz",
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on("error", (err, req, res) => {
            console.log("Proxy error:", err);
          });
          proxy.on("proxyReq", (proxyReq, req, res) => {
            console.log("Sending Request to Target:", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req, res) => {
            console.log("Received Response from Target:", proxyRes.statusCode, req.url);
          });
        },
      },
      // Legacy chat API proxy for backward compatibility
      "/api/chat": {
        target: "https://chat.primeclub.uz",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/chat/, "/api/widget"),
        configure: (proxy, options) => {
          proxy.on("proxyReq", (proxyReq, req, res) => {
            console.log("Legacy proxy - redirecting:", req.url, "to widget API");
          });
        },
      },
    },
  },
});
