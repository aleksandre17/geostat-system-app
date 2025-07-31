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
    include: ['react-is', "prop-types", 'hoist-non-react-statics'],
  },
  server: {
    host: true,
    historyApiFallback: true,
  },
  resolve: {
    alias: {
      '@mui-icons': path.resolve(__dirname, 'node_modules/@mui/icons-material/esm'),
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
