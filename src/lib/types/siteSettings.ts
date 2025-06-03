import * as yup from 'yup';

// Základní schéma pro Fakturoid účet
const FakturoidAccountSchema = yup.object({
    name: yup.string().required("Název účtu je povinný"),
    email: yup.string().email("Neplatný email").required(),
    subdomain: yup.string().required("Subdoména je povinná"),
    isActive: yup.boolean().required(),
    connectedAt: yup.string().required()
});

// Schéma pro Fakturoid integraci
const FakturoidIntegrationSchema = yup.object({
    enabled: yup.boolean().required(),
    connected: yup.boolean().required(),
    accounts: yup.array().of(FakturoidAccountSchema).required(),
    defaultLanguage: yup.string().default('cz'),
    autoCreateInvoices: yup.boolean().default(false),
    invoiceDueDays: yup.number().default(14),
    defaultPaymentMethod: yup.string().default('bank'),
    sendInvoiceEmail: yup.boolean().default(false),
    invoiceNote: yup.string().default('')
});

// Schéma pro celé integrations nastavení
export const IntegrationsSettingsSchema = yup.object({
    fakturoid: FakturoidIntegrationSchema.required()
});

// Typy pro TypeScript
export type FakturoidAccount = yup.InferType<typeof FakturoidAccountSchema>;
export type FakturoidIntegration = yup.InferType<typeof FakturoidIntegrationSchema>;
export type IntegrationsSettings = yup.InferType<typeof IntegrationsSettingsSchema>;

/**
 * Validuje integrations nastavení
 */
export function validateIntegrationsSettings(data: unknown): { 
    success: boolean; 
    data?: IntegrationsSettings; 
    error?: string;
} {
    try {
        const result = IntegrationsSettingsSchema.validateSync(data, { abortEarly: false });
        return { success: true, data: result };
    } catch (e) {
        if (e instanceof yup.ValidationError) {
            return { 
                success: false, 
                error: e.errors.join(', ')
            };
        }
        return { 
            success: false, 
            error: e instanceof Error ? e.message : 'Neznámá chyba validace'
        };
    }
}

/**
 * Vytvoří výchozí integrations nastavení
 */
export function getDefaultIntegrationsSettings(): IntegrationsSettings {
    return {
        fakturoid: {
            enabled: false,
            connected: false,
            accounts: [],
            defaultLanguage: 'cz',
            autoCreateInvoices: false,
            invoiceDueDays: 14,
            defaultPaymentMethod: 'bank',
            sendInvoiceEmail: false,
            invoiceNote: ''
        }
    };
} 