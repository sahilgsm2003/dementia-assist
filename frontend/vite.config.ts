import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // Allow access from network
    port: 5173,
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
          "map-vendor": ["leaflet", "react-leaflet"],
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
