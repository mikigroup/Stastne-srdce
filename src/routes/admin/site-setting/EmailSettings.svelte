<script lang="ts">
	import { fade } from "svelte/transition";
	import type { Writable } from "svelte/store";

	export let editableSettings: Writable<any>;
</script>

<div in:fade={{ duration: 300 }}>
	<h2 class="text-xl font-semibold mb-4">Šablony e-mailů</h2>

	<div class="space-y-6">
		<!-- Základní šablony -->
		<div class="border-b pb-4">
			<h3 class="text-lg font-medium mb-3">Základní notifikace</h3>
			
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

		<!-- Marketingové šablony -->
		<div class="border-b pb-4">
			<h3 class="text-lg font-medium mb-3">Marketingové notifikace</h3>
			
			<div class="space-y-4">
				<div class="form-control">
					<label class="label">
						<span class="label-text">Uvítací email</span>
					</label>
					<textarea
						bind:value={$editableSettings.email.welcomeEmailTemplate}
						class="textarea textarea-bordered w-full h-32"
						placeholder="Vítejte v Šťastném srdci! Děkujeme za registraci."
					></textarea>
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text">Narozeninový email</span>
					</label>
					<textarea
						bind:value={$editableSettings.email.birthdayEmailTemplate}
						class="textarea textarea-bordered w-full h-32"
						placeholder="Všechno nejlepší k narozeninám! Máte slevu {'{{discount}}'}%."
					></textarea>
					<span class="text-xs text-gray-500 mt-1">
						Použijte {'{{discount}}'} pro vložení slevy.
					</span>
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text">Povýšení ve věrnostním systému</span>
					</label>
					<textarea
						bind:value={$editableSettings.email.loyaltyUpgradeTemplate}
						class="textarea textarea-bordered w-full h-32"
						placeholder="Gratulujeme! Byli jste povýšeni na {'{{tierName}}'}."
					></textarea>
					<span class="text-xs text-gray-500 mt-1">
						Použijte {'{{tierName}}'} pro vložení názvu úrovně.
					</span>
				</div>
			</div>
		</div>

		<!-- Připomínky -->
		<div class="border-b pb-4">
			<h3 class="text-lg font-medium mb-3">Připomínky</h3>
			
			<div class="space-y-4">
				<div class="form-control">
					<label class="label">
						<span class="label-text">Připomínka objednávky</span>
					</label>
					<textarea
						bind:value={$editableSettings.email.orderReminderTemplate}
						class="textarea textarea-bordered w-full h-32"
						placeholder="Nezapomeňte si objednat oběd na zítra!"
					></textarea>
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text">Připomínka platby</span>
					</label>
					<textarea
						bind:value={$editableSettings.email.paymentReminderTemplate}
						class="textarea textarea-bordered w-full h-32"
						placeholder="Připomínáme platbu za objednávku č. {'{{orderNumber}}'}."
					></textarea>
					<span class="text-xs text-gray-500 mt-1">
						Použijte {'{{orderNumber}}'} pro vložení čísla objednávky.
					</span>
				</div>
			</div>
		</div>

		<!-- Speciální nabídky -->
		<div>
			<h3 class="text-lg font-medium mb-3">Speciální nabídky</h3>
			
			<div class="space-y-4">
				<div class="form-control">
					<label class="label">
						<span class="label-text">Aktualizace menu</span>
					</label>
					<textarea
						bind:value={$editableSettings.email.menuUpdateTemplate}
						class="textarea textarea-bordered w-full h-32"
						placeholder="Nové menu je k dispozici! Podívejte se na naše nabídky."
					></textarea>
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text">Speciální nabídka</span>
					</label>
					<textarea
						bind:value={$editableSettings.email.specialOfferTemplate}
						class="textarea textarea-bordered w-full h-32"
						placeholder="Speciální nabídka jen pro vás: {'{{offer}}'}"
					></textarea>
					<span class="text-xs text-gray-500 mt-1">
						Použijte {'{{offer}}'} pro vložení nabídky.
					</span>
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text">Požadavek na zpětnou vazbu</span>
					</label>
					<textarea
						bind:value={$editableSettings.email.feedbackRequestTemplate}
						class="textarea textarea-bordered w-full h-32"
						placeholder="Jak se vám líbilo vaše jídlo? Dejte nám vědět!"
					></textarea>
				</div>
			</div>
		</div>
	</div>
</div> 