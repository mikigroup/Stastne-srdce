import { sentrySvelteKit } from "@sentry/sveltekit";
import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import * as fs from "fs";
import * as path from "path";

// Kontrola existence HTTPS certifikátů
const keyPath = path.resolve("./mystastnesrdce.local-key.pem");
const certPath = path.resolve("./mystastnesrdce.local.pem");
const hasHttpsCerts = fs.existsSync(keyPath) && fs.existsSync(certPath);

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
    host: hasHttpsCerts ? "mystastnesrdce.local" : "localhost",
    port: 5173,
    strictPort: true,
    // HTTPS pouze pokud existují certifikáty (lokální development)
    ...(hasHttpsCerts && {
      https: {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
      },
      hmr: {
        protocol: "wss", 
      }
    })
  },
});