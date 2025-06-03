import { sentrySvelteKit } from "@sentry/sveltekit";
import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import * as fs from "fs";
import * as path from "path";

export default defineConfig({
  plugins: [    
    sentrySvelteKit({
      sourceMapsUploadOptions: {
        org: "stastnesrdce",
        project: "javascript-svelte",
        authToken: process.env.SENTRY_AUTH_TOKEN
      }
    }),
    
    sveltekit(),
  ],
  server: {
    host: "mystastnesrdce.local",
    port: 5173,
    strictPort: true,
    https: {
      key: fs.readFileSync(path.resolve("./mystastnesrdce.local-key.pem")),
      cert: fs.readFileSync(path.resolve("./mystastnesrdce.local.pem"))
    }
  },
});