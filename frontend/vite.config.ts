import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // Allow access from network
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "ui-vendor": ["framer-motion", "lucide-react"],
          "map-vendor": ["mapbox-gl"],
          // Feature chunks
          "chat": [
            "./src/components/ask-moments",
            "./src/components/ChatBot",
            "./src/components/ChatPage",
          ],
          "memories": [
            "./src/components/my-memories",
          ],
          "people": [
            "./src/components/my-people",
          ],
          "places": [
            "./src/components/my-places",
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
