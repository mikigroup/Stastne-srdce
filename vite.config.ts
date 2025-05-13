import { sentrySvelteKit } from "@sentry/sveltekit";
import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
	plugins: [
		sentrySvelteKit({
			sourceMapsUploadOptions: {
				org: "stastnesrdce",
				project: "javascript-svelte",
				authToken: process.env.SENTRY_AUTH_TOKEN
			}
		}),
		tailwindcss(),
		sveltekit()
	],
	server: {
		host: "mystastnesrdce.local",
		port: 5173,
		strictPort: true
	}
});
