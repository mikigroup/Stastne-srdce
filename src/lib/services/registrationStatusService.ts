import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import { validateProfileForInvoicing, type ProfileValidationResult } from '$lib/utils/profileValidation';

export interface RegistrationStatusResult {
	isComplete: boolean;
	actualStatus: 'completed' | 'incomplete_data' | 'pending';
	dbStatus: string | null;
	validationResult: ProfileValidationResult;
	wasUpdated: boolean;
}

/**
 * Globální funkce pro kontrolu a automatickou aktualizaci statusu registrace
 * Kontroluje skutečný stav dat vs. status v databázi a automaticky opravuje nesoulad
 */
export async function checkAndUpdateRegistrationStatus(
	supabase: SupabaseClient<Database>,
	userId: string,
	email?: string
): Promise<RegistrationStatusResult> {
	try {
		// Načtení kompletního profilu včetně statusu
		const { data: profile, error } = await supabase
			.from("profiles")
			.select(`
				first_name, last_name, street, street_number, city, zip_code, 
				telephone, delivery_method, payment_method, company, ico, dic, 
				allergies, allergies_description, registration_status
			`)
			.eq("id", userId)
			.single();

		if (error || !profile) {
			console.error("Error fetching profile for registration check:", error);
			return {
				isComplete: false,
				actualStatus: 'pending',
				dbStatus: null,
				validationResult: { isComplete: false, missingFields: ['Profil nenalezen'] },
				wasUpdated: false
			};
		}

		// Validace kompletnosti dat
		const validationResult = validateProfileForInvoicing({
			...profile,
			email: email
		});

		const dbStatus = profile.registration_status;
		const isDataComplete = validationResult.isComplete;
		
		// Určení skutečného statusu
		let actualStatus: 'completed' | 'incomplete_data' | 'pending';
		if (isDataComplete) {
			actualStatus = 'completed';
		} else if (dbStatus === 'completed') {
			actualStatus = 'incomplete_data';
		} else {
			actualStatus = 'pending';
		}

		let wasUpdated = false;

		// Automatická oprava statusu v databázi pokud je nesoulad
		if (isDataComplete && dbStatus !== 'completed') {
			const { error: updateError } = await supabase
				.from("profiles")
				.update({ 
					registration_status: "completed",
					updated_at: new Date().toISOString()
				})
				.eq("id", userId);

			if (!updateError) {
				wasUpdated = true;
				console.log(`Auto-updated registration_status to completed for user ${userId}`);
			} else {
				console.error("Error auto-updating registration status:", updateError);
			}
		}

		return {
			isComplete: isDataComplete,
			actualStatus,
			dbStatus,
			validationResult,
			wasUpdated
		};

	} catch (error) {
		console.error("Unexpected error in checkAndUpdateRegistrationStatus:", error);
		return {
			isComplete: false,
			actualStatus: 'pending',
			dbStatus: null,
			validationResult: { isComplete: false, missingFields: ['Neočekávaná chyba'] },
			wasUpdated: false
		};
	}
}

/**
 * Zjednodušená verze pro rychlou kontrolu bez automatické aktualizace
 */
export async function getRegistrationStatus(
	supabase: SupabaseClient<Database>,
	userId: string,
	email?: string
): Promise<Pick<RegistrationStatusResult, 'isComplete' | 'actualStatus' | 'validationResult'>> {
	const result = await checkAndUpdateRegistrationStatus(supabase, userId, email);
	return {
		isComplete: result.isComplete,
		actualStatus: result.actualStatus,
		validationResult: result.validationResult
	};
}

/**
 * Utility funkce pro získání zprávy o statusu registrace
 */
export function getRegistrationStatusMessage(actualStatus: 'completed' | 'incomplete_data' | 'pending'): string {
	const messages = {
		'completed': 'Dokončeno',
		'incomplete_data': 'Neúplné údaje',
		'pending': 'Čeká na dokončení'
	};
	return messages[actualStatus] || actualStatus;
}

/**
 * Utility funkce pro získání CSS tříd pro zobrazení statusu
 */
export function getRegistrationStatusStyles(actualStatus: 'completed' | 'incomplete_data' | 'pending') {
	const styles = {
		'completed': {
			container: 'bg-green-100 border-green-200 text-green-800',
			badge: 'bg-green-200 text-green-900'
		},
		'incomplete_data': {
			container: 'bg-yellow-100 border-yellow-200 text-yellow-800',
			badge: 'bg-yellow-200 text-yellow-900'
		},
		'pending': {
			container: 'bg-red-100 border-red-200 text-red-800',
			badge: 'bg-red-200 text-red-900'
		}
	};
	return styles[actualStatus] || styles.pending;
} 