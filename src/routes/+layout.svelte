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
	import type { Profile } from "$lib/types/profile";

	export let data;
	let { supabase, session, user, profile } = data;
	$: ({ supabase, session, user, profile } = data);

	// Kontrola nedokončené registrace
	$: showRegistrationBanner = session && user && profile && !profile.registration_status && !$page.url.pathname.startsWith('/signup/complete');

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((event) => {
			if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
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
		const cookieConsent = cookieStore.hasConsent();
		showBanner = !cookieConsent;
	});
</script>

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
