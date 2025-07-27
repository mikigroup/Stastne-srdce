<script lang="ts">
	import { fade } from "svelte/transition";
	import type { Writable } from "svelte/store";

	export let editableSettings: Writable<any>;

	// Konstanta pro názvy dnů
	const dayLabels: Record<string, string> = {
		monday: 'Po',
		tuesday: 'Út', 
		wednesday: 'St',
		thursday: 'Čt',
		friday: 'Pá',
		saturday: 'So',
		sunday: 'Ne'
	};

	// Inicializace notifikačních nastavení pokud neexistují
	$: if ($editableSettings.notifications === undefined) {
		$editableSettings.notifications = {
			enabled: true,
			triggers: {
				welcomeEmail: { enabled: true, delay: 0 },
				birthdayEmail: { enabled: true, discount: 10 },
				loyaltyUpgrade: { enabled: true },
				orderReminder: { enabled: false, time: "17:00" },
				paymentReminder: { enabled: false, days: 7 },
				menuUpdate: { enabled: false },
				feedbackRequest: { enabled: false, daysAfterOrder: 1 }
			},
			scheduling: {
				reminderTime: "17:00",
				reminderDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
				birthdayCheck: "09:00"
			}
		};
	}
</script>

<div in:fade={{ duration: 300 }}>
	<h2 class="text-xl font-semibold mb-4">Automatické notifikace</h2>

	<div class="space-y-6">
		<!-- Hlavní nastavení -->
		<div class="form-control">
			<div class="flex items-start gap-3">
				<input 
					type="checkbox" 
					bind:checked={$editableSettings.notifications.enabled} 
					class="checkbox checkbox-primary mt-1" 
				/>
				<div>
					<span class="label-text font-medium">Povolit automatické notifikace</span>
					<p class="text-xs text-gray-500 mt-1">
						Systém bude automaticky odesílat emaily zákazníkům podle nastavených pravidel
					</p>
				</div>
			</div>
		</div>

		{#if $editableSettings.notifications.enabled}
			<!-- Marketingové notifikace -->
			<div class="border-b pb-4">
				<h3 class="text-lg font-medium mb-3">Marketingové notifikace</h3>
				
				<div class="space-y-4">
					<!-- Uvítací email -->
					<div class="form-control">
						<div class="flex items-start gap-3">
							<input 
								type="checkbox" 
								bind:checked={$editableSettings.notifications.triggers.welcomeEmail.enabled} 
								class="checkbox checkbox-primary mt-1" 
							/>
							<div class="flex-1">
								<span class="label-text font-medium">Uvítací email</span>
								<p class="text-xs text-gray-500 mt-1">
									Odešle se novým zákazníkům po registraci
								</p>
							</div>
						</div>
					</div>

					<!-- Narozeninový email -->
					<div class="form-control">
						<div class="flex items-start gap-3">
							<input 
								type="checkbox" 
								bind:checked={$editableSettings.notifications.triggers.birthdayEmail.enabled} 
								class="checkbox checkbox-primary mt-1" 
							/>
							<div class="flex-1">
								<span class="label-text font-medium">Narozeninový email</span>
								<p class="text-xs text-gray-500 mt-1">
									Odešle se zákazníkům v den jejich narozenin
								</p>
								<div class="mt-2">
									<label class="label">
										<span class="label-text text-sm">Sleva (%)</span>
									</label>
									<input 
										type="number" 
										bind:value={$editableSettings.notifications.triggers.birthdayEmail.discount}
										class="input input-bordered input-sm w-24" 
										min="0" 
										max="100" 
									/>
								</div>
							</div>
						</div>
					</div>

					<!-- Povýšení ve věrnostním systému -->
					<div class="form-control">
						<div class="flex items-start gap-3">
							<input 
								type="checkbox" 
								bind:checked={$editableSettings.notifications.triggers.loyaltyUpgrade.enabled} 
								class="checkbox checkbox-primary mt-1" 
							/>
							<div class="flex-1">
								<span class="label-text font-medium">Povýšení ve věrnostním systému</span>
								<p class="text-xs text-gray-500 mt-1">
									Odešle se při povýšení zákazníka na vyšší úroveň
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Připomínky -->
			<div class="border-b pb-4">
				<h3 class="text-lg font-medium mb-3">Připomínky</h3>
				
				<div class="space-y-4">
					<!-- Připomínka objednávky -->
					<div class="form-control">
						<div class="flex items-start gap-3">
							<input 
								type="checkbox" 
								bind:checked={$editableSettings.notifications.triggers.orderReminder.enabled} 
								class="checkbox checkbox-primary mt-1" 
							/>
							<div class="flex-1">
								<span class="label-text font-medium">Připomínka objednávky</span>
								<p class="text-xs text-gray-500 mt-1">
									Odešle se zákazníkům, kteří si dlouho neobjednali
								</p>
								<div class="mt-2">
									<label class="label">
										<span class="label-text text-sm">Čas odeslání</span>
									</label>
									<input 
										type="time" 
										bind:value={$editableSettings.notifications.triggers.orderReminder.time}
										class="input input-bordered input-sm w-32" 
									/>
								</div>
							</div>
						</div>
					</div>

					<!-- Připomínka platby -->
					<div class="form-control">
						<div class="flex items-start gap-3">
							<input 
								type="checkbox" 
								bind:checked={$editableSettings.notifications.triggers.paymentReminder.enabled} 
								class="checkbox checkbox-primary mt-1" 
							/>
							<div class="flex-1">
								<span class="label-text font-medium">Připomínka platby</span>
								<p class="text-xs text-gray-500 mt-1">
									Odešle se zákazníkům s nezaplacenými objednávkami
								</p>
								<div class="mt-2">
									<label class="label">
										<span class="label-text text-sm">Dny po objednávce</span>
									</label>
									<input 
										type="number" 
										bind:value={$editableSettings.notifications.triggers.paymentReminder.days}
										class="input input-bordered input-sm w-24" 
										min="1" 
										max="30" 
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Speciální notifikace -->
			<div class="border-b pb-4">
				<h3 class="text-lg font-medium mb-3">Speciální notifikace</h3>
				
				<div class="space-y-4">
					<!-- Aktualizace menu -->
					<div class="form-control">
						<div class="flex items-start gap-3">
							<input 
								type="checkbox" 
								bind:checked={$editableSettings.notifications.triggers.menuUpdate.enabled} 
								class="checkbox checkbox-primary mt-1" 
							/>
							<div class="flex-1">
								<span class="label-text font-medium">Aktualizace menu</span>
								<p class="text-xs text-gray-500 mt-1">
									Odešle se při přidání nového menu
								</p>
							</div>
						</div>
					</div>

					<!-- Požadavek na zpětnou vazbu -->
					<div class="form-control">
						<div class="flex items-start gap-3">
							<input 
								type="checkbox" 
								bind:checked={$editableSettings.notifications.triggers.feedbackRequest.enabled} 
								class="checkbox checkbox-primary mt-1" 
							/>
							<div class="flex-1">
								<span class="label-text font-medium">Požadavek na zpětnou vazbu</span>
								<p class="text-xs text-gray-500 mt-1">
									Odešle se zákazníkům po doručení objednávky
								</p>
								<div class="mt-2">
									<label class="label">
										<span class="label-text text-sm">Dny po objednávce</span>
									</label>
									<input 
										type="number" 
										bind:value={$editableSettings.notifications.triggers.feedbackRequest.daysAfterOrder}
										class="input input-bordered input-sm w-24" 
										min="1" 
										max="7" 
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Plánování -->
			<div>
				<h3 class="text-lg font-medium mb-3">Plánování</h3>
				
				<div class="space-y-4">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div class="form-control">
							<label class="label">
								<span class="label-text">Čas připomínek</span>
							</label>
							<input 
								type="time" 
								bind:value={$editableSettings.notifications.scheduling.reminderTime}
								class="input input-bordered w-full" 
							/>
							<span class="text-xs text-gray-500 mt-1">
								V kolik hodin se mají odesílat denní připomínky
							</span>
						</div>

						<div class="form-control">
							<label class="label">
								<span class="label-text">Kontrola narozenin</span>
							</label>
							<input 
								type="time" 
								bind:value={$editableSettings.notifications.scheduling.birthdayCheck}
								class="input input-bordered w-full" 
							/>
							<span class="text-xs text-gray-500 mt-1">
								V kolik hodin se má kontrolovat narozeniny
							</span>
						</div>
					</div>

					<div class="form-control">
						<label class="label">
							<span class="label-text">Dny pro připomínky</span>
						</label>
						<div class="flex flex-wrap gap-2">
							{#each ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as day}
								<label class="flex items-center gap-2">
									<input 
										type="checkbox" 
										bind:group={$editableSettings.notifications.scheduling.reminderDays}
										value={day}
										class="checkbox checkbox-sm" 
									/>
									<span class="text-sm">{dayLabels[day]}</span>
								</label>
							{/each}
						</div>
						<span class="text-xs text-gray-500 mt-1">
							Ve které dny se mají odesílat připomínky
						</span>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div> 