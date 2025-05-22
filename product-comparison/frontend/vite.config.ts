import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the
  // `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), "");
  return {
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
    root: "src",
    build: {
      // ssr: true,
      // lib: {
      //   formats: ["es", "iife"],
      //   entry: resolve(__dirname, "src/index.tsx"),
      //   name: "MyLib",
      //   // the proper extensions will be added
      //   //fileName: "index",
      //   fileName: (format, entryName) => `index.${format}.js`,
      //   cssFileName: "index",
      // },
      // outDir: "../../extensions/product-comparison-block/assets",
      outDir: "../dist",
      emptyOutDir: true, // also necessary
      rollupOptions: {
        input: {
          main: resolve(__dirname, "src/index.html"),
        },
        output: {
          entryFileNames: `[name].js`,
          chunkFileNames: `[name].js`,
          assetFileNames: `[name].[ext]`,
        },
      },
    },
    plugins: [
      tailwindcss(),
      viteStaticCopy({
        targets: [
          {
            src: "../dist/main.js",
            dest: "../../extensions/product-comparison-block/assets",
          },
          {
            src: "../dist/main.css",
            dest: "../../extensions/product-comparison-block/assets",
          },
        ],
      }),
    ],
  };
});
