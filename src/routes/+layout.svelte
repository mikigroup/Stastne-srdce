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
</script>

<svelte:head>
	<!-- Základní meta tagy -->
	<title>{$page.data.seo?.title}</title>
	<meta name="description" content={$page.data.seo?.description} />
	<meta name="author" content={$page.data.seo?.author} />
	<meta name="keywords" content={$page.data.seo?.keywords} />
	<meta name="copyright" content={$page.data.seo?.copyright} />

	<!-- OpenGraph -->
	<meta property="og:title" content={$page.data.seo?.ogTitle} />
	<meta property="og:description" content={$page.data.seo?.ogDescription} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={$page.data.seo?.url} />
	<meta property="og:locale" content="cs_CZ" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={$page.data.seo?.twitterTitle} />
	<meta name="twitter:description" content={$page.data.seo?.twitterDescription} />

	<!-- Kanonická URL - důležité pro SEO -->
	<link rel="canonical" href={$page.data.seo?.url + $page.url.pathname} />
</svelte:head>


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

<main>
	<slot class="mt-10 container mx-auto" />
</main>

<GDPR cookieName="gdpr" />
<!-- <GdprBanner bind:this={gdprBanner} cookieName="props.beyonk_gdpr" {...props} on:analytics={initAnalytics} /> -->

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
