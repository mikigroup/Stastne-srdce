<script lang="ts">
	import { fade } from "svelte/transition";
	import type { Writable } from "svelte/store";

	export let editableSettings: Writable<any>;
</script>

<div in:fade={{ duration: 300 }}>
	<h2 class="text-xl font-semibold mb-4">Firemní údaje</h2>

	<div class="gap-8 grid">
		<div class="form-control w-3/4">
			<label class="label">
				<span class="label-text">Název firmy</span>
			</label>
			<input
				type="text"
				bind:value={$editableSettings.business.companyName}
				class="input input-bordered w-full"
			/>
		</div>
		<div class="grid grid-cols-4 gap-8">
			
			<div class="form-control">
				<label class="label">
					<span class="label-text">Ulice</span>
				</label>
				<input
					type="text"
					bind:value={$editableSettings.business.street}
					class="input input-bordered w-full"
				/>
			</div>
			<div class="form-control">
				<label class="label">
					<span class="label-text">Číslo</span>
				</label>
				<input
					type="text"
					bind:value={$editableSettings.business.streetNumber}
					class="input input-bordered w-full"
				/>
			</div>

			<div class="form-control">
				<label class="label">
					<span class="label-text">Město</span>
				</label>
				<input
					type="text"
					bind:value={$editableSettings.business.city}
					class="input input-bordered w-full"
				/>
			</div>

			<div class="form-control">
				<label class="label">
					<span class="label-text">PSČ</span>
				</label>
				<input
					type="text"
					bind:value={$editableSettings.business.zipCode}
					class="input input-bordered w-full"
				/>
			</div>							

			<div class="form-control">
				<label class="label">
					<span class="label-text">IČO</span>
				</label>
				<input
					type="text"
					bind:value={$editableSettings.business.ico}
					class="input input-bordered w-full"
				/>
			</div>

			<div class="form-control">
				<label class="label">
					<span class="label-text">DIČ</span>
				</label>
				<input
					type="text"
					bind:value={$editableSettings.business.dic}
					class="input input-bordered w-full"
				/>
			</div>
			
		</div>
		<div class="form-control w-1/3">
			<label class="label">
				<span class="label-text">Bankovní účet</span>
			</label>
			<input
				type="text"
				bind:value={$editableSettings.business.bankAccount}
				class="input input-bordered w-full"
			/>
		</div>
		
	</div>
</div> 