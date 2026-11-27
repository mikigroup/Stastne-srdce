import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { PRIVATE_SBUrl, PRIVATE_ServiceKey, PRIVATE_seznam_key } from "$env/static/private";
import { PUBLIC_TENANT } from "$env/static/public";
import { sendViaLegacyMailbox } from "$lib/email";
import {
	decideSmtp,
	readTemplateField,
	readSubjectField,
	readThroughCache,
	renderEmailSubject,
	renderEmailTemplate,
	requiredPlaceholders,
	selectTemplateHtml,
	smtpLogFields,
	type EmailTemplateVariables,
	type SettingsCache,
	type SmtpDecision,
	type SmtpSettings,
	type TemplateKey
} from "$lib/email/customerEmailCore";
import { deserializeSettingValue } from "$lib/services/siteSettingsService";

type LoadedSettings = {
	email: Record<string, unknown> | null;
	general: Record<string, unknown> | null;
	contact: Record<string, unknown> | null;
};

type CachedTransport = {
	fingerprint: string;
	transporter: Transporter;
};

let adminClient: SupabaseClient | null = null;
let settingsCache: SettingsCache<LoadedSettings> = null;
let tenantTransport: CachedTransport | null = null;

function getAdmin(): SupabaseClient {
	if (!adminClient) {
		adminClient = createClient(PRIVATE_SBUrl, PRIVATE_ServiceKey, {
			auth: {
				autoRefreshToken: false,
				persistSession: false
			}
		});
	}
	return adminClient;
}

function asRecord(value: unknown): Record<string, unknown> | null {
	if (!value || typeof value !== "object" || Array.isArray(value)) return null;
	return value as Record<string, unknown>;
}

function text(value: unknown): string {
	return typeof value === "string" ? value.trim() : "";
}

async function readSetting(key: string): Promise<unknown> {
	const { data, error } = await getAdmin()
		.from("site_settings")
		.select("value")
		.eq("key", key)
		.eq("tenant_id", PUBLIC_TENANT)
		.maybeSingle();

	if (error) throw error;
	return deserializeSettingValue(data?.value);
}

async function loadSettings(): Promise<LoadedSettings> {
	const [email, general, contact] = await Promise.all([
		readSetting("email"),
		readSetting("general"),
		readSetting("contact")
	]);
	return {
		email: asRecord(email),
		general: asRecord(general),
		contact: asRecord(contact)
	};
}

function brandingVariables(loaded: LoadedSettings | null): EmailTemplateVariables {
	const contact = loaded?.contact;
	const general = loaded?.general;
	const street = [text(contact?.street), text(contact?.streetNumber)].filter(Boolean).join(" ");
	const city = [text(contact?.zipCode), text(contact?.city)].filter(Boolean).join(" ");
	const composed = [street, city].filter(Boolean).join(", ");
	return {
		shopName: text(general?.shopName) || "Šťastné srdce",
		contactEmail: text(contact?.email),
		contactPhone: text(contact?.phone),
		contactAddress: text(contact?.address) || composed
	};
}

async function resolveDelivery(): Promise<{ decision: SmtpDecision; loaded: LoadedSettings | null }> {
	const result = await readThroughCache({
		now: Date.now(),
		cached: settingsCache,
		load: loadSettings
	});
	settingsCache = result.cached;

	if (result.failed || !result.value) {
		return { decision: decideSmtp(null, PRIVATE_seznam_key), loaded: null };
	}

	return {
		decision: decideSmtp(result.value.email as SmtpSettings, PRIVATE_seznam_key),
		loaded: result.value
	};
}

function tenantTransporter(decision: SmtpDecision): Transporter {
	const fingerprint = [decision.host, decision.port, decision.secure, decision.user, decision.password].join("|");
	if (!tenantTransport || tenantTransport.fingerprint !== fingerprint) {
		tenantTransport = {
			fingerprint,
			transporter: nodemailer.createTransport({
				host: decision.host,
				port: decision.port,
				secure: decision.secure,
				auth: {
					user: decision.user,
					pass: decision.password
				}
			})
		};
	}
	return tenantTransport.transporter;
}

export async function sendCustomerMail(options: {
	to: string;
	subject: string;
	templateKey: TemplateKey;
	variables: EmailTemplateVariables;
	fallbackHtml: string;
}): Promise<void> {
	const { to, templateKey, variables, fallbackHtml } = options;
	const { decision, loaded } = await resolveDelivery();
	const picked = selectTemplateHtml(
		readTemplateField(loaded?.email, templateKey),
		requiredPlaceholders(templateKey),
		fallbackHtml
	);
	const templateVariables = { ...brandingVariables(loaded), ...variables };
	const html =
		picked.source === "settings"
			? renderEmailTemplate(picked.html, templateVariables)
			: fallbackHtml;
	const storedSubject = readSubjectField(loaded?.email, templateKey);
	const renderedSubject =
		typeof storedSubject === "string" && storedSubject.trim()
			? renderEmailSubject(storedSubject, templateVariables)
			: "";
	const subject = renderedSubject || options.subject;

	if (decision.source === "legacy") {
		await sendViaLegacyMailbox({ to, subject, html });
		return;
	}

	try {
		await tenantTransporter(decision).sendMail({
			from: decision.from,
			to,
			subject,
			html
		});
	} catch (error) {
		console.error("[email] SMTP uživatele selhalo, záloha Seznam", {
			...smtpLogFields(decision),
			message: error instanceof Error ? error.message : "chyba"
		});
		await sendViaLegacyMailbox({ to, subject, html });
	}
}
