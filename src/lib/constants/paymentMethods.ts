/**
 * Způsoby platby – načítání z site_settings.payment.paymentMethods.
 * Každá metoda má stabilní `code` uložený v DB (žádné hardcoded mapování).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "$lib/types/database.types";
import { PUBLIC_TENANT } from "$env/static/public";

type PaymentOption = { value: string; label: string };

function slugifyCode(name: string): string {
	return name
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

async function loadPaymentSettingsFromDB(supabase: SupabaseClient<Database>) {
	try {
		const { data: paymentData, error } = await supabase
			.from("site_settings")
			.select("value")
			.eq("key", "payment")
			.eq("tenant_id", PUBLIC_TENANT)
			.single();

		if (error || !paymentData?.value) {
			return null;
		}

		return typeof paymentData.value === "string"
			? JSON.parse(paymentData.value)
			: paymentData.value;
	} catch (error) {
		console.error("Error loading payment settings from DB:", error);
		return null;
	}
}

function convertPaymentMethodsToOptions(
	paymentMethods: Array<{
		name?: string;
		code?: string;
		enabled?: boolean;
	}> | undefined
): PaymentOption[] {
	if (!paymentMethods || !Array.isArray(paymentMethods)) {
		return [];
	}

	return paymentMethods
		.filter((method) => method.enabled !== false)
		.map((method) => {
			const name = (method.name || "").trim();
			const code = (method.code || "").trim() || slugifyCode(name) || name;
			return { value: code, label: name || code };
		})
		.filter((option) => option.value);
}

/** Aktivní způsoby platby ze settings. */
export async function getPaymentMethods(
	supabase: SupabaseClient<Database> | null
): Promise<PaymentOption[]> {
	if (!supabase) {
		return [];
	}

	const settings = await loadPaymentSettingsFromDB(supabase);
	return convertPaymentMethodsToOptions(settings?.paymentMethods);
}

export function getPaymentMethodLabel(value: string): string {
	return value;
}

export type PaymentMethodValue = string;
