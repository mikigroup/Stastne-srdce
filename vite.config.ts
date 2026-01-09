import { sentrySvelteKit } from "@sentry/sveltekit";
import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import * as fs from "fs";
import * as path from "path";

// Kontrola existence HTTPS certifikátů
const keyPath = path.resolve("./mystastnesrdce.local-key.pem");
const certPath = path.resolve("./mystastnesrdce.local.pem");
const hasHttpsCerts = fs.existsSync(keyPath) && fs.existsSync(certPath);

// Kontrola existence Sentry tokenu
const hasSentryToken = process.env.PUBLIC_SENTRY_TOKEN;

export default defineConfig({
  plugins: [    
    // Sentry plugin pouze když je dostupný auth token
    ...(hasSentryToken ? [sentrySvelteKit({
      sourceMapsUploadOptions: {
        org: "stastnesrdce",
        project: "javascript-svelte",
        authToken: process.env.PUBLIC_SENTRY_TOKEN
      }
    })] : []),
    
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