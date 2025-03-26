import { readable } from "svelte/store";

export const siteConfig = readable({
	name: "Šťastné srdce",
	shortName: "Šťastné",
	slogan: "Zdravé stravování a rozvoz jídla",
	logo: "/android-chrome-192x192.png",
	domain: "stastnesrdce.cz",
	year: "2022 - 2025"
});
