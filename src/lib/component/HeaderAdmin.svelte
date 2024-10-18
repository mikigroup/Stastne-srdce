<script lang="ts">
	import { page } from "$app/stores";
	import { readable } from "svelte/store";
	import { Icon, FaceSmile } from "svelte-hero-icons";
	import { ROUTES } from "$lib/stores/store";

	export let data;
	let { supabase, session, user } = data;
	$: ({ supabase, session, user } = data);

	async function getProfile() {
		try {
			const { data: profile, error } = await supabase
				.from("profiles")
				.select("username")
				.eq("id", session.user.id)
				.single();
			if (error) {
				console.error("Error fetching profile:", error);
				return null;
			}
			return profile;
		} catch (error) {
			console.error("Error fetching profile:", error);
			return null;
		}
	}

	let loading = false;
	const weekdays = [
		"Neděle",
		"Pondělí",
		"Úterý",
		"Středa",
		"Čtvrtek",
		"Pátek",
		"Sobota"
	];

	const formatterDate = new Intl.DateTimeFormat("cs", {
		month: "short",
		day: "numeric"
	});

	const formatterTime = new Intl.DateTimeFormat("cs", {
		hour12: false,
		hour: "numeric",
		minute: "2-digit"
	});

	const currentDate = readable(new Date(), function start(set) {
		const interval = setInterval(() => {
			set(new Date());
		}, 1000);

		return function stop() {
			clearInterval(interval);
		};
	});

	let day = "";
	$: {
		if ($currentDate) {
			const dayIndex = $currentDate.getDay();
			day = weekdays[dayIndex];
		}
	}

	let isMenuOpen = false;
	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
		console.log("Menu opened");
	}

	async function signOut() {
		try {
			loading = true;
			const { error } = await supabase.auth.signOut();
			if (error) throw error;
			window.location.href = "/";
		} catch (error) {
			if (error instanceof Error) {
				alert(error.message);
			}
		} finally {
			loading = false;
		}
	}
</script>

<nav class="m-2" data-sveltekit-preload-data="hover">
	<div class="navbar border-cyan-500 border rounded-2xl !py-0 bg-sky-300">
		<div class="navbar-start">
			<div class="dropdown">
				<div tabindex="0" role="button" class="btn btn-ghost btn-circle">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="w-5 h-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h7" /></svg>
				</div>
				<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
				<ul
					tabindex="0"
					class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
					<li><a href="/">Šťastné srdce</a></li>

					<li><a href={$ROUTES.ADMIN.BASE}>Nástěnka</a></li>
					<li><a href="/admin/customer">Zákazníci</a></li>
					<li><a href="/admin/order">Objednávky</a></li>
					<li><a href="/admin/menu">Menu</a></li>
					<li><a href="/admin/text">Texty</a></li>
				</ul>
			</div>
			<p class="text-xl">Malý LEO</p>
		</div>
		<div class="navbar-center">
			<div class="flex justify-center w-1/4 m-5 text-md xl:text-lg">
				{#if $page.data.session}
					{#await getProfile()}
						<p>...</p>
					{:then profile}
						{#if profile}
							<p>Vítej, {profile.username}!</p>
							<span class="pr-2">&nbsp;</span><Icon src={FaceSmile} size="26" />
						{:else}
							<p>Profil nenalezen.</p>
						{/if}
					{/await}
				{:else}
					<p>Vítej, cizinče!</p>
				{/if}
			</div>
			<div class="flex flex-row justify-center p-2 m-5 w-80 text-md">
				<time class=""
					>{day}<span class="pr-2">&nbsp;</span>{formatterDate.format(
						$currentDate
					)}</time>
				<span class="pr-2">&nbsp;</span>
				<time class="">{formatterTime.format($currentDate)}</time>
			</div>
		</div>
		<div class="navbar-end">
			{#if $page.data.session}
				<div class="hidden md:block">
					<div class="dropdown dropdown-end">
						<div
							tabindex="0"
							role="button"
							class="btn btn-ghost btn-circle avatar">
							<div class="w-10 rounded-full">
								<img alt="Profile img" src="/spock-icon.jpg" />
							</div>
						</div>
						<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
						<ul
							tabindex="0"
							class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
							<li>
								<!-- svelte-ignore a11y-missing-attribute -->
								<a href="/admin/settings" class="justify-between">
									Nastavení účtu
									<span class="badge">Nový</span>
								</a>
							</li>
							<li><a on:click={signOut} disabled={loading}>Odhlásit se</a></li>
						</ul>
					</div>
				</div>
			{:else}
				<button
					><a
						href="/admin/signin"
						class="text-white bg-blue-700 mr-2 hover:bg-blue-800 rounded-lg px-5 py-2.5 text-center"
						>Přihlásit</a
					></button>
				<button
					><a
						href="/admin/signup"
						class="text-white bg-blue-700 mr-2 hover:bg-blue-800 rounded-lg px-5 py-2.5 text-center"
						>Registrovat</a
					></button>
			{/if}
		</div>
	</div>
</nav>
