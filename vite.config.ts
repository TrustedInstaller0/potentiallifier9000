import adapter from "@sveltejs/adapter-static";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

const dev = process.argv.includes("dev");

export default defineConfig({
  plugins: [
    sveltekit({
      adapter: adapter({
        // default options are shown. On some platforms

        // these options are set automatically — see below
        pages: "build",
        assets: "build",
        fallback: undefined,
        precompress: false,
        strict: true,
      }),
      paths: {
        base: dev ? "" : "/potentiallifier9000",
      },
    }),
  ],
});
