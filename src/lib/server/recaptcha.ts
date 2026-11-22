import { PRIVATE_RECAPTCHA_SECRET_KEY } from "$env/static/private";
import {
	assessRecaptchaVerification,
	normalizeHostname,
	type RecaptchaVerificationResult
} from "$lib/recaptcha/assess";

export type { RecaptchaVerificationResult };

export interface VerifyRecaptchaOptions {
	remoteip?: string;
	scoreThreshold?: number;
	expectedAction?: string;
	expectedHostnames?: string[];
}

/**
 * Ověří reCAPTCHA v3 token u Google API.
 * Secret, akce, hostname, skóre i vyčerpaná kvóta se vyhodnocují na serveru.
 */
export async function verifyRecaptchaToken(
	token: string,
	options: VerifyRecaptchaOptions = {}
): Promise<RecaptchaVerificationResult> {
	const secretKey = PRIVATE_RECAPTCHA_SECRET_KEY;

	if (!secretKey) {
		console.warn("⚠️ [RECAPTCHA] PRIVATE_RECAPTCHA_SECRET_KEY není nastaveno");
		return assessRecaptchaVerification({ secret: "" });
	}

	if (!token || token.trim() === "") {
		console.warn("⚠️ [RECAPTCHA] Token je prázdný");
		return assessRecaptchaVerification({ secret: secretKey, token });
	}

	try {
		const formData = new URLSearchParams();
		formData.append("secret", secretKey);
		formData.append("response", token);
		if (options.remoteip) {
			formData.append("remoteip", options.remoteip);
		}

		const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: formData.toString()
		});

		if (!response.ok) {
			console.error("❌ [RECAPTCHA] Google API request failed:", response.status, response.statusText);
			return assessRecaptchaVerification({
				secret: secretKey,
				token,
				httpOk: false,
				httpStatus: response.status
			});
		}

		const data = await response.json();


		const result = assessRecaptchaVerification({
			secret: secretKey,
			token,
			payload: data,
			httpOk: true,
			scoreThreshold: options.scoreThreshold,
			expectedAction: options.expectedAction,
			expectedHostnames: options.expectedHostnames
		});

		if (!result.success) {
			console.warn("⚠️ [RECAPTCHA]", result.error);
		}

		return result;
	} catch (error) {
		console.error("❌ [RECAPTCHA] Error during verification:", error);
		return {
			success: false,
			score: 0,
			error: error instanceof Error ? error.message : "Neznámá chyba při ověřování reCAPTCHA"
		};
	}
}

/** Hostitelé, vůči kterým se porovnává hostname z odpovědi Google. */
export function getExpectedHostnames(request: Request): string[] {
	const hosts: string[] = [];
	const add = (value: string | null | undefined) => {
		if (!value) return;
		for (const part of value.split(",")) {
			const host = normalizeHostname(part);
			if (host && !hosts.includes(host)) hosts.push(host);
		}
	};

	try {
		add(new URL(request.url).hostname);
	} catch {
		// request.url bez platného hostitele se do seznamu nepřidá
	}

	add(request.headers.get("x-forwarded-host"));
	return hosts;
}

/**
 * Získá IP adresu z requestu.
 * @param request - Request objekt
 * @returns IP adresa nebo undefined
 */
export function getClientIP(request: Request): string | undefined {
	const forwarded = request.headers.get("x-forwarded-for");
	if (forwarded) {
		return forwarded.split(",")[0].trim();
	}

	const realIP = request.headers.get("x-real-ip");
	if (realIP) {
		return realIP;
	}

	return undefined;
}
