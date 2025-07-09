<script lang="ts">
	import { fade } from "svelte/transition";
	import type { Writable } from 'svelte/store';

	export let editableSettings: Writable<any>;
	export let uploadingLogo: boolean;
	export let uploadingFavicon: boolean;
	export let logoFileInput: HTMLInputElement;
	export let faviconFileInput: HTMLInputElement;

	// Automatické spuštění uploadu při výběru logo souboru
	function handleLogoFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			// Najdeme formulář a odešleme ho
			const form = target.closest('form');
			if (form) {
				form.requestSubmit();
			}
		}
	}

	// Automatické spuštění uploadu při výběru favicon souboru
	function handleFaviconFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			// Najdeme formulář a odešleme ho
			const form = target.closest('form');
			if (form) {
				form.requestSubmit();
			}
		}
	}
</script>

<div in:fade={{ duration: 300 }}>
	<h2 class="text-xl font-semibold mb-4">Vzhled</h2>

	<div class="space-y-4">
		<div class="form-control">
			<label class="label">
				<span class="label-text">Logo</span>
			</label>
			
			<!-- Current logo display -->
			{#if $editableSettings.appearance.logo}
				<div class="mb-4 p-4 border rounded-lg bg-gray-50">
					<img
						src={$editableSettings.appearance.logo}
						alt="Logo"
						class="h-16 object-contain mb-2"
					/>
					<p class="text-sm text-gray-600">Současné logo</p>
				</div>
			{/if}								
			
			<form method="POST" action="?/upload" enctype="multipart/form-data">
				<input type="hidden" name="fileType" value="logo" />
				<fieldset class="fieldset">										
					<input 
						type="file" 
						name="file"
						accept="image/*"
						class="file-input file-input-bordered w-full" 
						bind:this={logoFileInput}
						on:change={handleLogoFileChange}
					/>
					<label class="label">
						<span class="label-text-alt">Max velikost 2MB, podporované formáty: PNG, JPG, SVG</span>
					</label>
					{#if uploadingLogo}
						<div class="flex items-center gap-2 mt-2">
							<span class="loading loading-spinner loading-sm"></span>
							<span class="text-sm">Nahrávám logo...</span>
						</div>
					{/if}
				</fieldset>
			</form>
		</div>

		<div class="form-control">
			<label class="label">
				<span class="label-text">Favicon</span>
			</label>
			
			<!-- Current favicon display -->
			{#if $editableSettings.appearance.favicon}
				<div class="mb-4 p-4 border rounded-lg bg-gray-50">
					<img
						src={$editableSettings.appearance.favicon}
						alt="Favicon"
						class="h-8 object-contain mb-2"
					/>
					<p class="text-sm text-gray-600">Současný favicon</p>
				</div>
			{/if}								
			
			<form method="POST" action="?/upload" enctype="multipart/form-data">
				<input type="hidden" name="fileType" value="favicon" />
				<fieldset class="fieldset">										
					<input 
						type="file" 
						name="file"
						accept="image/*"
						class="file-input file-input-bordered w-full" 
						bind:this={faviconFileInput}
						on:change={handleFaviconFileChange}
					/>
					<label class="label">
						<span class="label-text-alt">Max velikost 2MB, doporučujeme ICO nebo PNG formát</span>
					</label>
					{#if uploadingFavicon}
						<div class="flex items-center gap-2 mt-2">
							<span class="loading loading-spinner loading-sm"></span>
							<span class="text-sm">Nahrávám favicon...</span>
						</div>
					{/if}
				</fieldset>
			</form>
		</div>

		<div class="form-control">
			<label class="label">
				<span class="label-text">Text v patičce</span>
			</label>
			<input
				type="text"
				bind:value={$editableSettings.appearance.footerText}
				class="input input-bordered w-full"
			/>
		</div>

		<!-- Meta tagy sekce -->
		<div class="divider">META TAGY</div>
		
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div class="form-control">
				<label class="label">
					<span class="label-text">Autor (meta author)</span>
				</label>
				<input
					type="text"
					bind:value={$editableSettings.appearance.metaAuthor}
					class="input input-bordered w-full"
					placeholder="malyleo.cz"
				/>
			</div>

			<div class="form-control">
				<label class="label">
					<span class="label-text">Copyright (meta copyright)</span>
				</label>
				<input
					type="text"
					bind:value={$editableSettings.appearance.metaCopyright}
					class="input input-bordered w-full"
					placeholder="Šťastné srdce"
				/>
			</div>

			<div class="form-control">
				<label class="label">
					<span class="label-text">Robots (meta robots)</span>
				</label>
				<select
					bind:value={$editableSettings.appearance.metaRobots}
					class="select select-bordered w-full"
				>
					<option value="index, follow">Index, Follow</option>
					<option value="noindex, nofollow">Noindex, Nofollow</option>
					<option value="index, nofollow">Index, Nofollow</option>
					<option value="noindex, follow">Noindex, Follow</option>
				</select>
			</div>
		</div>

		<!-- Open Graph sekce -->
		<div class="divider">OPEN GRAPH</div>
		
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div class="form-control">
				<label class="label">
					<span class="label-text">OG Type</span>
				</label>
				<select
					bind:value={$editableSettings.appearance.ogType}
					class="select select-bordered w-full"
				>
					<option value="website">Website</option>
					<option value="article">Article</option>
					<option value="product">Product</option>
				</select>
			</div>

			<div class="form-control">
				<label class="label">
					<span class="label-text">OG URL</span>
				</label>
				<input
					type="url"
					bind:value={$editableSettings.appearance.ogUrl}
					class="input input-bordered w-full"
					placeholder="https://www.stastnesrdce.cz"
				/>
			</div>

			<div class="form-control">
				<label class="label">
					<span class="label-text">OG Locale</span>
				</label>
				<select
					bind:value={$editableSettings.appearance.ogLocale}
					class="select select-bordered w-full"
				>
					<option value="cs_CZ">cs_CZ</option>
					<option value="en_US">en_US</option>
					<option value="sk_SK">sk_SK</option>
				</select>
			</div>

			<div class="form-control">
				<label class="label">
					<span class="label-text">Twitter Card</span>
				</label>
				<select
					bind:value={$editableSettings.appearance.twitterCard}
					class="select select-bordered w-full"
				>
					<option value="summary_large_image">Summary Large Image</option>
					<option value="summary">Summary</option>
					<option value="app">App</option>
				</select>
			</div>
		</div>

		<!-- Web App sekce -->
		<div class="divider">WEB APP</div>
		
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div class="form-control">
				<label class="label">
					<span class="label-text">Apple Touch Icon</span>
				</label>
				<input
					type="text"
					bind:value={$editableSettings.appearance.appleTouchIcon}
					class="input input-bordered w-full"
					placeholder="/favi/apple-touch-icon.png"
				/>
			</div>

			<div class="form-control">
				<label class="label">
					<span class="label-text">Web Manifest</span>
				</label>
				<input
					type="text"
					bind:value={$editableSettings.appearance.webManifest}
					class="input input-bordered w-full"
					placeholder="/favi/site.webmanifest"
				/>
			</div>
		</div>

		<!-- Custom Scripts sekce -->
		<div class="divider">VLASTNÍ SCRIPTY</div>
		
		<div class="space-y-6">
			<div class="form-control">
				<label class="label">
					<span class="label-text">Scripty do HEAD sekce</span>
					<span class="label-text-alt">Pixels (GA a FB jsou v sekci SEO)</span>
				</label>
				<textarea
					bind:value={$editableSettings.appearance.customHeadScripts}
					class="textarea textarea-bordered h-32 font-mono text-sm"
					placeholder={`<script>
  // Váš kód zde
  console.log('Head script loaded');
</script>

<meta name="custom-meta" content="value" />`}
				></textarea>
				<label class="label">
					<span class="label-text-alt">Můžete vkládat &lt;script&gt;, &lt;meta&gt;, &lt;link&gt; a jiné HTML tagy</span>
				</label>
			</div>

			<div class="form-control">
				<label class="label">
					<span class="label-text">Scripty na konec BODY</span>
					<span class="label-text-alt">Tracking kódy, chat widgety, atd.</span>
				</label>
				<textarea
					bind:value={$editableSettings.appearance.customBodyScripts}
					class="textarea textarea-bordered h-32 font-mono text-sm"
					placeholder={`<script>
  // Váš kód zde
  console.log('Body script loaded');
</script>

<!-- Chat widget nebo jiné -->
<div id="custom-widget"></div>`}
				></textarea>
				<label class="label">
					<span class="label-text-alt">Scripty se vloží před konec &lt;/body&gt; tagu</span>
				</label>
			</div>

			<div class="alert alert-warning">
				<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
				</svg>
				<div>
					<h3 class="font-bold">Upozornění!</h3>
					<div class="text-sm">Vkládejte pouze kód z důvěryhodných zdrojů. Neplatný kód může poškodit funkčnost webu.</div>
				</div>
			</div>
		</div>
	</div>
</div> 