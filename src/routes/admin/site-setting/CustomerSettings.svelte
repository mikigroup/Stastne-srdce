<script lang="ts">
	import { fade } from "svelte/transition";
	import type { Writable } from "svelte/store";

	export let editableSettings: Writable<any>;
</script>

<div in:fade={{ duration: 300 }}>
	<h2 class="text-xl font-semibold mb-4">Nastavení zákazníků</h2>

	<!-- Privacy Settings -->
	<div class="mb-6 border-b pb-4">
		<div class="flex items-center gap-2 mb-3">
			<h3 class="text-lg font-medium">Nastavení soukromí a GDPR</h3>
			<div class="tooltip" data-tip="Nastavení v souladu s českým zákonem č. 110/2019 Sb. o zpracování osobních údajů a nařízením GDPR (EU) 2016/679">
				<svg class="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path>
				</svg>
			</div>
		</div>
		
		<div class="form-control mb-3">
			<div class="flex items-start gap-2">
				<div class="flex-1">
					<label class="label">
						<span class="label-text">Doba uchovávání dat</span>
					</label>
					<div class="flex flex-col gap-3">
						<!-- Přednastavené zákonné termíny -->
						<select 
							bind:value={$editableSettings.customer.privacy.dataRetentionMonths}
							class="select select-bordered w-full max-w-md"
						>
							<option value={12}>12 měsíců - Minimální zákonná lhůta</option>
							<option value={24}>24 měsíců - Záruční reklamace</option>
							<option value={36}>36 měsíců - Doporučeno pro e-shop (default)</option>
							<option value={60}>60 měsíců - Archivace dle zákona č. 563/1991 Sb.</option>
							<option value={72}>72 měsíců - Rozšířená archivace</option>
							<option value={120}>120 měsíců - Maximální doba</option>
						</select>
						
						<p class="text-sm text-gray-500">
							Jak dlouho uchovávat zákaznická data po posledním nákupu
						</p>
					</div>
				</div>
				<div class="tooltip" data-tip="Čl. 5 odst. 1 písm. e) GDPR - zásada omezení uložení. Doporučujeme 36 měsíců pro zachování obchodních záznamů dle zákona č. 563/1991 Sb. (§ 31)">
					<svg class="w-4 h-4 text-blue-500 mt-8" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path>
					</svg>
				</div>
			</div>								
		</div>
		
		<div class="form-control">
			<div class="flex items-start gap-2">
				<div class="flex-1">
					<label class="label cursor-pointer justify-start gap-2">
						<input 
							type="checkbox" 
							class="checkbox checkbox-primary" 
							bind:checked={$editableSettings.customer.privacy.enableAccountDeletion} 
						/>
						<span class="label-text">Povolit smazání účtu</span>
					</label>
					<span class="text-xs text-gray-500 mt-1">
						Zákazníci si mohou smazat svůj účet a data
					</span>
				</div>
				<div class="tooltip" data-tip="Čl. 17 GDPR - právo na výmaz ('právo být zapomenut'). Povinné pro e-shopy v EU">
					<svg class="w-4 h-4 text-blue-500 mt-2" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path>
					</svg>
				</div>
			</div>								
		</div>
	</div>

	<!-- Communication Settings -->
	<div class="mb-6">
		<div class="flex items-center gap-2 mb-3">
			<h3 class="text-lg font-medium">Nastavení komunikace</h3>
			<div class="tooltip" data-tip="Marketing v souladu se zákonem č. 480/2004 Sb. o některých službách informační společnosti">
				<svg class="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path>
				</svg>
			</div>
		</div>
		
		<div class="form-control">
			<div class="flex items-start gap-2">
				<div class="flex-1">
					<label class="label cursor-pointer justify-start gap-2">
						<input 
							type="checkbox" 
							class="checkbox checkbox-primary" 
							bind:checked={$editableSettings.customer.communication.enableNewsletters} 
						/>
						<span class="label-text">Povolit newslettery</span>
					</label>
					<span class="text-xs text-gray-500 mt-1">
						Možnost posílání marketingových emailů
					</span>
				</div>
				<div class="tooltip" data-tip="Zákon č. 480/2004 Sb. § 7 - nevyžádaná obchodní sdělení. Nutný opt-in souhlas">
					<svg class="w-4 h-4 text-blue-500 mt-2" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path>
					</svg>
				</div>
			</div>
		</div>
	</div>
</div> 