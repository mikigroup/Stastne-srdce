<script lang="ts">
	import { fade } from "svelte/transition";
	import type { Writable } from "svelte/store";

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
	</div>
</div> 