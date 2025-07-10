<script lang="ts">
	import { fade } from "svelte/transition";
	import type { Writable } from "svelte/store";

	export let editableSettings: Writable<any>;
</script>

<div in:fade={{ duration: 300 }}>
	<h2 class="text-xl font-semibold mb-4">Šablony e-mailů</h2>

	<div class="space-y-4">
		<div class="form-control">
			<label class="label">
				<span class="label-text">Šablona potvrzení objednávky</span>
			</label>
			<textarea
				bind:value={$editableSettings.email.orderConfirmationTemplate}
				class="textarea textarea-bordered w-full h-32"
				placeholder="Použijte {'{{orderNumber}}'} pro vložení čísla objednávky."
			></textarea>
			<span class="text-xs text-gray-500 mt-1">
				Můžete použít {'{{orderNumber}}'} pro vložení čísla objednávky.
			</span>
		</div>

		<div class="form-control">
			<label class="label">
				<span class="label-text">Šablona kontaktního formuláře</span>
			</label>
			<textarea
				bind:value={$editableSettings.email.contactFormTemplate}
				class="textarea textarea-bordered w-full h-32"
			></textarea>
		</div>
	</div>
</div> 