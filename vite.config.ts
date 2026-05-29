import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// PUBLIC_INTERFACE
export default defineConfig({
  /** Vite config for the React Web App container. */
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true
  }
});
