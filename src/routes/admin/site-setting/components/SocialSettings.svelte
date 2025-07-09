<script lang="ts">
	import { fade } from "svelte/transition";
	import type { Writable } from 'svelte/store';

	export let editableSettings: Writable<any>;
</script>

<div in:fade={{ duration: 300 }}>
	<h2 class="text-xl font-semibold mb-4">Sociální sítě</h2>

	<div class="space-y-4">
		<div class="form-control">
			<label class="label">
				<span class="label-text">Facebook URL</span>
			</label>
			<input
				type="url"
				bind:value={$editableSettings.social.facebook}
				class="input input-bordered w-full"
				placeholder="https://facebook.com/vasestanka"
			/>
		</div>

		<div class="form-control">
			<label class="label">
				<span class="label-text">Instagram URL</span>
			</label>
			<input
				type="url"
				bind:value={$editableSettings.social.instagram}
				class="input input-bordered w-full"
				placeholder="https://instagram.com/vasestanka"
			/>
		</div>

		<div class="form-control">
			<label class="label">
				<span class="label-text">Twitter URL</span>
			</label>
			<input
				type="url"
				bind:value={$editableSettings.social.twitter}
				class="input input-bordered w-full"
				placeholder="https://twitter.com/vasestanka"
			/>
		</div>

		<div class="form-control">
			<label class="label">
				<span class="label-text">LinkedIn URL</span>
			</label>
			<input
				type="url"
				bind:value={$editableSettings.social.linkedin}
				class="input input-bordered w-full"
				placeholder="https://linkedin.com/company/vasestanka"
			/>
		</div>

		<div class="form-control">
			<label class="label">
				<span class="label-text">YouTube URL</span>
			</label>
			<input
				type="url"
				bind:value={$editableSettings.social.youtube}
				class="input input-bordered w-full"
				placeholder="https://youtube.com/c/vasestanka"
			/>
		</div>
	</div>
</div> 