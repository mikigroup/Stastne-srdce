/**
 * Způsoby dopravy – načítání z site_settings.delivery.shippingMethods.
 * Každá metoda má stabilní `code` uložený v DB (žádné hardcoded mapování).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "$lib/types/database.types";
import { PUBLIC_TENANT } from "$env/static/public";

type DeliveryOption = { value: string; label: string; price?: number };

function slugifyCode(name: string): string {
	return name
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

async function loadDeliverySettingsFromDB(supabase: SupabaseClient<Database>) {
	try {
		const { data: deliveryData, error } = await supabase
			.from("site_settings")
			.select("value")
			.eq("key", "delivery")
			.eq("tenant_id", PUBLIC_TENANT)
			.single();

		if (error || !deliveryData?.value) {
			return null;
		}

		return typeof deliveryData.value === "string"
			? JSON.parse(deliveryData.value)
			: deliveryData.value;
	} catch (error) {
		console.error("Error loading delivery settings from DB:", error);
		return null;
	}
}

function convertShippingMethodsToOptions(
	shippingMethods: Array<{
		name?: string;
		code?: string;
		description?: string;
		price?: number;
		enabled?: boolean;
	}> | undefined,
	withDescriptions = false
): DeliveryOption[] {
	if (!shippingMethods || !Array.isArray(shippingMethods)) {
		return [];
	}

	return shippingMethods
		.filter((method) => method.enabled !== false)
		.map((method) => {
			const name = (method.name || "").trim();
			const code = (method.code || "").trim() || slugifyCode(name) || name;
			let label = withDescriptions && method.description ? method.description : name;
			const price = method.price ?? 0;

			if (price > 0) {
				label = `${label} (${price} Kč)`;
			}

			return { value: code, label, price };
		})
		.filter((option) => option.value);
}

/** Možnosti dopravy pro registraci – všechny aktivní metody ze settings. */
export async function getRegistrationDeliveryMethods(
	supabase: SupabaseClient<Database> | null,
	withDescriptions = false
): Promise<DeliveryOption[]> {
	if (!supabase) {
		return [];
	}

	const settings = await loadDeliverySettingsFromDB(supabase);
	return convertShippingMethodsToOptions(settings?.shippingMethods, withDescriptions);
}

/** Všechny aktivní způsoby dopravy ze settings. */
export async function getAllDeliveryMethods(
	supabase: SupabaseClient<Database> | null,
	withDescriptions = false,
	includeEmpty = false
): Promise<DeliveryOption[]> {
	let options: DeliveryOption[] = [];

	if (supabase) {
		const settings = await loadDeliverySettingsFromDB(supabase);
		options = convertShippingMethodsToOptions(settings?.shippingMethods, withDescriptions);
	}

	if (includeEmpty) {
		return [{ value: "", label: "Vyberte způsob dodání" }, ...options];
	}

	return options;
}

export function getDeliveryMethodLabel(value: string): string {
	return value;
}

export function getDeliveryMethodDescription(value: string): string {
	return getDeliveryMethodLabel(value);
}

/** @deprecated Používejte getAllDeliveryMethods() s Supabase klientem. */
export function getDeliveryMethodOptions() {
	return [] as DeliveryOption[];
}

export type DeliveryMethodValue = string;
