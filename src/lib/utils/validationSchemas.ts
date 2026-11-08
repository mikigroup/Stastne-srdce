/**
 * Sdílená Zod validační schémata pro celou aplikaci
 */
import { z } from "zod";

/**
 * Schéma pro validaci emailu
 */
export const emailSchema = z
	.string({ error: "Email je povinný" })
	.trim()
	.min(1, { error: "Email je povinný", abort: true })
	.max(254, { error: "Email je příliš dlouhý", abort: true })
	.email("Neplatný formát emailu");

/**
 * Schéma pro validaci českého telefonního čísla.
 * Mezery a pomlčky se zahodí, předvolba 00420 se sjednotí na +420.
 */
export const czechPhoneSchema = z
	.string({ error: "Telefon je povinný" })
	.trim()
	.min(1, { error: "Telefon je povinný", abort: true })
	.overwrite((value) => {
		const compact = value.replace(/[\s-]/g, "").replace(/^00420/, "+420");
		return /^[1-9]\d{8}$/.test(compact) ? `+420${compact}` : compact;
	})
	.regex(/^\+420[1-9]\d{8}$/, "Neplatný formát telefonu (např. +420777456789)");

/**
 * Schéma pro validaci jména
 */
export const nameSchema = z
	.string({ error: "Jméno je povinné" })
	.trim()
	.min(1, { error: "Jméno je povinné", abort: true })
	.min(2, "Jméno musí mít alespoň 2 znaky")
	.max(80, "Jméno je příliš dlouhé");

/**
 * Schéma pro validaci hesla
 */
export const passwordSchema = z
	.string({ error: "Heslo je povinné" })
	.trim()
	.min(8, "Heslo musí mít alespoň 8 znaků")
	.regex(/[A-Z]/, "Heslo musí obsahovat alespoň jedno velké písmeno")
	.regex(/[0-9]/, "Heslo musí obsahovat alespoň jedno číslo");

/**
 * Schéma pro kontaktní formulář
 */
export const contactFormSchema = z.object({
	email: emailSchema,
	tel: czechPhoneSchema,
	name: nameSchema,
	content: z
		.string({ error: "Zpráva je povinná" })
		.overwrite((value) =>
			value
				.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, "")
				.replace(/\s+/g, " ")
				.trim()
		)
		.min(1, { error: "Zpráva je povinná", abort: true })
		.min(10, { error: "Zpráva musí mít alespoň 10 znaků", abort: true })
		.max(2000, "Zpráva může mít nejvýše 2000 znaků"),
});

/**
 * Schéma pro registraci uživatele
 */
export const signUpSchema = z.object({
	email: emailSchema,
	password: passwordSchema,
	repassword: z
		.string({ error: "Potvrzení hesla je povinné" })
		.trim()
		.min(1, "Potvrzení hesla je povinné"),
}).refine((data) => data.password === data.repassword, {
	message: "Hesla se neshodují",
	path: ["repassword"],
});

/**
 * Schéma pro profil uživatele
 */
export const profileSchema = z.object({
	first_name: z
		.string({ error: "Jméno je povinné" })
		.trim()
		.min(2, "Jméno musí mít alespoň 2 znaky")
		.min(1, "Jméno je povinné"),
	last_name: z
		.string({ error: "Příjmení je povinné" })
		.trim()
		.min(2, "Příjmení musí mít alespoň 2 znaky")
		.min(1, "Příjmení je povinné"),
	username: z.string().trim().optional(),
	telephone: z.string().trim().optional(),
	company: z.string().trim().optional(),
	ico: z.string().trim().optional(),
	dic: z.string().trim().optional(),
	street: z.string().trim().optional(),
	street_number: z.string().trim().optional(),
	city: z.string().trim().optional(),
	zip_code: z.string().trim().optional(),
	avatar_url: z.string().nullable().optional(),
});

/**
 * Schéma pro Fakturoid účet
 */
export const fakturoidAccountSchema = z.object({
	name: z.string({ error: "Název účtu je povinný" }).min(1, "Název účtu je povinný"),
	email: emailSchema,
	subdomain: z.string({ error: "Subdoména je povinná" }).min(1, "Subdoména je povinná"),
	isActive: z.boolean(),
	connectedAt: z.string(),
});

/**
 * Schéma pro Fakturoid integraci
 */
export const fakturoidIntegrationSchema = z.object({
	enabled: z.boolean(),
	connected: z.boolean(),
	subdomain: z.string().optional(),
	accounts: z.array(fakturoidAccountSchema),
	defaultLanguage: z.string().optional().default('cz'),
	autoCreateInvoices: z.boolean().optional().default(false),
	invoiceDueDays: z.number().optional().default(14),
	defaultPaymentMethod: z.string().optional().default('bank'),
	sendInvoiceEmail: z.boolean().optional().default(false),
	invoiceNote: z.string().optional().default(''),
});

/**
 * Schéma pro celé integrations nastavení
 */
export const integrationsSettingsSchema = z.object({
	fakturoid: fakturoidIntegrationSchema,
});

/**
 * Type inference pro TypeScript
 */
export type ContactFormData = z.infer<typeof contactFormSchema>;
export type SignUpData = z.infer<typeof signUpSchema>;
export type ProfileData = z.infer<typeof profileSchema>;
export type FakturoidAccount = z.infer<typeof fakturoidAccountSchema>;
export type FakturoidIntegration = z.infer<typeof fakturoidIntegrationSchema>;
export type IntegrationsSettings = z.infer<typeof integrationsSettingsSchema>;
