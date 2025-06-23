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
	import type { AllSettings, GeneralSettings } from '$lib/settingsService';

	export let data: {
		session: Session | null;
		supabase: SupabaseClient;
		user: User | null;
		settings: Partial<AllSettings>;
		generalSettings: GeneralSettings | undefined;
		profile: Profile | null;
	};
	let { supabase, session, user, profile } = data;
	$: ({ supabase, session, user, profile } = data);

	// Kontrola nedokončené registrace
	$: showRegistrationBanner = browser && session && user && profile && profile.registration_status !== "completed" && !$page.url.pathname.startsWith('/signup/complete');

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((event) => {
			if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
				invalidate("supabase:auth");
			}
		});
		return () => data.subscription.unsubscribe();
	});

	$: isAdminRoute = browser && $page.url.pathname.startsWith("/admin");
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
	{#if appearanceSettings?.metaAuthor}
		<meta name="author" content={appearanceSettings.metaAuthor} />
	{/if}
	
	{#if appearanceSettings?.metaCopyright}
		<meta name="copyright" content={appearanceSettings.metaCopyright} />
	{/if}
	
	{#if appearanceSettings?.metaRobots}
		<meta name="robots" content={appearanceSettings.metaRobots} />
	{/if}

	<!-- SEO meta tagy -->
	{#if seoSettings?.metaTitle}
		<title>{seoSettings.metaTitle}</title>
	{:else if generalSettings?.shopName}
		<title>{generalSettings.shopName} - Zdravé stravování a rozvoz jídla</title>
	{/if}
	
	{#if seoSettings?.metaDescription}
		<meta name="description" content={seoSettings.metaDescription} />
	{/if}
	
	{#if seoSettings?.metaKeywords}
		<meta name="keywords" content={seoSettings.metaKeywords} />
	{/if}
	
	<!-- Open Graph meta tagy -->
	{#if appearanceSettings?.ogType}
		<meta property="og:type" content={appearanceSettings.ogType} />
	{/if}
	
	{#if appearanceSettings?.ogUrl}
		<meta property="og:url" content={appearanceSettings.ogUrl} />
	{/if}
	
	{#if appearanceSettings?.ogLocale}
		<meta property="og:locale" content={appearanceSettings.ogLocale} />
	{/if}
	
	{#if seoSettings?.metaTitle}
		<meta property="og:title" content={seoSettings.metaTitle} />
	{:else if generalSettings?.shopName}
		<meta property="og:title" content="{generalSettings.shopName} - Zdravé stravování a rozvoz jídla" />
	{/if}
	
	{#if seoSettings?.metaDescription}
		<meta property="og:description" content={seoSettings.metaDescription} />
	{/if}
	
	{#if seoSettings?.ogImage}
		<meta property="og:image" content={seoSettings.ogImage} />
	{/if}
	
	<!-- Twitter meta tagy -->
	{#if appearanceSettings?.twitterCard}
		<meta name="twitter:card" content={appearanceSettings.twitterCard} />
	{/if}
	
	{#if seoSettings?.metaTitle}
		<meta name="twitter:title" content={seoSettings.metaTitle} />
	{:else if generalSettings?.shopName}
		<meta name="twitter:title" content="{generalSettings.shopName} - Zdravé stravování a rozvoz jídla" />
	{/if}
	
	{#if seoSettings?.metaDescription}
		<meta name="twitter:description" content={seoSettings.metaDescription} />
	{/if}
	
	<!-- Favicon a ikony -->
	{#if appearanceSettings && 'favicon' in appearanceSettings && appearanceSettings.favicon}
		<link rel="icon" href={String(appearanceSettings.favicon)} sizes="any" />
	{/if}
	
	{#if appearanceSettings?.appleTouchIcon}
		<link rel="apple-touch-icon" href={appearanceSettings.appleTouchIcon} />
	{/if}
	
	{#if appearanceSettings?.webManifest}
		<link rel="manifest" href={appearanceSettings.webManifest} />
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
	{#if appearanceSettings?.customHeadScripts}
		{@html appearanceSettings.customHeadScripts}
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
				 src="https://www.facebook.com/tr?id={seoSettings.facebookPixelId}&ev=PageView&noscript=1" />
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

<main class="">
	<slot class="mt-10 container mx-auto " />
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
					<a href="/signup/complete" class="font-medium underline text-yellow-700 hover:text-yellow-600">
						Dokončit registraci
					</a>
				</p>
			</div>
		</div>
	</div>
{/if}

<GDPR
	cookieName="stastne_srdce_cookies"
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
{#if appearanceSettings?.customBodyScripts}
	{@html appearanceSettings.customBodyScripts}
{/if}

<style lang="postcss">
	.textmenu {
		@apply text-base;
	}
	
	header {
		@apply fixed top-0 w-full h-[100px] z-10;
	}
	
	.navItem {
		@apply no-underline relative inline-block;
		
		&::after {
			content: "";
			@apply bg-[#d2691e] h-[1px] absolute bottom-0 transition-all duration-150 delay-[25ms] left-full right-0;
		}
		
		&:hover::after {
			@apply left-0 right-0;
		}
	}
</style>
