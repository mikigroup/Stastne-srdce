import { 
    fakturoidAccountSchema,
    fakturoidIntegrationSchema,
    integrationsSettingsSchema,
    type FakturoidAccount,
    type FakturoidIntegration,
    type IntegrationsSettings
} from '$lib/utils/validationSchemas';

// Re-export schémat a typů pro zpětnou kompatibilitu
export { 
    fakturoidAccountSchema as FakturoidAccountSchema,
    fakturoidIntegrationSchema as FakturoidIntegrationSchema,
    integrationsSettingsSchema as IntegrationsSettingsSchema
};

/**
 * Validuje integrations nastavení
 */
export function validateIntegrationsSettings(data: unknown): { 
    success: boolean; 
    data?: IntegrationsSettings; 
    error?: string;
} {
    const result = integrationsSettingsSchema.safeParse(data);
    
    if (result.success) {
        return { success: true, data: result.data };
    }
    
    return { 
        success: false, 
        error: result.error.errors.map(e => e.message).join(', ')
    };
}

import { getDefaultSettings } from '$lib/constants/defaultSettings';

/**
 * Vytvoří výchozí integrations nastavení
 */
export function getDefaultIntegrationsSettings(): IntegrationsSettings {
    return JSON.parse(JSON.stringify(getDefaultSettings('integrations')));
} 