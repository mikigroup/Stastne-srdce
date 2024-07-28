	<script lang="ts">
		import { slide } from "svelte/transition";
		import "./app.css";
		import "./banner.css";
		import { totalPiecesStore } from "../routes/Stores/totalPiecesStore";
		import { page } from "$app/stores";
		import { readable } from "svelte/store";
		import GDPR from "$lib/gdpr/Gdpr.svelte";
		import { goto, invalidate } from "$app/navigation";
		import { onMount } from "svelte";
		import HeaderAdmin from "$lib/component/HeaderAdmin.svelte";
		import HeaderCustomer from "$lib/component/HeaderCustomer.svelte";

		export let data;
		let { supabase, session, user } = data;
		$: ({ supabase, session, user  } = data);

		onMount(() => {
			const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
				if (newSession?.expires_at !== session?.expires_at) {
					invalidate("supabase:auth");
				}
			});
			return () => data.subscription.unsubscribe();
		});


		$: isAdminRoute = $page.url.pathname.startsWith('/admin');
	</script>

	<!-- <Header /> -->
	{#if !isAdminRoute}
		<HeaderCustomer {data} />
	{:else}
	<HeaderAdmin {data} />
	{/if}

	<div class="pt-5 mt-20" />
	<slot class="mt-10" />

	<GDPR cookieName="gdpr" />
	<!-- <GdprBanner bind:this={gdprBanner} cookieName="props.beyonk_gdpr" {...props} on:analytics={initAnalytics} /> -->

	<footer class="">
		<div
			class="grid p-4 mt-40 text-gray-500 border-2 rounded-lg md:grid-cols-5 md:mx-4">
			<div class="grid col-span-2 text-sm">
				<p>
					<a
						class="items-center mt-3 text-sm sm:mt-0"
						target="_blank"
						href="https://www.mikigroup.cz/"
						>Vytvořeno <i class="fa fa-regular fa-hand-spock" /> Mikigroup™</a>
				</p>
			</div>
			<div class="grid justify-end col-span-3 text-sm">
				<p>Šťastné srdce 2022-2024 ver_1.04</p>
			</div>
		</div>
	</footer>

	<style lang="postcss">
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
