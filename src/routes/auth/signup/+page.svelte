<script lang="ts">
	import type { ActionData } from "./$types";
	import { enhance } from "$app/forms";
	import recaptchaEnhance from "svelte-captcha-enhance";
	import AuthCard from "$lib/component/AuthCard.svelte";
	import { PUBLIC_RECAPTCHA_SITE_KEY } from "$env/static/public";
	import { browser } from "$app/environment";
	
	type FormData = {
		error?: boolean;
		success?: boolean;
		message?: string;
		errors?: Record<string, string>;
		email?: string;
		password?: string;
		repassword?: string;
	};
	
	export let form: FormData | null = null;
	export let data;
	export let params: Record<string, string> = {}; // Potlačení varování o neznámé prop
	let { session, supabase } = data;
	$: ({ session, supabase } = data);

	let loading = false;
	let agreedToTerms = false;
	let showPassword = false;
	let showRepassword = false;

	// Real-time validace
	let emailError = "";
	let passwordError = "";
	let repasswordError = "";

	// Funkce pro validaci emailu
	function validateEmail(email: string): string {
		if (!email) return "";
		if (!email.includes("@")) return "Zadejte platný email";
		if (email.length < 5) return "Email je příliš krátký";
		return "";
	}

	// Funkce pro validaci hesla
	function validatePassword(password: string): string {
		if (!password) return "";
		if (password.length < 8) return "Heslo musí mít alespoň 8 znaků";
		if (!/[A-Z]/.test(password)) return "Heslo musí obsahovat alespoň jedno velké písmeno";
		if (!/[0-9]/.test(password)) return "Heslo musí obsahovat alespoň jedno číslo";
		return "";
	}

	// Funkce pro validaci potvrzení hesla
	function validateRepassword(password: string, repassword: string): string {
		if (!repassword) return "";
		if (password !== repassword) return "Hesla se neshodují";
		return "";
	}

	// Reaktivní validace
	$: if (form?.errors) {
		emailError = form.errors.email || "";
		passwordError = form.errors.password || "";
		repasswordError = form.errors.repassword || "";
	}

	// Handler pro reCAPTCHA enhance - podle dokumentace svelte-captcha-enhance
	// Dokumentace: https://github.com/edde746/svelte-captcha-enhance
	// Formát: submit: ({ formData }) => ({ result }) => { ... }
	function handleRecaptchaSubmit({ formData }: { formData: any }) {
		if (!agreedToTerms) {
			return; // zabrání odeslání, pokud není souhlas
		}

		loading = true;
		
		// Debug: zkontrolovat, jestli je token v formData
		const token = formData.get("g-recaptcha-response");
		console.log('🔍 [RECAPTCHA CLIENT] Token in formData:', {
			hasToken: !!token,
			tokenType: typeof token,
			tokenLength: token?.toString().length || 0
		});

		return ({ result, update }: { result: any; update: any }) => {
			if (result.type === 'success' || result.type === 'failure') {
				loading = false;
			}
			update();
		};
	}

	// SvelteKit enhance pro zpracování výsledku (použije se pouze pokud není reCAPTCHA)
	function handleSubmit() {
		if (!agreedToTerms) {
			return; // zabrání odeslání, pokud není souhlas
		}

		loading = true;

		return async ({ result, update }: { result: any; update: any }) => {
			if (result.type === 'success' || result.type === 'failure') {
				loading = false;
			}
			await update();
		};
	}

	async function signInWithGoogle() {
		try {
			loading = true;
			const { error } = await supabase.auth.signInWithOAuth({
				provider: "google",
				options: {
					queryParams: {
						access_type: "offline",
						prompt: "consent"
					},
					redirectTo: `${window.location.origin}/auth/callback`
				}
			});
			if (error) throw error;
		} catch (error) {
			console.error("Chyba při přihlášení pomocí Google:", error);
		} finally {
			loading = false;
		}
	}

	async function signInWithFacebook() {
		try {
			loading = true;
			const { error } = await supabase.auth.signInWithOAuth({
				provider: "facebook",
				options: {
					queryParams: {
						access_type: "offline",
						prompt: "consent"
					},
					redirectTo: `${window.location.origin}/auth/callback`
				}
			});
			if (error) throw error;
		} catch (error) {
			console.error("Chyba při přihlášení pomocí Google:", error);
		} finally {
			loading = false;
		}
	}

	$: console.log("form:", form);

	const { generalSettings } = data;
</script>

<svelte:head>
	<title>Vytvoření nového účtu - {generalSettings?.shopName}</title>
	<meta name="description" content="Registrace nového účtu" />
	{#if browser && PUBLIC_RECAPTCHA_SITE_KEY}
		<script
			src="https://www.google.com/recaptcha/api.js?render={PUBLIC_RECAPTCHA_SITE_KEY}"
			async
			defer
		></script>
	{/if}
</svelte:head>

<AuthCard 
	title="Vytvoření nového účtu"
	subtitle="Máte již účet? <a href='/auth/login' class='underline hover:underline hover:text-black'>Přihlášení</a>"
>
	{#if browser && PUBLIC_RECAPTCHA_SITE_KEY}
		<form
			method="POST"
			action="?/signUp"
			use:recaptchaEnhance={{
				type: 'recaptcha',
				sitekey: PUBLIC_RECAPTCHA_SITE_KEY,
				action: 'signup',
				submit: handleRecaptchaSubmit
			}}
			class="space-y-6"
		>
			<!-- Email input -->
		<div class="flex flex-col">
			<div class="relative flex">
				<span class="inline-flex items-center px-3 text-sm text-gray-500 bg-white border-t border-b border-l border-gray-300 shadow-sm rounded-l-md">
					<svg width="15" height="15" fill="currentColor" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
						<path d="M1792 710v794q0 66-47 113t-113 47h-1472q-66 0-113-47t-47-113v-794q44 49 101 87 362 246 497 345 57 42 92.5 65.5t94.5 48 110 24.5h2q51 0 110-24.5t94.5-48 92.5-65.5q170-123 498-345 57-39 100-87zm0-294q0 79-49 151t-122 123q-376 261-468 325-10 7-42.5 30.5t-54 38-52 32.5-57.5 27-50 9h-2q-23 0-50-9t-57.5-27-52-32.5-54-38-42.5-30.5q-91-64-262-182.5t-205-142.5q-62-42-117-115.5t-55-136.5q0-78 41.5-130t118.5-52h1472q65 0 112.5 47t47.5 113z" />
					</svg>
				</span>
				<input
					value={form?.email ?? ""}
					type="email"
					id="email"
					name="email"
					class="w-full px-4 py-2 text-base bg-white border border-gray-300 rounded-lg shadow-sm appearance-none text-gray-700 focus:outline-none focus:border-green-600"
					class:border-red-500={emailError}
					placeholder="Email"
					required
				/>
			</div>
			{#if emailError}
				<p class="mt-1 text-xs text-red-600">{emailError}</p>
			{/if}
		</div>

		<!-- Password input -->
		<div class="flex flex-col">
			<div class="relative flex">
				<span class="inline-flex items-center px-3 text-sm text-gray-500 bg-white border-t border-b border-l border-gray-300 shadow-sm rounded-l-md">
					<svg width="15" height="15" fill="currentColor" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
						<path d="M1376 768q40 0 68 28t28 68v576q0 40-28 68t-68 28h-960q-40 0-68-28t-28-68v-576q0-40 28-68t68-28h32v-320q0-185 131.5-316.5t316.5-131.5 316.5 131.5 131.5 316.5q0 26-19 45t-45 19h-64q-26 0-45-19t-19-45q0-106-75-181t-181-75-181 75-75 181v320h736z" />
					</svg>
				</span>
				<input
					value={form?.password ?? ""}
					type={showPassword ? "text" : "password"}
					id="password"
					name="password"
					class="flex-1 min-w-0 px-4 py-2 pr-10 text-base bg-white border border-gray-300 rounded-r-none shadow-sm appearance-none text-gray-700 focus:outline-none focus:border-green-600 border-l-0"
					class:border-red-500={passwordError}
					placeholder="Heslo (min 8 znaků, velké písmeno, číslo)"
					minlength="8"
					required
				/>
				<button
					type="button"
					class="inline-flex items-center justify-center px-3 text-gray-500 bg-white border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-green-600"
					class:border-red-500={passwordError}
					title={showPassword ? "Skrýt heslo" : "Zobrazit heslo"}
					on:click={() => showPassword = !showPassword}
					tabindex="-1"
				>
					{#if showPassword}
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
						</svg>
					{:else}
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
						</svg>
					{/if}
				</button>
			</div>
			{#if passwordError}
				<p class="mt-1 text-xs text-red-600">{passwordError}</p>
			{/if}
		</div>

		<!-- Password confirmation -->
		<div class="flex flex-col">
			<div class="relative flex">
				<span class="inline-flex items-center px-3 text-sm text-gray-500 bg-white border-t border-b border-l border-gray-300 shadow-sm rounded-l-md">
					<svg width="15" height="15" fill="currentColor" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
						<path d="M1376 768q40 0 68 28t28 68v576q0 40-28 68t-68 28h-960q-40 0-68-28t-28-68v-576q0-40 28-68t68-28h32v-320q0-185 131.5-316.5t316.5-131.5 316.5 131.5 131.5 316.5q0 26-19 45t-45 19h-64q-26 0-45-19t-19-45q0-106-75-181t-181-75-181 75-75 181v320h736z" />
					</svg>
				</span>
				<input
					value={form?.repassword ?? ""}
					type={showRepassword ? "text" : "password"}
					id="repassword"
					name="repassword"
					class="flex-1 min-w-0 px-4 py-2 pr-10 text-base bg-white border border-gray-300 rounded-r-none shadow-sm appearance-none text-gray-700 focus:outline-none focus:border-green-600 border-l-0"
					class:border-red-500={repasswordError}
					placeholder="Potvrzení hesla"
					minlength="8"
					required
				/>
				<button
					type="button"
					class="inline-flex items-center justify-center px-3 text-gray-500 bg-white border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-green-600"
					class:border-red-500={repasswordError}
					title={showRepassword ? "Skrýt heslo" : "Zobrazit heslo"}
					on:click={() => showRepassword = !showRepassword}
					tabindex="-1"
				>
					{#if showRepassword}
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
						</svg>
					{:else}
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
						</svg>
					{/if}
				</button>
			</div>
			{#if repasswordError}
				<p class="mt-1 text-xs text-red-600">{repasswordError}</p>
			{/if}
		</div>


		<!-- Terms agreement -->
		<div class="space-y-2">
			<label class="flex items-center">
				<input
					type="checkbox"
					bind:checked={agreedToTerms}
					class="mr-2 rounded text-green-800 focus:ring-green-800"
				/>
				<span class="text-sm text-gray-700">
					<a href="/obchodni-podminky" class="text-sm text-gray-700 hover:underline">
						Souhlas s obchodními podmínkami
					</a>
				</span>
			</label>
			{#if !agreedToTerms}
				<p class="text-xs text-red-600 font-semibold">
					Pro dokončení registrace je nutné souhlasit s obchodními podmínkami
				</p>
			{/if}
		</div>

		<!-- Submit button -->
		<button
			type="submit"
			class="w-full px-4 py-2 text-base font-semibold text-center text-white transition duration-200 ease-in-out transform bg-green-800 rounded-lg shadow-md hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
			disabled={loading || !agreedToTerms}
		>
			{#if loading}
				<span class="inline-flex items-center justify-center">
					<svg class="w-4 h-4 mr-2 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					Probíhá registrace...
				</span>
			{:else}
				Registrovat
			{/if}
		</button>

			<!-- Form messages -->
			{#if form}
				<div
					class="w-full p-3 border rounded-lg"
					class:bg-red-50={form.error}
					class:bg-green-50={!form.error}
				>
					<p
						class:text-red-700={form.error}
						class:text-green-700={!form.error}
						class="text-sm"
					>
						{form.message}
					</p>
				</div>
			{/if}
		</form>
	{:else}
		<form
			method="POST"
			action="?/signUp"
			use:enhance={handleSubmit}
			class="space-y-6"
		>
			<!-- Email input -->
			<div class="flex flex-col">
				<div class="relative flex">
					<span class="inline-flex items-center px-3 text-sm text-gray-500 bg-white border-t border-b border-l border-gray-300 shadow-sm rounded-l-md">
						<svg width="15" height="15" fill="currentColor" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
							<path d="M1792 710v794q0 66-47 113t-113 47h-1472q-66 0-113-47t-47-113v-794q44 49 101 87 362 246 497 345 57 42 92.5 65.5t94.5 48 110 24.5h2q51 0 110-24.5t94.5-48 92.5-65.5q170-123 498-345 57-39 100-87zm0-294q0 79-49 151t-122 123q-376 261-468 325-10 7-42.5 30.5t-54 38-52 32.5-57.5 27-50 9h-2q-23 0-50-9t-57.5-27-52-32.5-54-38-42.5-30.5q-91-64-262-182.5t-205-142.5q-62-42-117-115.5t-55-136.5q0-78 41.5-130t118.5-52h1472q65 0 112.5 47t47.5 113z" />
						</svg>
					</span>
					<input
						value={form?.email ?? ""}
						type="email"
						id="email"
						name="email"
						class="w-full px-4 py-2 text-base bg-white border border-gray-300 rounded-lg shadow-sm appearance-none text-gray-700 focus:outline-none focus:border-green-600"
						class:border-red-500={emailError}
						placeholder="Email"
						required
					/>
				</div>
				{#if emailError}
					<p class="mt-1 text-xs text-red-600">{emailError}</p>
				{/if}
			</div>

			<!-- Password input -->
			<div class="flex flex-col">
				<div class="relative flex">
					<span class="inline-flex items-center px-3 text-sm text-gray-500 bg-white border-t border-b border-l border-gray-300 shadow-sm rounded-l-md">
						<svg width="15" height="15" fill="currentColor" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
							<path d="M1376 768q40 0 68 28t28 68v576q0 40-28 68t-68 28h-960q-40 0-68-28t-28-68v-576q0-40 28-68t68-28h32v-320q0-185 131.5-316.5t316.5-131.5 316.5 131.5 131.5 316.5q0 26-19 45t-45 19h-64q-26 0-45-19t-19-45q0-106-75-181t-181-75-181 75-75 181v320h736z" />
						</svg>
					</span>
					<input
						value={form?.password ?? ""}
						type={showPassword ? "text" : "password"}
						id="password"
						name="password"
						class="flex-1 min-w-0 px-4 py-2 pr-10 text-base bg-white border border-gray-300 rounded-r-none shadow-sm appearance-none text-gray-700 focus:outline-none focus:border-green-600 border-l-0"
						class:border-red-500={passwordError}
						placeholder="Heslo (min 8 znaků, velké písmeno, číslo)"
						minlength="8"
						required
					/>
					<button
						type="button"
						class="inline-flex items-center justify-center px-3 text-gray-500 bg-white border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-green-600"
						class:border-red-500={passwordError}
						title={showPassword ? "Skrýt heslo" : "Zobrazit heslo"}
						on:click={() => showPassword = !showPassword}
						tabindex="-1"
					>
						{#if showPassword}
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
							</svg>
						{:else}
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
							</svg>
						{/if}
					</button>
				</div>
				{#if passwordError}
					<p class="mt-1 text-xs text-red-600">{passwordError}</p>
				{/if}
			</div>

			<!-- Password confirmation -->
			<div class="flex flex-col">
				<div class="relative flex">
					<span class="inline-flex items-center px-3 text-sm text-gray-500 bg-white border-t border-b border-l border-gray-300 shadow-sm rounded-l-md">
						<svg width="15" height="15" fill="currentColor" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
							<path d="M1376 768q40 0 68 28t28 68v576q0 40-28 68t-68 28h-960q-40 0-68-28t-28-68v-576q0-40 28-68t68-28h32v-320q0-185 131.5-316.5t316.5-131.5 316.5 131.5 131.5 316.5q0 26-19 45t-45 19h-64q-26 0-45-19t-19-45q0-106-75-181t-181-75-181 75-75 181v320h736z" />
						</svg>
					</span>
					<input
						value={form?.repassword ?? ""}
						type={showRepassword ? "text" : "password"}
						id="repassword"
						name="repassword"
						class="flex-1 min-w-0 px-4 py-2 pr-10 text-base bg-white border border-gray-300 rounded-r-none shadow-sm appearance-none text-gray-700 focus:outline-none focus:border-green-600 border-l-0"
						class:border-red-500={repasswordError}
						placeholder="Potvrzení hesla"
						minlength="8"
						required
					/>
					<button
						type="button"
						class="inline-flex items-center justify-center px-3 text-gray-500 bg-white border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-green-600"
						class:border-red-500={repasswordError}
						title={showRepassword ? "Skrýt heslo" : "Zobrazit heslo"}
						on:click={() => showRepassword = !showRepassword}
						tabindex="-1"
					>
						{#if showRepassword}
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
							</svg>
						{:else}
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
							</svg>
						{/if}
					</button>
				</div>
				{#if repasswordError}
					<p class="mt-1 text-xs text-red-600">{repasswordError}</p>
				{/if}
			</div>


			<!-- Terms agreement -->
			<div class="space-y-2">
				<label class="flex items-center">
					<input
						type="checkbox"
						bind:checked={agreedToTerms}
						class="mr-2 rounded text-green-800 focus:ring-green-800"
					/>
					<span class="text-sm text-gray-700">
						<a href="/obchodni-podminky" class="text-sm text-gray-700 hover:underline">
							Souhlas s obchodními podmínkami
						</a>
					</span>
				</label>
				{#if !agreedToTerms}
					<p class="text-xs text-red-600 font-semibold">
						Pro dokončení registrace je nutné souhlasit s obchodními podmínkami
					</p>
				{/if}
			</div>

			<!-- Submit button -->
			<button
				type="submit"
				class="w-full px-4 py-2 text-base font-semibold text-center text-white transition duration-200 ease-in-out transform bg-green-800 rounded-lg shadow-md hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
				disabled={loading || !agreedToTerms}
			>
				{#if loading}
					<span class="inline-flex items-center justify-center">
						<svg class="w-4 h-4 mr-2 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Probíhá registrace...
					</span>
				{:else}
					Registrovat
				{/if}
			</button>

			<!-- Form messages -->
			{#if form}
				<div
					class="w-full p-3 border rounded-lg"
					class:bg-red-50={form.error}
					class:bg-green-50={!form.error}
				>
					<p
						class:text-red-700={form.error}
						class:text-green-700={!form.error}
						class="text-sm"
					>
						{form.message}
					</p>
				</div>
			{/if}
		</form>
	{/if}
</AuthCard>