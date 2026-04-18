import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react") || id.includes("node_modules/framer-motion") || id.includes("node_modules/zustand")) {
            return "react-vendor";
          }
          if (id.includes("node_modules/@ton/core") || id.includes("node_modules/@tonconnect")) {
            return "ton-core";
          }
          if (id.includes("node_modules/@ston-fi")) {
            return "stonfi-sdk";
          }
          if (id.includes("node_modules/tonstakers-sdk")) {
            return "tonstakers-sdk";
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
