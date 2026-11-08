import { sentrySvelteKit } from "@sentry/sveltekit/vite";
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

export default defineConfig(async () => {
	const sentryPlugins = hasSentryToken
		? await sentrySvelteKit({
				org: "stastnesrdce",
				project: "javascript-svelte",
				authToken: process.env.PUBLIC_SENTRY_TOKEN
			})
		: [];

	return {
		plugins: [
			// Sentry plugin pouze když je dostupný auth token
			...sentryPlugins,
			sveltekit()
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
					protocol: "wss"
				}
			})
		}
	};
});
