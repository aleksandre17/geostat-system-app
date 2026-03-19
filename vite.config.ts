import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import path from "path";
import * as fs from "node:fs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),

    nodePolyfills({
      globals: {
        global: true,
      },
    }),
  ],
  optimizeDeps: {
    include: [
      "react-is",
      "prop-types",
      "hoist-non-react-statics",
      "@emotion/react",
      "@emotion/styled",
      "@emotion/cache",
    ],
  },
  server: {
    host: true,
    historyApiFallback: true,
  },
  resolve: {
    // Force single instances — prevents "loaded multiple times" warnings
    // from libraries (e.g. react-sortable-tree) that bundle their own copies
    dedupe: ["react", "react-dom", "@emotion/react", "@emotion/styled"],
    alias: {
      "@mui-icons": path.resolve(
        __dirname,
        "node_modules/@mui/icons-material/esm",
      ),
    },
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    sourcemap: mode === "development",
    //
    rollupOptions: {
      external: [],
    },
    //
  },
  base: "./",
}));
