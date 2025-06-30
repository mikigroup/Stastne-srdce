<script lang="ts">
	import { goto } from "$app/navigation";
	import { fly } from "svelte/transition";
	import { ROUTES } from "$lib/stores/store";
	import type { Database } from "$lib/types/database.types";
	import { validateProfileForInvoicing } from "$lib/utils/profileValidation.js";
	import { 
		getRegistrationStatus, 
		getRegistrationStatusMessage, 
		getRegistrationStatusStyles,
		checkAndUpdateRegistrationStatus 
	} from "$lib/services/registrationStatusService";
	import { getAllDeliveryMethods } from "$lib/constants/deliveryMethods";

	// Definice typů pro data zákazníka
	type Customer = Database["public"]["Tables"]["profiles"]["Row"];

	// Definice typů pro vlastnosti komponenty
	interface ComponentProps {
		data: {
			supabase: any; // Ideálně by zde mělo být SupabaseClient<Database>
			session: {
				user: {
					id: string;
					email: string;
				};
			} | null;
		};
		customer?: Customer | null;
	}

	// Definice typů pro chyby při ukládání
	interface ApiError {
		message: string;
		code?: string;
		details?: string;
	}

	// Props a explicitní typizace
	export let data: ComponentProps["data"];
	export let customer: ComponentProps["customer"] = null; // If null, we're creating a new customer

	let { supabase, session } = data;
	$: ({ supabase, session } = data);

	// State variables s typizací
	export let loading = false;
	let updateMessage = "";

	// Customer data fields - initialize with existing customer data or empty strings
	let first_name: string = customer?.first_name ?? "";
	let last_name: string = customer?.last_name ?? "";
	let telephone: string = customer?.telephone ?? "";
	let street: string = customer?.street ?? "";
	let city: string = customer?.city ?? "";
	let street_number: string = customer?.street_number ?? "";
	let zip_code: string = customer?.zip_code ?? "";
	let ico: string = customer?.ico ?? "";
	let dic: string = customer?.dic ?? "";
	let company: string = customer?.company ?? "";
	let website: string = customer?.website ?? "";
	let username: string = customer?.username ?? "";
	let email: string = customer?.email ?? "";
	let allergies: "yes" | "no" = customer?.allergies === true ? "yes" : "no";
	let allergies_description: string = customer?.allergies_description || "";
	let delivery_method: string = customer?.delivery_method || "";
	let payment_method: string = customer?.payment_method || "";

	// Get all delivery method options for admin (all 5 values)
	const deliveryMethodOptions = getAllDeliveryMethods();

	// Definice typu pro customerData
	type CustomerData = {
		first_name: string;
		last_name: string;
		telephone: string;
		street: string;
		city: string;
		street_number: string;
		zip_code: string;
		email: string;
		ico: string;
		dic: string;
		company: string;
		website: string;
		username: string;
		allergies: boolean;
		allergies_description: string | null;
		delivery_method: string;
		payment_method: string;
	};

	export async function saveCustomer(): Promise<void> {
		try {
			loading = true;
			const customerData: CustomerData = {
				first_name,
				last_name,
				telephone,
				street,
				city,
				street_number,
				zip_code,
				email,
				ico,
				dic,
				company,
				website,
				username,
				allergies: allergies === "yes",
				allergies_description: allergies === "yes" ? allergies_description : null,
				delivery_method,
				payment_method
			};

			if (customer) {
				// Update existing customer
				const { error } = await supabase
					.from("profiles")
					.update(customerData)
					.eq("id", customer.id)
					.select();

				if (error) throw error;

				// Po úspěšném uložení použít globální službu pro kontrolu a aktualizaci statusu registrace
				const registrationCheck = await checkAndUpdateRegistrationStatus(
					supabase, 
					customer.id, 
					email || undefined
				);

				// Vylepšené zprávy podle stavu registrace
				if (registrationCheck.actualStatus === 'completed') {
					updateMessage = registrationCheck.wasUpdated 
						? "✅ Zákazník úspěšně uložen a registrace dokončena!"
						: "✅ Zákazník úspěšně uložen (registrace dokončena)!";
				} else {
					const missingFields = registrationCheck.validationResult.missingFields;
					updateMessage = `⚠️ Zákazník uložen, ale chybí: ${missingFields.join(', ')}`;
				}

				// Aktualizovat lokální customer objekt s novými daty pro reactive update UI
				customer = { ...customer, ...customerData };
				
			} else {
				// Create new customer
				if (!session?.user?.id) {
					throw new Error("Uživatel není přihlášen");
				}

				const { error } = await supabase
					.from("profiles")
					.insert({
						...customerData,
						id: session.user.id
					});

				if (error) throw error;
				goto($ROUTES.ADMIN.CUSTOMER.LIST, { replaceState: true });
			}
		} catch (error) {
			const apiError = error as ApiError;
			console.error("Chyba při ukládání:", apiError);
			alert(apiError.message || "Došlo k chybě při ukládání zákazníka");
		} finally {
			loading = false;
		}
	}

	export async function deleteCustomer(): Promise<void> {
		if (!customer?.id) return;

		try {
			loading = true;
			const { error } = await supabase
				.from("customers")
				.delete()
				.eq("id", customer.id);

			if (error) throw error;
			await goto($ROUTES.ADMIN.CUSTOMER.LIST, { replaceState: true });
		} catch (error) {
			const apiError = error as ApiError;
			console.error("Error deleting customer:", apiError);
			alert(apiError.message || "Došlo k chybě při mazání zákazníka");
		} finally {
			loading = false;
		}
	}

	function back(): void {
		goto($ROUTES.ADMIN.CUSTOMER.LIST);
	}

	// Funkce pro ruční aktualizaci statusu registrace
	export async function updateRegistrationStatus(): Promise<void> {
		if (!customer?.id) return;
		
		try {
			loading = true;
			const registrationCheck = await checkAndUpdateRegistrationStatus(
				supabase, 
				customer.id, 
				email || customer.email || undefined
			);

			if (registrationCheck.actualStatus === 'completed') {
				if (registrationCheck.wasUpdated) {
					updateMessage = "✅ Status registrace byl aktualizován na dokončeno!";
					// Aktualizovat customer objekt s novým statusem
					customer = { ...customer, registration_status: "completed" };
				} else {
					updateMessage = "✅ Status registrace je již správně nastaven na dokončeno.";
				}
			} else {
				const missingFields = registrationCheck.validationResult.missingFields;
				updateMessage = `⚠️ Status zůstává pending - chybí: ${missingFields.join(', ')}`;
			}
		} catch (error) {
			console.error("Chyba při aktualizaci statusu:", error);
			alert("Došlo k chybě při aktualizaci statusu registrace");
		} finally {
			loading = false;
		}
	}

	// Používáme zjednodušenou validaci pro zobrazení v admin rozhraní (bez automatické aktualizace)
	$: validationResult = customer ? validateProfileForInvoicing(customer) : { isComplete: false, missingFields: [] };
	$: isRegistrationActuallyCompleted = validationResult.isComplete;

	// Určení skutečného statusu registrace pomocí globální služby
	$: actualRegistrationStatus = !customer ? null :
		(isRegistrationActuallyCompleted ? 'completed' :
		customer.registration_status === 'completed' ? 'incomplete_data' :
		'pending') as 'completed' | 'incomplete_data' | 'pending';

	// Použití globálních utility funkcí
	$: registrationStatusMessage = actualRegistrationStatus ? getRegistrationStatusMessage(actualRegistrationStatus) : '';
	$: statusStyles = actualRegistrationStatus ? getRegistrationStatusStyles(actualRegistrationStatus) : getRegistrationStatusStyles('pending');
	$: statusColor = statusStyles.container;
	$: statusBadgeColor = statusStyles.badge;
</script>

<!-- Tlačítka jsou nyní v AdminPageLayout headeru -->

{#if updateMessage}
	<div class="mb-4 p-3 bg-green-100 border border-green-200 text-green-800 rounded">
		{updateMessage}
	</div>
{/if}

<!-- Status registrace -->
{#if customer}
	<div class="mb-4 p-3 rounded-lg border {statusColor}">
		<div class="flex items-center gap-2">
			<span class="font-medium">Status registrace:</span>
			<span class="px-2 py-1 rounded text-sm font-semibold {statusBadgeColor}">
				{registrationStatusMessage}
			</span>
			{#if customer.registration_status !== actualRegistrationStatus}
				<span class="text-xs opacity-75">
					(DB: {customer.registration_status || 'null'})
				</span>
			{/if}
		</div>
		{#if actualRegistrationStatus === 'pending'}
			<p class="text-sm mt-1">Zákazník ještě nedokončil registraci. Může mít omezený přístup k některým funkcím.</p>
		{:else if actualRegistrationStatus === 'incomplete_data'}
			<p class="text-sm mt-1">Registrace je označena jako dokončená, ale chybí některé povinné údaje:</p>
			<ul class="text-sm mt-1 ml-4 list-disc">
				{#each validationResult.missingFields as field}
					<li>{field}</li>
				{/each}
			</ul>
		{:else if actualRegistrationStatus === 'completed'}
			<p class="text-sm mt-1">Všechny povinné údaje jsou vyplněny.</p>
		{/if}
		
		<!-- Tlačítko pro ruční aktualizaci statusu pouze pokud se skutečný status liší od DB statusu -->
		{#if customer && customer.registration_status !== actualRegistrationStatus && validationResult.isComplete}
			<div class="mt-3">
				<button
					on:click={updateRegistrationStatus}
					disabled={loading}
					class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if loading}
						<svg class="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Aktualizuje se...
					{:else}
						Opravit status registrace
					{/if}
				</button>
				<p class="text-xs text-gray-500 mt-1">
					Data jsou kompletní, ale status v databázi není aktuální.
				</p>
			</div>
		{/if}
	</div>
{/if}

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- Osobní údaje -->
		<div class="space-y-4">
			<h3 class="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Osobní údaje</h3>			

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Jméno</label>
					<input
						type="text"
						bind:value={first_name}
						placeholder="Zadejte jméno"
						class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" />
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Příjmení</label>
					<input
						type="text"
						bind:value={last_name}
						placeholder="Zadejte příjmení"
						class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" />
				</div>
			</div>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
					<input
						type="email"
						bind:value={email}
						readonly={!!customer}
						disabled={!!customer}
						placeholder="Zadejte email"
						class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed" />
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
					<input
						type="tel"
						bind:value={telephone}
						placeholder="Zadejte telefon"
						class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" />
				</div>
			</div>
		</div>


		
		<!-- Adresa -->
		<div class="space-y-4">
			<h3 class="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Adresa</h3>
			
			<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<div class="sm:col-span-2">
					<label class="block text-sm font-medium text-gray-700 mb-1">Ulice</label>
					<input
						type="text"
						bind:value={street}
						placeholder="Zadejte ulici"
						class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" />
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Číslo</label>
					<input
						type="text"
						bind:value={street_number}
						placeholder="Č.p."
						class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" />
				</div>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Město</label>
					<input
						type="text"
						bind:value={city}
						placeholder="Zadejte město"
						class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" />
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">PSČ</label>
					<input
						type="text"
						bind:value={zip_code}
						placeholder="12345"
						class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" />
				</div>
			</div>
		</div>
	</div>

	<!-- Doplňující informace v jednom řádku -->
	<div class="mt-6 pt-6 border-t border-gray-200">
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Firemní údaje -->
			<div class="space-y-4">
				<h4 class="font-medium text-gray-900">Firemní údaje</h4>
				<div class="space-y-3">
					<div>
						<label class="block text-sm text-gray-600 mb-1">Společnost</label>
						<input
							type="text"
							bind:value={company}
							placeholder="Název společnosti"
							class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" />
					</div>
					<div class="grid grid-cols-2 gap-2">
						<div>
							<label class="block text-sm text-gray-600 mb-1">IČO</label>
							<input
								type="text"
								bind:value={ico}
								placeholder="IČO"
								class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" />
						</div>
						<div>
							<label class="block text-sm text-gray-600 mb-1">DIČ</label>
							<input
								type="text"
								bind:value={dic}
								placeholder="DIČ"
								class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" />
						</div>
					</div>
				</div>
			</div>

			<!-- Preference dodání -->
			<div class="space-y-4">
				<h4 class="font-medium text-gray-900">Způsob dodání</h4>
				<div class="space-y-2">
					{#each deliveryMethodOptions as option}
						<label class="flex items-center">
							<input
								type="radio"
								name="deliveryMethod"
								value={option.value}
								bind:group={delivery_method}
								class="mr-2" />
							<span class="text-sm">{option.label}</span>
						</label>
					{/each}
				</div>
			</div>

			<!-- Způsob platby + Alergie -->
			<div class="space-y-4">
				<div>
					<h4 class="font-medium text-gray-900 mb-3">Způsob platby</h4>
					<div class="space-y-2">
						<label class="flex items-center">
							<input
								type="radio"
								name="paymentMethod"
								value="cash"
								bind:group={payment_method}
								class="mr-2" />
							<span class="text-sm">Hotově</span>
						</label>
						<label class="flex items-center">
							<input
								type="radio"
								name="paymentMethod"
								value="bankNoInvoice"
								bind:group={payment_method}
								class="mr-2" />
							<span class="text-sm">Na účet bez faktury</span>
						</label>
						<label class="flex items-center">
							<input
								type="radio"
								name="paymentMethod"
								value="bankWithInvoice"
								bind:group={payment_method}
								class="mr-2" />
							<span class="text-sm">Na účet s fakturou</span>
						</label>
					</div>
				</div>

				<div>
					<h4 class="font-medium text-gray-900 mb-3">Alergie</h4>
					<div class="flex gap-4 mb-2">
						<label class="flex items-center">
							<input
								type="radio"
								name="allergies"
								value="no"
								bind:group={allergies}
								class="mr-2" />
							<span class="text-sm">Ne</span>
						</label>
						<label class="flex items-center">
							<input
								type="radio"
								name="allergies"
								value="yes"
								bind:group={allergies}
								class="mr-2" />
							<span class="text-sm">Ano</span>
						</label>
					</div>
					{#if allergies === "yes"}
						<textarea
							bind:value={allergies_description}
							maxlength="300"
							placeholder="Popište alergie..."
							class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 h-20 resize-none"
						></textarea>
						<span class="text-xs text-gray-500">
							Zbývá {300 - (allergies_description?.length || 0)} znaků
						</span>
					{/if}
				</div>
			</div>
		</div>
	</div>