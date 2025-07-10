<script lang="ts">
	import { fade } from "svelte/transition";
	import type { Writable } from "svelte/store";

	export let editableSettings: Writable<any>;
</script>

<div in:fade={{ duration: 300 }}>
	<h2 class="text-xl font-semibold mb-4">SEO nastavení</h2>

	<div class="space-y-4">
		<div class="form-control">
			<label class="label">
				<span class="label-text">Meta titulek</span>
			</label>
			<input
				type="text"
				bind:value={$editableSettings.seo.metaTitle}
				class="input input-bordered w-full"
			/>
		</div>

		<div class="form-control">
			<label class="label">
				<span class="label-text">Meta popis</span>
			</label>
			<textarea
				bind:value={$editableSettings.seo.metaDescription}
				class="textarea textarea-bordered w-full h-24"
			></textarea>
		</div>

		<div class="form-control">
			<label class="label">
				<span class="label-text">Meta klíčová slova</span>
			</label>
			<textarea
				bind:value={$editableSettings.seo.metaKeywords}
				class="textarea textarea-bordered w-full h-24"
				placeholder="Klíčová slova oddělená čárkami"
			></textarea>
		</div>

		<div class="form-control">
			<label class="label">
				<span class="label-text">OG obrázek (URL)</span>
			</label>
			<input
				type="text"
				bind:value={$editableSettings.seo.ogImage}
				class="input input-bordered w-full"
			/>
		</div>

		<div class="form-control">
			<label class="label cursor-pointer justify-start gap-3">
				<input
					type="checkbox"
					bind:checked={$editableSettings.seo.googleAnalyticsEnabled}
					class="checkbox checkbox-primary"
				/>
				<span class="label-text">Google Analytics</span>
			</label>
			{#if $editableSettings.seo.googleAnalyticsEnabled}
				<input
					type="text"
					bind:value={$editableSettings.seo.googleAnalyticsId}
					class="input input-bordered w-full mt-2"
					placeholder="G-XXXXXXXXXX"
				/>
			{/if}
		</div>

		<div class="form-control">
			<label class="label cursor-pointer justify-start gap-3">
				<input
					type="checkbox"
					bind:checked={$editableSettings.seo.facebookPixelEnabled}
					class="checkbox checkbox-primary"
				/>
				<span class="label-text">Facebook Pixel</span>
			</label>
			{#if $editableSettings.seo.facebookPixelEnabled}
				<input
					type="text"
					bind:value={$editableSettings.seo.facebookPixelId}
					class="input input-bordered w-full mt-2"
					placeholder="123456789012345"
				/>
			{/if}
		</div>
	</div>
</div> 