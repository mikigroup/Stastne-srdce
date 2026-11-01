import type { SupabaseClient } from '@supabase/supabase-js';
import { getDefaultSettings } from '$lib/constants/defaultSettings';
import { getSetting } from '$lib/services/siteSettingsService';

/** Runtime tvar inventory settings (ne `as const` literály z defaultů). */
export type RuntimeInventorySettings = {
	enabled: boolean;
	excludedOrderStates: string[];
	salesLimits: {
		sellWithoutStockLimit: boolean;
	};
	menuPlanning: {
		defaultDailyCapacity: number;
		[key: string]: unknown;
	};
	[key: string]: unknown;
};

function coalesceInventory(raw: unknown): RuntimeInventorySettings {
	const defaults = getDefaultSettings('inventory');
	const base: RuntimeInventorySettings = {
		enabled: Boolean(defaults.enabled),
		excludedOrderStates: [...defaults.excludedOrderStates],
		salesLimits: {
			// Default z UNIFIED_DEFAULT_SETTINGS je true (= bez limitu)
			sellWithoutStockLimit: Boolean(defaults.salesLimits.sellWithoutStockLimit)
		},
		menuPlanning: {
			...defaults.menuPlanning,
			defaultDailyCapacity: Number(defaults.menuPlanning.defaultDailyCapacity) || 100
		}
	};

	if (!raw || typeof raw !== 'object') return base;
	const value = raw as Record<string, unknown>;
	const salesLimitsRaw =
		typeof value.salesLimits === 'object' && value.salesLimits
			? (value.salesLimits as Record<string, unknown>)
			: {};
	const menuPlanningRaw =
		typeof value.menuPlanning === 'object' && value.menuPlanning
			? (value.menuPlanning as Record<string, unknown>)
			: {};

	return {
		...base,
		...value,
		enabled: value.enabled === true,
		salesLimits: {
			sellWithoutStockLimit: salesLimitsRaw.sellWithoutStockLimit !== false
		},
		menuPlanning: {
			...base.menuPlanning,
			...menuPlanningRaw,
			defaultDailyCapacity:
				Number(menuPlanningRaw.defaultDailyCapacity ?? base.menuPlanning.defaultDailyCapacity) ||
				100
		},
		excludedOrderStates: Array.isArray(value.excludedOrderStates)
			? (value.excludedOrderStates as string[])
			: base.excludedOrderStates
	};
}

/**
 * Limity se uplatní JEN když je sklad zapnutý a „prodávat bez limitu“ je výslovně vypnuté.
 * Ve všech ostatních případech (default) se chová e-shop jako dosud — bez kontroly kapacity.
 */
export function shouldEnforceSalesStockLimits(
	inventory: RuntimeInventorySettings | null | undefined
): boolean {
	if (!inventory) return false;
	if (inventory.enabled !== true) return false;
	if (inventory.salesLimits?.sellWithoutStockLimit !== false) return false;
	return true;
}

export async function loadInventorySettings(
	supabase: SupabaseClient,
	tenantId?: string | null
): Promise<RuntimeInventorySettings> {
	const raw = await getSetting(supabase, 'inventory', tenantId ?? undefined);
	return coalesceInventory(raw);
}

export type CapacityCheckItem = {
	variant_id: string;
	quantity: number;
};

export type CapacityCheckRow = {
	variant_id: string;
	requested_qty: number;
	capacity: number;
	ordered_qty: number;
	remaining_qty: number;
	ok: boolean;
};

/**
 * Serverová kontrola zbývající nabídnuté kapacity.
 * Volat výhradně když shouldEnforceSalesStockLimits(...) === true.
 */
export async function checkOrderVariantCapacity(
	supabase: SupabaseClient,
	tenantId: string,
	items: CapacityCheckItem[],
	inventory: RuntimeInventorySettings
): Promise<{ ok: boolean; violations: CapacityCheckRow[]; error: string | null }> {
	const compact = new Map<string, number>();
	for (const item of items) {
		if (!item.variant_id) continue;
		const qty = Number(item.quantity) || 0;
		if (qty <= 0) continue;
		compact.set(item.variant_id, (compact.get(item.variant_id) ?? 0) + qty);
	}
	const payload = [...compact.entries()].map(([variant_id, quantity]) => ({
		variant_id,
		quantity
	}));
	if (payload.length === 0) {
		return { ok: true, violations: [], error: null };
	}

	const defaultCapacity = Number(inventory.menuPlanning?.defaultDailyCapacity) || 100;
	const excludedStates = inventory.excludedOrderStates?.length
		? inventory.excludedOrderStates
		: ['Stornovaná'];

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { data, error } = await (supabase as any).rpc('check_order_variant_capacity', {
		p_tenant_id: tenantId,
		p_items: payload,
		p_default_capacity: defaultCapacity,
		p_excluded_states: excludedStates
	});

	if (error) {
		return { ok: false, violations: [], error: error.message };
	}

	const rows: CapacityCheckRow[] = (data ?? []).map(
		(row: {
			variant_id: string;
			requested_qty: number;
			capacity: number;
			ordered_qty: number;
			remaining_qty: number;
			ok: boolean;
		}) => ({
			variant_id: row.variant_id,
			requested_qty: Number(row.requested_qty) || 0,
			capacity: Number(row.capacity) || 0,
			ordered_qty: Number(row.ordered_qty) || 0,
			remaining_qty: Number(row.remaining_qty) || 0,
			ok: row.ok === true
		})
	);

	const violations = rows.filter((r) => !r.ok);
	return { ok: violations.length === 0, violations, error: null };
}
