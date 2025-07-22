<script lang="ts">
	import { fade } from "svelte/transition";
	import type { Writable } from "svelte/store";

	export let editableSettings: Writable<any>;

	// Inicializace showOpeningHours pokud neexistuje
	$: if ($editableSettings.contact && $editableSettings.contact.showOpeningHours === undefined) {
		$editableSettings.contact.showOpeningHours = true;
	}
</script>

<div in:fade={{ duration: 300 }}>
	<h2 class="text-xl font-semibold mb-4">Kontaktní údaje</h2>

	<div class="space-y-4">
		<div class="form-control">
			<label class="label" for="contactEmail">
				<span class="label-text">E-mail</span>
			</label>
			<input
				id="contactEmail"
				type="email"
				bind:value={$editableSettings.contact.email}
				class="input input-bordered w-full"
			/>
		</div>

		<div class="form-control">
			<label class="label" for="contactPhone">
				<span class="label-text">Hlavní telefon</span>
			</label>
			<input
				id="contactPhone"
				type="tel"
				bind:value={$editableSettings.contact.phone}
				class="input input-bordered w-full"
			/>
		</div>

		<div class="form-control">
			<label class="label" for="contactPhone1">
				<span class="label-text">Telefon 1</span>
			</label>
			<input
				id="contactPhone1"
				type="tel"
				bind:value={$editableSettings.contact.phone1}
				class="input input-bordered w-full"
			/>
		</div>

		<div class="form-control">
			<label class="label" for="contactPhone2">
				<span class="label-text">Telefon 2</span>
			</label>
			<input
				id="contactPhone2"
				type="tel"
				bind:value={$editableSettings.contact.phone2}
				class="input input-bordered w-full"
			/>
		</div>

		<div class="form-control">
			<label class="label" for="contactAddress">
				<span class="label-text">Adresa</span>
			</label>
			<textarea
				id="contactAddress"
				bind:value={$editableSettings.contact.address}
				class="textarea textarea-bordered w-full"
			></textarea>
		</div>

		<div class="form-control">
			<label class="label">
				<span class="label-text">Souřadnice na mapě</span>
			</label>
			<div class="grid grid-cols-2 gap-4">
				<div>
					<label class="label" for="contactLat">
						<span class="label-text">Zeměpisná šířka (Lat)</span>
					</label>
					<input
						id="contactLat"
						type="number"
						step="0.000001"
						bind:value={$editableSettings.contact.mapCoordinates.lat}
						class="input input-bordered w-full"
					/>
				</div>
				<div>
					<label class="label" for="contactLng">
						<span class="label-text">Zeměpisná délka (Lng)</span>
					</label>
					<input
						id="contactLng"
						type="number"
						step="0.000001"
						bind:value={$editableSettings.contact.mapCoordinates.lng}
						class="input input-bordered w-full"
					/>
				</div>
			</div>
		</div>

		<div class="form-control">
			<div class="flex items-start gap-3 mb-4">
				<input 
					type="checkbox" 
					bind:checked={$editableSettings.contact.showOpeningHours} 
					class="checkbox checkbox-primary mt-1" 
				/>
				<div>
					<span class="label-text font-medium">Zobrazovat otevírací dobu na webu</span>
					<p class="text-xs text-gray-500 mt-1">
						Pokud je zaškrtnuto, otevírací doba se zobrazí na stránce kontaktů.
					</p>
				</div>
			</div>

			{#if $editableSettings.contact.showOpeningHours}
				<div class="space-y-2">
					{#each ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as day}
						<div class="flex gap-2 items-center">
							<label class="w-32 text-sm font-medium">
								{#if day === "monday"}Pondělí
								{:else if day === "tuesday"}Úterý
								{:else if day === "wednesday"}Středa
								{:else if day === "thursday"}Čtvrtek
								{:else if day === "friday"}Pátek
								{:else if day === "saturday"}Sobota
								{:else if day === "sunday"}Neděle{/if}
							</label>
							<input
								type="text"
								bind:value={$editableSettings.contact.openingHours[day]}
								class="input input-bordered flex-grow"
								placeholder="např. 8:00-16:00 nebo Zavřeno"
							/>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div> 