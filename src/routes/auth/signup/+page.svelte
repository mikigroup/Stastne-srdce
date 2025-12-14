<script lang="ts">
	import type { ActionData } from "./$types";
	import { enhance } from "$app/forms";
	import AuthCard from "$lib/component/AuthCard.svelte";
	import { PUBLIC_RECAPTCHA_SITE_KEY } from "$env/static/public";
	import { browser } from "$app/environment";
	import { onMount } from "svelte";
	
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
	let { session, supabase } = data;
	$: ({ session, supabase } = data);

	let loading = false;
	let agreedToTerms = false;
	let recaptchaReady = false;

	// Inicializace reCAPTCHA po mount
	onMount(() => {
		if (browser && PUBLIC_RECAPTCHA_SITE_KEY) {
			// Zkontrolovat, jestli už není script načtený
			if ((window as any).grecaptcha) {
				// Script už je načtený, počkat na ready
				(window as any).grecaptcha.ready(() => {
					recaptchaReady = true;
				});
			} else {
				// Počkat na načtení scriptu z <svelte:head>
				const checkGrecaptcha = setInterval(() => {
					if ((window as any).grecaptcha) {
						clearInterval(checkGrecaptcha);
						(window as any).grecaptcha.ready(() => {
							recaptchaReady = true;
						});
					}
				}, 100);

				// Timeout po 5 sekundách
				setTimeout(() => {
					clearInterval(checkGrecaptcha);
					if ((window as any).grecaptcha) {
						recaptchaReady = true;
					}
				}, 5000);
			}
		}
	});

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

	// Funkce pro získání reCAPTCHA tokenu
	async function getRecaptchaToken(): Promise<string | null> {
		if (!browser || !PUBLIC_RECAPTCHA_SITE_KEY) {
			console.warn('⚠️ [RECAPTCHA] reCAPTCHA není nakonfigurováno');
			return null;
		}

		try {
			// Počkat na ready stav
			if (!recaptchaReady) {
				await new Promise<void>((resolve) => {
					const checkReady = setInterval(() => {
						if (recaptchaReady) {
							clearInterval(checkReady);
							resolve();
						}
					}, 50);

					// Timeout po 3 sekundách
					setTimeout(() => {
						clearInterval(checkReady);
						resolve();
					}, 3000);
				});
			}

			const grecaptcha = (window as any).grecaptcha;
			if (!grecaptcha) {
				console.error('❌ [RECAPTCHA] grecaptcha není dostupné');
				return null;
			}

			// Použít grecaptcha.ready() callback - vždy, i když už je ready
			return new Promise<string | null>((resolve) => {
				grecaptcha.ready(() => {
					grecaptcha.execute(PUBLIC_RECAPTCHA_SITE_KEY, { action: 'signup' })
						.then((token: string) => {
							resolve(token);
						})
						.catch((error: any) => {
							console.error('❌ [RECAPTCHA] Chyba při získávání tokenu:', error);
							resolve(null);
						});
				});
			});
		} catch (error) {
			console.error('❌ [RECAPTCHA] Chyba při získávání tokenu:', error);
			return null;
		}
	}

	function handleSubmit() {
		if (!agreedToTerms) return; // zabrání odeslání, pokud není souhlas

		loading = true;
		return async ({ cancel, formData }: { cancel: () => void; formData: FormData }) => {
			// Získat reCAPTCHA token
			const recaptchaToken = await getRecaptchaToken();
			
			if (!recaptchaToken && PUBLIC_RECAPTCHA_SITE_KEY) {
				// Pokud je reCAPTCHA nakonfigurováno, ale token se nepodařilo získat, zrušit odeslání
				console.error('❌ [RECAPTCHA] Nepodařilo se získat token');
				loading = false;
				cancel();
				// Zobrazit chybu uživateli
				alert('Chyba při ověřování. Zkuste to prosím znovu.');
				return;
			}

			// Přidat token do FormData
			if (recaptchaToken) {
				formData.append('recaptcha_token', recaptchaToken);
			}

			// Pokračovat s odesláním formuláře
			return async ({ result, update }: { result: any; update: any }) => {
				console.log('Form result:', result);

				if (result.type === 'success' || result.type === 'failure') {
					loading = false;
				}

				await update();
			};
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
</svelte:head>

<AuthCard 
	title="Vytvoření nového účtu"
	subtitle="Máte již účet? <a href='/auth/login' class='underline hover:underline hover:text-black'>Přihlášení</a>"
>
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
					type="password"
					id="password"
					name="password"
					class="w-full px-4 py-2 text-base bg-white border border-gray-300 rounded-lg shadow-sm appearance-none text-gray-700 focus:outline-none focus:border-green-600"
					class:border-red-500={passwordError}
					placeholder="Heslo (min 8 znaků, velké písmeno, číslo)"
					minlength="8"
					required
				/>
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
					type="password"
					id="repassword"
					name="repassword"
					class="w-full px-4 py-2 text-base bg-white border border-gray-300 rounded-lg shadow-sm appearance-none text-gray-700 focus:outline-none focus:border-green-600"
					class:border-red-500={repasswordError}
					placeholder="Potvrzení hesla"
					minlength="8"
					required
				/>
			</div>
			{#if repasswordError}
				<p class="mt-1 text-xs text-red-600">{repasswordError}</p>
			{/if}
		</div>

		<!-- reCAPTCHA token (hidden) -->
		<input type="hidden" name="recaptcha_token" value="" />

		<!-- Terms agreement -->
		<div class="space-y-2">
			<label class="flex items-center">
				<input
					type="checkbox"
					bind:checked={agreedToTerms}
					class="mr-2 rounded text-green-800 focus:ring-green-800"
				/>
				<span class="text-sm text-gray-700">
					<a href="/obchodni-podminky" class="text-sm text-gray-700 text-base hover:underline">
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
</AuthCard>