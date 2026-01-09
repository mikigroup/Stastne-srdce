import { env } from '$env/dynamic/private';
import { PUBLIC_RECAPTCHA_SITE_KEY } from '$env/static/public';

export interface RecaptchaVerificationResult {
	success: boolean;
	score: number;
	error?: string;
}

/**
 * Ověří reCAPTCHA v3 token u Google API
 * @param token - reCAPTCHA token získaný z frontendu
 * @param remoteip - Volitelná IP adresa uživatele pro lepší validaci
 * @param scoreThreshold - Minimální score pro úspěšnou validaci (default: 0.5)
 * @returns Result s success, score a případnou chybou
 */
export async function verifyRecaptchaToken(
	token: string,
	remoteip?: string,
	scoreThreshold: number = 0.5
): Promise<RecaptchaVerificationResult> {
	const secretKey = env.PRIVATE_RECAPTCHA_SECRET_KEY;

	// Graceful degradation - pokud není nakonfigurováno, logovat warning ale pokračovat
	if (!secretKey) {
		console.warn('⚠️ [RECAPTCHA] PRIVATE_RECAPTCHA_SECRET_KEY není nastaveno - reCAPTCHA validace je přeskočena');
		return {
			success: true,
			score: 1.0,
			error: 'reCAPTCHA není nakonfigurováno'
		};
	}

	if (!token || token.trim() === '') {
		console.warn('⚠️ [RECAPTCHA] Token je prázdný');
		return {
			success: false,
			score: 0.0,
			error: 'reCAPTCHA token chybí'
		};
	}

	try {
		const url = 'https://www.google.com/recaptcha/api/siteverify';
		const formData = new URLSearchParams();
		formData.append('secret', secretKey);
		formData.append('response', token);
		if (remoteip) {
			formData.append('remoteip', remoteip);
		}

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: formData.toString()
		});

		if (!response.ok) {
			console.error('❌ [RECAPTCHA] Google API request failed:', response.status, response.statusText);
			return {
				success: false,
				score: 0.0,
				error: `Google API request failed: ${response.status}`
			};
		}

		const data = await response.json();

		// Logování pro monitoring (bez citlivých dat)
		console.log('📊 [RECAPTCHA] Verification result:', {
			success: data.success,
			score: data.score,
			action: data.action,
			hasErrors: !!data['error-codes']
		});

		// Kontrola success flagu z Google API
		if (!data.success) {
			const errorCodes = data['error-codes'] || [];
			console.warn('⚠️ [RECAPTCHA] Google API returned success=false:', errorCodes);
			return {
				success: false,
				score: 0.0,
				error: `reCAPTCHA validation failed: ${errorCodes.join(', ')}`
			};
		}

		// Kontrola score (reCAPTCHA v3 vrací score 0.0-1.0)
		const score = data.score || 0.0;
		if (score < scoreThreshold) {
			console.warn(`⚠️ [RECAPTCHA] Score ${score} je pod threshold ${scoreThreshold}`);
			return {
				success: false,
				score: score,
				error: `reCAPTCHA score ${score} je příliš nízký (minimum: ${scoreThreshold})`
			};
		}

		return {
			success: true,
			score: score
		};
	} catch (error) {
		console.error('❌ [RECAPTCHA] Error during verification:', error);
		return {
			success: false,
			score: 0.0,
			error: error instanceof Error ? error.message : 'Neznámá chyba při ověřování reCAPTCHA'
		};
	}
}

/**
 * Získá IP adresu z requestu
 * @param request - Request objekt
 * @returns IP adresa nebo undefined
 */
export function getClientIP(request: Request): string | undefined {
	// Zkusit získat IP z různých headers (pro proxy/CDN)
	const forwarded = request.headers.get('x-forwarded-for');
	if (forwarded) {
		return forwarded.split(',')[0].trim();
	}

	const realIP = request.headers.get('x-real-ip');
	if (realIP) {
		return realIP;
	}

	// Fallback - pokud není dostupná, vrátit undefined
	return undefined;
}

