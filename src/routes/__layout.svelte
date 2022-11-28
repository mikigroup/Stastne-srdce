<script>
	import Header from '$lib/Header.svelte';
	import Footer from '$lib/footer/Footer.svelte';
	import '../app.css';
	import { supabase } from './supabaseClient';
	import { user } from './Stores/stores';
	import * as Sentry from "@sentry/svelte";
	import { BrowserTracing } from "@sentry/tracing";	
	user.set(supabase.auth.user())

		// Initialize the Sentry SDK here
	Sentry.init({
  dsn: "https://945c529c21324f78bf290bf4f0662070@o4504123775188992.ingest.sentry.io/4504124579184640",
  integrations: [new BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});
</script>

<Header />

<slot />
	
<Footer />
	

<style>
	/* main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 1024px;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 40px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 40px 0;
		}
	} */
</style>
