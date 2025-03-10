import { defineConfig } from "vite"
import path from "path"
import vue from "@vitejs/plugin-vue"
import { json5Plugin } from 'vite-plugin-json5'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/vip/',
  build: {
    target: "esnext",
  },
  plugins: [
    json5Plugin(),
    vue({
      template: {
        compilerOptions: {
          // treat all tags with a dash as custom elements
          isCustomElement: tag => ['search'].includes(tag),
        },
      },
    }),
  ],
  resolve: {
    alias: [
      {
        find: /^~/,
        replacement: "",
      },
      {
        find: "@",
        replacement: path.resolve(__dirname, "src"),
      },
    ],
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"],
  },
})
