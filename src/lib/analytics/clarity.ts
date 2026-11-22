import { browser } from "$app/environment";
import type { CookieConsentConfig } from "$lib/stores/cookieStore";

const CLARITY_PROJECT_ID = "m1hmvdxofy";

let started = false;

export async function syncClarity(categories: CookieConsentConfig) {
	if (!browser) return;

	const analytics = categories.statistics?.value === true;
	const ads = categories.marketing?.value === true;
	if (!started && !analytics) return;

	const { default: Clarity } = await import("@microsoft/clarity");
	if (!started) {
		Clarity.init(CLARITY_PROJECT_ID);
		started = true;
	}

	Clarity.consentV2({
		ad_Storage: ads ? "granted" : "denied",
		analytics_Storage: analytics ? "granted" : "denied"
	});
}
