import { createClient } from "@supabase/supabase-js";
import type { TypedSupabaseClient } from "$lib/supabase";
import type { Database } from "$lib/types/database.types";
import { validateIntegrationsSettings } from "$lib/types/siteSettings";
import { getDefaultSettings } from '$lib/constants/defaultSettings';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL, PUBLIC_TENANT } from "$env/static/public";

/** Klíče, které anon politika nečte (SMTP a integrace). Ostatní jsou veřejná. */
const RESTRICTED_SETTING_KEYS = new Set(["email", "integrations"]);

let publicSettingsClient: TypedSupabaseClient | null = null;

const PUBLIC_SETTINGS_TTL_MS = 60_000;

type PublicSettingsCacheEntry = {
	expires: number;
	values: Record<string, any>;
};

const publicSettingsCache = new Map<string, PublicSettingsCacheEntry>();

/**
 * Čtení veřejných site_settings bez uživatelské session.
 * Politika site_settings_anon_public_read platí jen pro roli anon.
 * Přihlášený zákazník by jinak dostal 0 řádků a PostgREST 406.
 */
function getPublicSettingsClient(): TypedSupabaseClient {
    if (!publicSettingsClient) {
        publicSettingsClient = createClient<Database>(
            PUBLIC_SUPABASE_URL,
            PUBLIC_SUPABASE_ANON_KEY,
            {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                    detectSessionInUrl: false,
                    storageKey: "sb-public-settings"
                }
            }
        );
    }
    return publicSettingsClient;
}

export function deserializeSettingValue(value: any): any {
    if (value === null || value === undefined) {
        return null;
    }
    
    try {
        if (typeof value === 'string') {
            return JSON.parse(value);
        } else if (typeof value === 'object') {
            return value;
        } else {
            return String(value);
        }
    } catch (e) {
        console.error('Error deserializing setting value:', e);
        return null;
    }
}

async function getDefaultTenantId(): Promise<string | null> {
    try {
        if (PUBLIC_TENANT) {
            return PUBLIC_TENANT;
        }
        
        return null;
    } catch (e) {
        console.error('Error getting default tenant ID:', e);
        return null;
    }
}

function publicSettingsCacheKey(tenantId: string, keys: string[]): string {
	return `${tenantId}:${[...keys].sort().join(",")}`;
}

function readPublicValue(key: string, value: unknown) {
	const parsed = deserializeSettingValue(value);
	if (key === "integrations") {
		const validation = validateIntegrationsSettings(parsed);
		if (!validation.success) {
			console.error("Invalid integrations settings:", validation.error);
			return getDefaultSettings("integrations");
		}
		return validation.data;
	}
	return parsed;
}

/**
 * Veřejné klíče jedním dotazem. Výsledek platí 60 s v paměti instance.
 * Klíč cache je tenant a seznam klíčů. Omezené klíče (e-mail, integrace) sem nepatří.
 */
export async function getPublicSettings(
	keys: string[],
	tenantId: string = PUBLIC_TENANT
): Promise<Record<string, any>> {
	const uniqueKeys = [...new Set(keys)].filter((key) => !RESTRICTED_SETTING_KEYS.has(key));
	if (!tenantId || uniqueKeys.length === 0) return {};

	const cacheKey = publicSettingsCacheKey(tenantId, uniqueKeys);
	const now = Date.now();
	const hit = publicSettingsCache.get(cacheKey);
	if (hit && hit.expires > now) return hit.values;

	try {
		const { data, error } = await getPublicSettingsClient()
			.from("site_settings")
			.select("key, value")
			.eq("tenant_id", tenantId)
			.in("key", uniqueKeys);

		if (error) {
			console.error("Error loading public settings:", error);
			return {};
		}

		const values: Record<string, any> = {};
		for (const row of data ?? []) {
			if (!row.key) continue;
			values[row.key] = readPublicValue(row.key, row.value);
		}

		publicSettingsCache.set(cacheKey, {
			expires: now + PUBLIC_SETTINGS_TTL_MS,
			values
		});
		return values;
	} catch (e) {
		console.error("Error loading public settings:", e);
		return {};
	}
}

export async function getSetting(supabase: TypedSupabaseClient, key: string, tenantId?: string) {
    try {
        const client = RESTRICTED_SETTING_KEYS.has(key) ? supabase : getPublicSettingsClient();
        let query = client
            .from('site_settings')
            .select('value')
            .eq('key', key);
                
        if (tenantId) {
            query = query.eq('tenant_id', tenantId);
        } else {
            const defaultTenantId = await getDefaultTenantId();
            if (defaultTenantId) {
                query = query.eq('tenant_id', defaultTenantId);
            }
        }
        
        const { data, error } = await query.maybeSingle();
        
        if (error) {
            if (error.code !== "PGRST116") {
                console.error(`Error loading setting ${key}:`, error);
            }
            return null;
        }

        if (!data) {
            return null;
        }
        
        const value = deserializeSettingValue(data?.value);

        if (key === 'integrations') {
            const validation = validateIntegrationsSettings(value);
            if (!validation.success) {
                console.error('Invalid integrations settings:', validation.error);
                return getDefaultSettings('integrations');
            }
            return validation.data;
        }
        
        return value;
    } catch (e) {
        console.error(`Error getting setting ${key}:`, e);
        return null;
    }
}
