<script lang="ts">
	import "./app.css";
	import "./banner.css";
	import { page } from "$app/stores";
	import GDPR from "$lib/gdpr/Gdpr.svelte";
	import { invalidate } from "$app/navigation";
	import { onMount } from "svelte";
	import HeaderAdmin from "$lib/component/HeaderAdmin.svelte";
	import HeaderCustomer from "$lib/component/HeaderCustomer.svelte";
	import Footer from "$lib/component/Footer.svelte";
	import { injectSpeedInsights } from "@vercel/speed-insights/sveltekit";
	import { cookieStore } from '$lib/stores/cookieStore';

	export let data;
	let { supabase, session, user  } = data;
	$: ({ supabase, session, user } = data);

	//console.log(settings)

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate("supabase:auth");
			}
		});
		return () => data.subscription.unsubscribe();
	});
	$: isAdminRoute = $page.url.pathname.startsWith("/admin");
	injectSpeedInsights();

	const cookieName = 'stastne_srdce_cookies';
	let showBanner = false;

	onMount(() => {
		// Zkontrolujeme, zda už existuje souhlas s cookies
		const cookieConsent = cookieStore.hasConsent();
		showBanner = !cookieConsent;

		// Poslech události pro statistiky
		window.addEventListener('consent:statistics', () => {
			initGoogleAnalytics();
		});

		// Poslech události pro marketing
		window.addEventListener('consent:marketing', () => {
			initMarketingScripts();
		});
	});

	// Funkce pro inicializaci sledovacích skriptů
	function initializeTracking() {
		if (cookieStore.isCategoryAccepted('statistics')) {
			initGoogleAnalytics();
		}

		if (cookieStore.isCategoryAccepted('marketing')) {
			initMarketingScripts();
		}
	}

	// Funkce pro inicializaci Google Analytics
	function initGoogleAnalytics() {
	/*	const gaId = 'G-88SZ0DZWC8';

		if (!gaId) return;

		// Přidání GA skriptu pokud ještě neexistuje
		if (!document.getElementById('ga-script')) {
			const script = document.createElement('script');
			script.id = 'ga-script';
			script.async = true;
			script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
			document.head.appendChild(script);

			// Inicializace GA
			window.dataLayer = window.dataLayer || [];
			function gtag(...args: any[]) {
				window.dataLayer.push(args);
			}
			gtag('js', new Date());
			gtag('config', gaId);
		}*/
	}

	// Funkce pro inicializaci marketingových skriptů
	function initMarketingScripts() {
		// Implementace podle potřeb (Facebook Pixel, atd.)
	/*	const fbPixelId = 'YOUR_PIXEL_ID';

		if (fbPixelId && !document.getElementById('fb-pixel')) {
			// Facebook Pixel
			const script = document.createElement('script');
			script.id = 'fb-pixel';
			script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${fbPixelId}');
        fbq('track', 'PageView');
      `;
			document.head.appendChild(script);
		} */
	}
</script>

<!-- <Header /> -->
{#if !isAdminRoute}
	<HeaderCustomer {data} />
{:else}
	<HeaderAdmin {data} />
{/if}

{#if !isAdminRoute}
	<div class="pt-5 mt-20" />
{:else}
	<div class="" />
{/if}

<main class="">
	<slot class="mt-10 container mx-auto " />
</main>

<!--<GDPR cookieName="gdpr" />-->
<!-- <GdprBanner bind:this={gdprBanner} cookieName="props.beyonk_gdpr" {...props} on:analytics={initAnalytics} /> -->
<GDPR
	cookieName="stastne_srdce_cookies"
	visible={showBanner}
	showEditIcon={true}
	on:show={() => {
    console.log('Event show triggered');
    /*showBanner = true;*/
  }}
	on:accept-all={() => {
    console.log('Event accept-all triggered');
    cookieStore.acceptAll();
    showBanner = false;
    console.log('showBanner set to false:', showBanner);
  }}
	on:reject-all={() => {
    console.log('Event reject-all triggered');
    cookieStore.rejectAll();
    showBanner = false;
  }}
	on:accept-selection={() => {
    console.log('Event accept-selection triggered');
    cookieStore.saveSelection();
    showBanner = false;
  }}
/>


<Footer />

<style lang="scss">
	.textmenu {
		font-size: 1em;
	}
	header {
		position: fixed;
		top: 0px;
		width: 100%;
		height: 100px;
		z-index: 1;
	}
	.navItem {
		text-decoration: none;
		position: relative;
		display: inline-block;

		&::after {
			content: "";
			background: #d2691e;
			height: 1px;
			position: absolute;
			bottom: 0;
			transition: 0.16s all 0.025s;
			left: 100%;
			right: 0;
		}

		&:hover::after {
			left: 0;
			right: 0;
		}
	}
</style>
