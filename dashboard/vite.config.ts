import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(async ({ mode }) => {
  const plugins: (Plugin | Plugin[])[] = [react()];

  if (mode !== "production" && process.env.REPL_ID !== undefined) {
    const { cartographer } = await import("@replit/vite-plugin-cartographer");
    const { devBanner } = await import("@replit/vite-plugin-dev-banner");
    plugins.push(cartographer(), devBanner());
  }

  return {
    plugins,

    // ⭐⭐⭐ THIS IS THE MOST IMPORTANT LINE ⭐⭐⭐
    base: "/",   // <-- এটা না থাকলেই সাদা স্ক্রিন

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@shared": path.resolve(__dirname, "shared"),
        "@assets": path.resolve(__dirname, "attached_assets"),
      },
    },

    build: {
      outDir: path.resolve(__dirname, "dist/public"),
      emptyOutDir: true,
    },

    server: {
      host: true,            // Replit / Render safe
      port: 5000,
      strictPort: true,
      allowedHosts: "all",   // ❗ boolean নয়
      hmr: {
        protocol: "wss",
        clientPort: 443,
      },
    },
  };
});