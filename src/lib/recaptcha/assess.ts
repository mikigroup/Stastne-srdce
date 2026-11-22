export interface RecaptchaVerificationResult {
	success: boolean;
	score: number;
	error?: string;
}

export interface RecaptchaSiteverifyResponse {
	success?: boolean;
	score?: number;
	action?: string;
	hostname?: string;
	"error-codes"?: string[];
}

export interface RecaptchaAssessmentInput {
	secret?: string;
	token?: string;
	payload?: RecaptchaSiteverifyResponse | null;
	httpOk?: boolean;
	httpStatus?: number;
	scoreThreshold?: number;
	expectedAction?: string;
	expectedHostnames?: string[];
}

const QUOTA_MARKER = "over free quota";

export function normalizeHostname(value: string): string {
	const trimmed = value.trim().toLowerCase();
	if (!trimmed) return "";
	const withoutPort = trimmed.replace(/:\d+$/, "");
	return withoutPort.endsWith(".") ? withoutPort.slice(0, -1) : withoutPort;
}

function isOverFreeQuota(errorCodes: string[]): boolean {
	return errorCodes.some((code) => code.toLowerCase().includes(QUOTA_MARKER));
}

/**
 * Vyhodnotí odpověď siteverify bez síťového volání.
 * Chybějící secret, jiná akce, cizí hostname i vyčerpaná kvóta jsou zamítnutí.
 */
export function assessRecaptchaVerification(
	input: RecaptchaAssessmentInput
): RecaptchaVerificationResult {
	const scoreThreshold = input.scoreThreshold ?? 0.5;

	if (!input.secret?.trim()) {
		return {
			success: false,
			score: 0,
			error: "reCAPTCHA není nakonfigurováno"
		};
	}

	if (!input.token?.trim()) {
		return {
			success: false,
			score: 0,
			error: "reCAPTCHA token chybí"
		};
	}

	if (input.httpOk === false) {
		return {
			success: false,
			score: 0,
			error: `Google API request failed: ${input.httpStatus ?? "unknown"}`
		};
	}

	const data = input.payload;
	if (!data) {
		return {
			success: false,
			score: 0,
			error: "reCAPTCHA odpověď chybí"
		};
	}

	const errorCodes = Array.isArray(data["error-codes"]) ? data["error-codes"] : [];
	const score = typeof data.score === "number" ? data.score : 0;

	if (isOverFreeQuota(errorCodes)) {
		return {
			success: false,
			score,
			error: "reCAPTCHA kvóta je vyčerpaná"
		};
	}

	if (!data.success) {
		return {
			success: false,
			score: 0,
			error: `reCAPTCHA validation failed: ${errorCodes.join(", ")}`
		};
	}

	if (score < scoreThreshold) {
		return {
			success: false,
			score,
			error: `reCAPTCHA score ${score} je příliš nízký (minimum: ${scoreThreshold})`
		};
	}

	if (input.expectedAction && data.action !== input.expectedAction) {
		return {
			success: false,
			score,
			error: `reCAPTCHA akce neodpovídá očekávané akci ${input.expectedAction}`
		};
	}

	const expectedHostnames = (input.expectedHostnames ?? [])
		.map(normalizeHostname)
		.filter(Boolean);
	const actualHostname = typeof data.hostname === "string" ? normalizeHostname(data.hostname) : "";
	if (expectedHostnames.length > 0 && !expectedHostnames.includes(actualHostname)) {
		return {
			success: false,
			score,
			error: "reCAPTCHA hostname neodpovídá požadavku"
		};
	}

	return {
		success: true,
		score
	};
}
