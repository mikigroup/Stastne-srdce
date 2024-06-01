import { sentrySvelteKit } from "@sentry/sveltekit";
/* import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

const config: UserConfig = {
	plugins: [sveltekit()]
};

export default config;
 */

import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sentrySvelteKit({
   sourceMapsUploadOptions: {
    org: "stastnesrdce",
    project: "javascript-svelte",
    authToken: "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",
   }
  }), sveltekit()]
});