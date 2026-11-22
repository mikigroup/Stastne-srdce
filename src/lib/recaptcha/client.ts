import { PUBLIC_RECAPTCHA_SITE_KEY } from "$env/static/public";

const TIMEOUT_MS = 8000;

type GrecaptchaClient = {
	ready: (callback: () => void) => void;
	execute: (siteKey: string, options: { action: string }) => Promise<string>;
};

function recaptchaSrc(siteKey: string): string {
	return `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
}

function findRecaptchaScript(siteKey: string): HTMLScriptElement | null {
	return document.querySelector(`script[src="${recaptchaSrc(siteKey)}"]`);
}

function grecaptchaClient(): GrecaptchaClient | null {
	const client = (window as Window & { grecaptcha?: GrecaptchaClient }).grecaptcha;
	return client ?? null;
}

function ensureRecaptchaScript(siteKey: string): Promise<void> {
	if (grecaptchaClient()) return Promise.resolve();

	const existing = findRecaptchaScript(siteKey);
	const script = existing ?? document.createElement("script");
	if (!existing) {
		script.src = recaptchaSrc(siteKey);
		script.async = true;
		script.defer = true;
		document.head.appendChild(script);
	}

	if (grecaptchaClient()) return Promise.resolve();

	return new Promise((resolve, reject) => {
		let settled = false;
		let timer = 0;
		const finish = (error?: Error) => {
			if (settled) return;
			settled = true;
			window.clearInterval(timer);
			if (error) reject(error);
			else resolve();
		};

		timer = window.setInterval(() => {
			if (grecaptchaClient()) finish();
		}, 50);

		script.addEventListener(
			"load",
			() => {
				if (grecaptchaClient()) finish();
			},
			{ once: true }
		);
		script.addEventListener(
			"error",
			() => finish(new Error("reCAPTCHA script failed")),
			{ once: true }
		);

		window.setTimeout(() => finish(new Error("reCAPTCHA script failed")), TIMEOUT_MS);
	});
}

/** Vrátí token reCAPTCHA v3 pro danou akci, nebo null když se ověření nepodaří. */
export function getRecaptchaToken(action: string): Promise<string | null> {
	const siteKey = PUBLIC_RECAPTCHA_SITE_KEY;
	if (!siteKey || typeof document === "undefined") return Promise.resolve(null);

	return new Promise((resolve) => {
		let settled = false;
		let timeout = 0;
		const finish = (token: string | null) => {
			if (settled) return;
			settled = true;
			window.clearTimeout(timeout);
			resolve(token);
		};

		timeout = window.setTimeout(() => finish(null), TIMEOUT_MS);

		ensureRecaptchaScript(siteKey)
			.then(() => {
				const grecaptcha = grecaptchaClient();
				if (!grecaptcha) {
					finish(null);
					return;
				}

				try {
					grecaptcha.ready(() => {
						grecaptcha
							.execute(siteKey, { action })
							.then((token) => finish(token || null))
							.catch(() => finish(null));
					});
				} catch {
					finish(null);
				}
			})
			.catch((error) => {
				console.error("❌ [RECAPTCHA] Chyba při získávání tokenu:", error);
				finish(null);
			});
	});
}
