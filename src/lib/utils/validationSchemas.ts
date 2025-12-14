/**
 * Sdílená Zod validační schémata pro celou aplikaci
 */
import { z } from "zod";

/**
 * Schéma pro validaci emailu
 */
export const emailSchema = z
	.string({ required_error: "Email je povinný" })
	.trim()
	.email("Neplatný formát emailu")
	.min(1, "Email je povinný");

/**
 * Schéma pro validaci českého telefonního čísla
 */
export const czechPhoneSchema = z
	.string({ required_error: "Telefon je povinný" })
	.trim()
	.regex(
		/^(\+420)?\s*\d{3}\s*\d{3}\s*\d{3}$/,
		"Neplatný formát telefonu (např. +420123456789)"
	)
	.min(1, "Telefon je povinný");

/**
 * Schéma pro validaci jména
 */
export const nameSchema = z
	.string({ required_error: "Jméno je povinné" })
	.trim()
	.min(2, "Jméno musí mít alespoň 2 znaky")
	.min(1, "Jméno je povinné");

/**
 * Schéma pro validaci hesla
 */
export const passwordSchema = z
	.string({ required_error: "Heslo je povinné" })
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
		.string({ required_error: "Zpráva je povinná" })
		.trim()
		.min(10, "Zpráva musí mít alespoň 10 znaků")
		.min(1, "Zpráva je povinná"),
});

/**
 * Schéma pro registraci uživatele
 */
export const signUpSchema = z.object({
	email: emailSchema,
	password: passwordSchema,
	repassword: z
		.string({ required_error: "Potvrzení hesla je povinné" })
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
		.string({ required_error: "Jméno je povinné" })
		.trim()
		.min(2, "Jméno musí mít alespoň 2 znaky")
		.min(1, "Jméno je povinné"),
	last_name: z
		.string({ required_error: "Příjmení je povinné" })
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
	name: z.string({ required_error: "Název účtu je povinný" }).min(1, "Název účtu je povinný"),
	email: emailSchema,
	subdomain: z.string({ required_error: "Subdoména je povinná" }).min(1, "Subdoména je povinná"),
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
