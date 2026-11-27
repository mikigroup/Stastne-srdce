export const LEGACY_FROM = '"Šťastné srdce" <info@stastnesrdce.cz>';
export const LEGACY_USER = "info@stastnesrdce.cz";
export const LEGACY_HOST = "smtp.seznam.cz";

const CACHE_TTL_MS = 60_000;

export type SmtpSettings = {
	smtpEnabled?: boolean;
	smtpHost?: string;
	smtpPort?: string | number;
	smtpUsername?: string;
	smtpPassword?: string;
	smtpSecure?: boolean;
	smtpFromEmail?: string;
	smtpFromName?: string;
};

export type SmtpDecision = {
	source: "tenant" | "legacy";
	host: string;
	port: number;
	secure: boolean;
	user: string;
	password: string;
	from: string;
};

export type TemplateKey =
	| "registrationEmailTemplate"
	| "orderConfirmEmailTemplate"
	| "contactEmailTemplate"
	| "forgotEmailTemplate"
	| "reactivationTemplate";

const REQUIRED_PLACEHOLDERS: Record<TemplateKey, readonly string[]> = {
	registrationEmailTemplate: ["confirmationLink"],
	forgotEmailTemplate: ["resetLink"],
	orderConfirmEmailTemplate: [],
	contactEmailTemplate: [],
	reactivationTemplate: []
};

const RAW_HTML_KEYS = new Set(["orderItems"]);

export type EmailTemplateVariables = Record<string, string | number | null | undefined>;

export function requiredPlaceholders(key: TemplateKey): readonly string[] {
	return REQUIRED_PLACEHOLDERS[key];
}

export function decideSmtp(settings: SmtpSettings | null | undefined, legacyPassword: string): SmtpDecision {
	const host = settings?.smtpHost?.trim() ?? "";
	const user = settings?.smtpUsername?.trim() ?? "";
	const password = settings?.smtpPassword?.trim() ?? "";

	if (settings?.smtpEnabled && host && user && password) {
		const port = Number(settings.smtpPort) || 587;
		const secure = settings.smtpSecure ?? port === 465;
		const fromEmail = settings.smtpFromEmail?.trim() || LEGACY_USER;
		const fromName = settings.smtpFromName?.trim() || "Šťastné srdce";
		return {
			source: "tenant",
			host,
			port,
			secure,
			user,
			password,
			from: `"${fromName}" <${fromEmail}>`
		};
	}

	return {
		source: "legacy",
		host: LEGACY_HOST,
		port: 465,
		secure: true,
		user: LEGACY_USER,
		password: legacyPassword,
		from: LEGACY_FROM
	};
}

export function smtpLogFields(decision: SmtpDecision): {
	source: SmtpDecision["source"];
	host: string;
	port: number;
	user: string;
	from: string;
} {
	return {
		source: decision.source,
		host: decision.host,
		port: decision.port,
		user: decision.user,
		from: decision.from
	};
}

export function readTemplateField(
	email: Record<string, unknown> | null | undefined,
	key: TemplateKey
): unknown {
	if (!email) return undefined;
	if (key === "orderConfirmEmailTemplate") {
		return email.orderConfirmEmailTemplate || email.orderConfirmationTemplate;
	}
	if (key === "contactEmailTemplate") {
		return email.contactEmailTemplate || email.contactFormTemplate;
	}
	return email[key];
}

export function selectTemplateHtml(
	stored: unknown,
	required: readonly string[],
	fallbackHtml: string
): { source: "settings" | "fallback"; html: string } {
	if (typeof stored !== "string" || !stored.trim()) {
		return { source: "fallback", html: fallbackHtml };
	}
	for (const key of required) {
		if (!new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`).test(stored)) {
			return { source: "fallback", html: fallbackHtml };
		}
	}
	return { source: "settings", html: stored };
}

export function renderEmailTemplate(
	template: string,
	variables: EmailTemplateVariables,
	options?: { escape?: boolean }
): string {
	let result = processConditionalBlocks(template, variables);
	const escape = options?.escape !== false;

	for (const [key, value] of Object.entries(variables)) {
		const placeholder = new RegExp(`\\{\\{\\s*${escapeRegExp(key)}\\s*\\}\\}`, "g");
		const rendered =
			value == null ? "" : !escape || RAW_HTML_KEYS.has(key) ? String(value) : escapeHtml(String(value));
		result = result.replace(placeholder, rendered);
	}

	return result;
}

export function renderEmailSubject(template: string, variables: EmailTemplateVariables): string {
	return renderEmailTemplate(template, variables, { escape: false })
		.replace(/[\r\n]+/g, " ")
		.trim();
}

const SUBJECT_FIELDS: Record<TemplateKey, string> = {
	registrationEmailTemplate: "registrationEmailSubject",
	orderConfirmEmailTemplate: "orderConfirmEmailSubject",
	contactEmailTemplate: "contactEmailSubject",
	forgotEmailTemplate: "forgotEmailSubject",
	reactivationTemplate: "reactivationEmailSubject"
};

export function readSubjectField(
	email: Record<string, unknown> | null | undefined,
	key: TemplateKey
): unknown {
	if (!email) return undefined;
	return email[SUBJECT_FIELDS[key]];
}

export type SettingsCache<T> = { expires: number; value: T } | null;

export async function readThroughCache<T>(args: {
	now: number;
	cached: SettingsCache<T>;
	load: () => Promise<T>;
	ttlMs?: number;
}): Promise<{ value: T | null; cached: SettingsCache<T>; fromCache: boolean; failed: boolean }> {
	const ttlMs = args.ttlMs ?? CACHE_TTL_MS;
	if (args.cached && args.now < args.cached.expires) {
		return { value: args.cached.value, cached: args.cached, fromCache: true, failed: false };
	}

	try {
		const value = await args.load();
		const cached = { expires: args.now + ttlMs, value };
		return { value, cached, fromCache: false, failed: false };
	} catch {
		if (args.cached) {
			return { value: args.cached.value, cached: args.cached, fromCache: true, failed: false };
		}
		return { value: null, cached: null, fromCache: false, failed: true };
	}
}

function processConditionalBlocks(template: string, variables: EmailTemplateVariables): string {
	const blockPattern = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
	let result = template;
	let previous: string;

	do {
		previous = result;
		result = result.replace(blockPattern, (_, key: string, content: string) => {
			const value = variables[key];
			const truthy = value != null && String(value).trim() !== "";
			return truthy ? content : "";
		});
	} while (result !== previous);

	return result;
}

function escapeHtml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;");
}

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
