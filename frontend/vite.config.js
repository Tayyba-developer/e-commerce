import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Proxies /api calls to the backend (Express server from Phase 9, or the
// bundled mock server in /server) so the frontend never hardcodes a host.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.VITE_API_PROXY_TARGET || "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
