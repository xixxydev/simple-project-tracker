import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Read VITE_* variables from the project-root .env (shared with the backend).
  envDir: "..",
  server: {
    host: true, // listen on 0.0.0.0 so Docker can expose it
    port: 5173,
    strictPort: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
  },
});
