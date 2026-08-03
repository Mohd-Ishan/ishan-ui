import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { resolve } from "node:path";

/**
 * vite.config.ts
 *
 * Two build entries:
 *   - "index"  -> the root package barrel ("." in package.json#exports)
 *   - "navbar" -> the Navbar deep-import barrel ("./navbar")
 *
 * Both ship as ESM + CJS with rolled-up .d.ts files. CSS Modules from every
 * component are extracted into a single dist/style.css so consumers import
 * styles once regardless of how many components they use.
 */
export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ["src"],
      exclude: ["src/**/__tests__/**"],
      rollupTypes: true,
      insertTypesEntry: true,
      copyDtsFiles: false,
    }),
  ],
  build: {
    target: "es2020",
    sourcemap: true,
    minify: "esbuild",
    cssCodeSplit: false,
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        navbar: resolve(__dirname, "src/components/Navbar/index.ts"),
        button: resolve(__dirname, "src/components/Button/index.ts"),
        modal: resolve(__dirname,"src/components/Modal/index.ts"),
      },
      formats: ["es", "cjs"],
      fileName: (format, entryName) => (format === "es" ? `${entryName}.js` : `${entryName}.cjs`),
    },
    rollupOptions: {
      // Never bundle these — they're peer dependencies the consumer already has.
      external: ["react", "react-dom", "react/jsx-runtime", "react-router"],
      output: {
        exports: "named",
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
  css: {
    modules: {
      // Deterministic, debuggable class names in dev; minified further by
      // esbuild's CSS minifier in the production build.
      generateScopedName: "ishan-[name]__[local]___[hash:base64:5]",
    },
  },
});
