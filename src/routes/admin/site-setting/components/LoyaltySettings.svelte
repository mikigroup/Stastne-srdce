<script lang="ts">
	import { fade } from "svelte/transition";
	import type { Writable } from 'svelte/store';

	export let editableSettings: Writable<any>;
</script>

<div in:fade={{ duration: 300 }}>
	<h2 class="text-xl font-semibold mb-4">Věrnostní systém</h2>

	<div class="space-y-4">
		<div class="form-control">
			<label class="label cursor-pointer justify-start gap-3">
				<input
					type="checkbox"
					bind:checked={$editableSettings.loyalty.enabled}
					class="checkbox checkbox-primary"
				/>
				<span class="label-text">Povolit věrnostní systém</span>
			</label>
		</div>

		{#if $editableSettings.loyalty.enabled}
			<div class="space-y-4 pl-4 border-l-4 border-blue-200">
				<div class="form-control">
					<label class="label">
						<span class="label-text">Body za 1 Kč</span>
					</label>
					<input
						type="number"
						bind:value={$editableSettings.loyalty.pointsPerCrown}
						class="input input-bordered w-full"
						min="0"
						step="0.01"
					/>
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text">Hodnota 1 bodu (Kč)</span>
					</label>
					<input
						type="number"
						bind:value={$editableSettings.loyalty.pointValue}
						class="input input-bordered w-full"
						min="0"
						step="0.01"
					/>
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text">Minimální počet bodů pro použití</span>
					</label>
					<input
						type="number"
						bind:value={$editableSettings.loyalty.minimumPointsToUse}
						class="input input-bordered w-full"
						min="0"
					/>
				</div>

				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-3">
						<input
							type="checkbox"
							bind:checked={$editableSettings.loyalty.allowPartialRedemption}
							class="checkbox checkbox-primary"
						/>
						<span class="label-text">Povolit částečné použití bodů</span>
					</label>
				</div>

				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-3">
						<input
							type="checkbox"
							bind:checked={$editableSettings.loyalty.expirePoints}
							class="checkbox checkbox-primary"
						/>
						<span class="label-text">Body vyprší po určité době</span>
					</label>
				</div>

				{#if $editableSettings.loyalty.expirePoints}
					<div class="form-control">
						<label class="label">
							<span class="label-text">Doba platnosti bodů (dny)</span>
						</label>
						<input
							type="number"
							bind:value={$editableSettings.loyalty.pointsExpiryDays}
							class="input input-bordered w-full"
							min="1"
						/>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div> 