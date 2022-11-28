import adapter from '@sveltejs/adapter-auto';
import preprocess from "svelte-preprocess"; /** Tailwind */


/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [
		preprocess({
		  postcss: true,
		}),
	  ],
	kit: {
		trailingSlash: 'always',
   adapter: adapter(),
   prerender: {
	entries: ['*'],

		// Override http methods in the Todo forms
		/* methodOverride: {
			allowed: ['PATCH', 'DELETE'] */
		}
	}
};

export default config;
