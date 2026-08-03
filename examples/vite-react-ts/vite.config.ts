import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

/**
 * This example imports the library from local source (not from npm) so it
 * always reflects the current state of ../../src — useful while developing
 * the library itself. In a real consumer app, this alias block doesn't
 * exist; you'd simply `npm install ishan-ui` and import normally:
 *
 *   import { Navbar } from "ishan-ui";
 *   import "ishan-ui/style.css";
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "ishan-ui": resolve(__dirname, "../../src/index.ts"),
    },
  },
});
