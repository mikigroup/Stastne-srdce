<script lang="ts">
	import "./app.css";
	import "./banner.css";
	import { page } from "$app/stores";
	import { browser } from "$app/environment";
	import GDPR from "$lib/gdpr/Gdpr.svelte";
	import { invalidate } from "$app/navigation";
	import { onMount } from "svelte";
	import HeaderAdmin from "$lib/component/HeaderAdmin.svelte";
	import HeaderCustomer from "$lib/component/HeaderCustomer.svelte";
	import Footer from "$lib/component/Footer.svelte";
	import { injectSpeedInsights } from "@vercel/speed-insights/sveltekit";
	import { cookieStore } from '$lib/stores/cookieStore';
	import type { Profile } from "$lib/types/profile";
	import type { Session, User } from '@supabase/supabase-js';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import type { GeneralSettings } from '$lib/constants/defaultSettings';
	import { ROUTES } from "$lib/constants/routes";

	export let data: {
		session: Session | null;
		supabase: SupabaseClient;
		user: User | null;
		settings: {
			general: any;
			contact: any;
			social: any;
			seo: any;
			appearance: any;
		};
		generalSettings: GeneralSettings | undefined;
		profile: Profile | null;
	};
	let { supabase, session, user, profile } = data;
	$: ({ supabase, session, user, profile } = data);

	// Kontrola nedokončené registrace
	$: showRegistrationBanner = browser && session && user && profile && profile.registration_status !== "completed" && !$page.url.pathname.startsWith(ROUTES.AUTH.SIGNUP_COMPLETE);

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((event) => {
			if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
				invalidate("supabase:auth");
			}
		});
		return () => data.subscription.unsubscribe();
	});

	let isAdminRoute = false;
	
	onMount(() => {
		isAdminRoute = $page.url.pathname.startsWith("/admin");
	});
	injectSpeedInsights();

	const cookieName = 'stastne_srdce_cookies';
	let showBanner = false;

	onMount(() => {
		const cookieConsent = cookieStore.hasConsent();
		showBanner = !cookieConsent;
	});

	// SEO data z nastavení
	$: seoSettings = data.settings?.seo;
	$: generalSettings = data.settings?.general;
	$: appearanceSettings = data.settings?.appearance;
</script>

<!-- Globální SEO meta tagy pro celý web -->
<svelte:head>
	<!-- Základní meta tagy -->
	{#if seoSettings?.metaAuthor}
		<meta name="author" content={seoSettings.metaAuthor} />
	{/if}
	
	{#if seoSettings?.metaCopyright}
		<meta name="copyright" content={seoSettings.metaCopyright} />
	{/if}
	
	{#if seoSettings?.metaRobots}
		<meta name="robots" content={seoSettings.metaRobots} />
	{/if}

	<!-- SEO meta tagy -->
	{#if seoSettings?.metaTitle}
		<title>{seoSettings.metaTitle} - {generalSettings?.shopName}</title>
	{:else if generalSettings?.shopName}
		<title>Zdravé stravování a rozvoz jídla - {generalSettings.shopName}</title>
	{/if}
	
	<!-- Canonical URL pro všechny stránky -->
	<link rel="canonical" href="https://www.stastnesrdce.cz{$page.url.pathname}" />
	
	<!-- Robots meta tagy pro problematické stránky -->
	{#if $page.url.pathname.startsWith('/admin') || $page.url.pathname.startsWith('/auth')}
		<meta name="robots" content="noindex, nofollow" />
	{/if}
	
	{#if seoSettings?.metaDescription}
		<meta name="description" content={seoSettings.metaDescription} />
	{/if}
	
	{#if seoSettings?.metaKeywords}
		<meta name="keywords" content={seoSettings.metaKeywords} />
	{/if}
	
	<!-- Open Graph meta tagy -->
	{#if seoSettings?.ogType}
		<meta property="og:type" content={seoSettings.ogType} />
	{/if}
	
	{#if seoSettings?.ogUrl}
		<meta property="og:url" content={seoSettings.ogUrl} />
	{/if}
	
	{#if seoSettings?.ogLocale}
		<meta property="og:locale" content={seoSettings.ogLocale} />
	{/if}
	
	{#if seoSettings?.metaTitle}
		<meta property="og:title" content="{seoSettings.metaTitle} - {generalSettings?.shopName}" />
	{:else if generalSettings?.shopName}
		<meta property="og:title" content="Zdravé stravování a rozvoz jídla - {generalSettings.shopName}" />
	{/if}
	
	{#if seoSettings?.metaDescription}
		<meta property="og:description" content={seoSettings.metaDescription} />
	{/if}
	
	{#if seoSettings?.ogImage}
		<meta property="og:image" content={seoSettings.ogImage} />
	{/if}
	
	<!-- Twitter meta tagy -->
	{#if seoSettings?.twitterCard}
		<meta name="twitter:card" content={seoSettings.twitterCard} />
	{/if}
	
	{#if seoSettings?.metaTitle}
		<meta name="twitter:title" content="{seoSettings.metaTitle} - {generalSettings?.shopName}" />
	{:else if generalSettings?.shopName}
		<meta name="twitter:title" content="Zdravé stravování a rozvoz jídla - {generalSettings.shopName}" />
	{/if}
	
	{#if seoSettings?.metaDescription}
		<meta name="twitter:description" content={seoSettings.metaDescription} />
	{/if}
	
	<!-- Favicon a ikony -->
	{#if appearanceSettings && 'favicon' in appearanceSettings && appearanceSettings.favicon}
		<link rel="icon" href={String(appearanceSettings.favicon)} sizes="any" />
	{/if}
	
	{#if seoSettings?.appleTouchIcon}
		<link rel="apple-touch-icon" href={seoSettings.appleTouchIcon} />
	{/if}
	
	{#if seoSettings?.webManifest}
		<link rel="manifest" href={seoSettings.webManifest} />
	{/if}
	
	<!-- Scripts -->
	<!-- FontAwesome - vždy zapnuté -->
	<script
		src="https://kit.fontawesome.com/e5ce1babf6.js"
		crossorigin="anonymous"></script>
	
	<!-- Lottie Player - vždy zapnuté -->
	<script
		src="https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs"
		type="module"></script>
	
	<!-- Custom Head Scripts -->
	{#if seoSettings?.customHeadScripts}
		{@html seoSettings.customHeadScripts}
	{/if}
	
	<!-- Google Analytics -->
	{#if seoSettings?.googleAnalyticsEnabled && seoSettings?.googleAnalyticsId}
		<script async src="https://www.googletagmanager.com/gtag/js?id={seoSettings.googleAnalyticsId}"></script>
		<script>
			window.dataLayer = window.dataLayer || [];
			function gtag(){dataLayer.push(arguments);}
			gtag('js', new Date());
			gtag('config', '{seoSettings.googleAnalyticsId}');
		</script>
	{/if}
	
	<!-- Facebook Pixel -->
	{#if seoSettings?.facebookPixelEnabled && seoSettings?.facebookPixelId}
		<script>
			!function(f,b,e,v,n,t,s)
			{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
			n.callMethod.apply(n,arguments):n.queue.push(arguments)};
			if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
			n.queue=[];t=b.createElement(e);t.async=!0;
			t.src=v;s=b.getElementsByTagName(e)[0];
			s.parentNode.insertBefore(t,s)}(window, document,'script',
			'https://connect.facebook.net/en_US/fbevents.js');
			fbq('init', '{seoSettings.facebookPixelId}');
			fbq('track', 'PageView');
		</script>
		<noscript>
			<img height="1" width="1" style="display:none" 
				 src="https://www.facebook.com/tr?id={seoSettings.facebookPixelId}&ev=PageView&noscript=1"
				 alt="Facebook Pixel" />
		</noscript>
	{/if}
</svelte:head>

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

<main>
	<slot />
</main>



{#if showRegistrationBanner}
	<div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 fixed top-0 left-0 right-0 z-50">
		<div class="flex">
			<div class="flex-shrink-0">
				<svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
				</svg>
			</div>
			<div class="ml-3">
				<p class="text-sm text-yellow-700">
					Pro plné využití všech funkcí je potřeba dokončit registraci.
					<a href={ROUTES.AUTH.SIGNUP_COMPLETE} class="font-medium underline text-yellow-700 hover:text-yellow-600">
						Dokončit registraci
					</a>
				</p>
			</div>
		</div>
	</div>
{/if}

<GDPR
	visible={showBanner}
	showEditIcon={true}
	on:show={() => {}}
	on:accept-all={() => {
		cookieStore.acceptAll();
		showBanner = false;
	}}
	on:reject-all={() => {
		cookieStore.rejectAll();
		showBanner = false;
	}}
	on:accept-selection={() => {
		cookieStore.saveSelection();
		showBanner = false;
	}}
/>

<Footer />

<!-- Custom Body Scripts -->
{#if seoSettings?.customBodyScripts}
	{@html seoSettings.customBodyScripts}
{/if}

<style lang="postcss">
	/* CSS selektory jsou nyní využívány v komponentách */
</style>
