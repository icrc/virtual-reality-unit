import { defineConfig } from "vite"
import path from "path"
import vue from "@vitejs/plugin-vue"
import { json5Plugin } from "vite-plugin-json5"

import * as dotenv from "dotenv"
import { fileURLToPath } from "url"
import { dirname, resolve } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default ({ mode }) => {
  const envFile = `.env.${mode}`
  const envPath = resolve(__dirname, envFile)

  try {
    dotenv.config({ path: envPath })
    console.log(`Loaded environment variables from ${envFile}`)
  } catch (error) {
    console.log(`Could not load environment variables from ${envFile}, using .env instead`)
    dotenv.config({ path: resolve(__dirname, ".env") })
  }

  return defineConfig({
    base: process.env.BASE_PATH || "/",
    build: {
      target: "esnext",
    },
    plugins: [
      json5Plugin(),
      vue({
        template: {
          compilerOptions: {
            // treat all tags with a dash as custom elements
            isCustomElement: tag => ["search"].includes(tag),
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
}
