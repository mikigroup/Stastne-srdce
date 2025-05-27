import type { PageLoad } from "./$types";

// Cache pro data
let dataCache: any = null;
let lastCacheUpdate = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minut

export const load: PageLoad = async ({ parent }) => {
	// Kontrola cache
	const now = Date.now();
	if (dataCache && (now - lastCacheUpdate) < CACHE_DURATION) {
		console.log("Používám cache pro HACCP data");
		return dataCache;
	}

	// Načtení dat z parent layoutu
	const { settings } = await parent();

	// Vytvoření cache
	dataCache = {
		settings
	};
	lastCacheUpdate = now;

	return dataCache;
}; 