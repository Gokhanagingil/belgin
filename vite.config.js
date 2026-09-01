import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.CAPACITOR_BUILD === "1" ? "./" : "/belgin/",
  build: {
    sourcemap: true,
    rollupOptions: {
      output: { inlineDynamicImports: true }
    }
  }
});
