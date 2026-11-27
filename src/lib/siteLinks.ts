export type SiteLink = {
	label: string;
	href: string;
};

export const DEFAULT_MENU_LINKS: SiteLink[] = [
	{ label: 'O nás', href: '/' },
	{ label: 'Obědy', href: '/obedy' },
	{ label: 'Poradna', href: '/poradna' },
	{ label: 'HACCP', href: '/haccp' },
	{ label: 'Přednášky a kurzy', href: '/prednasky-a-kurzy' },
	{ label: 'Kontakt', href: '/kontakt' }
];

export const DEFAULT_FOOTER_LINKS: SiteLink[] = [
	{ label: 'Obchodní podmínky', href: '/obchodni-podminky' },
	{ label: 'Kontakt', href: '/kontakt' },
	{ label: 'GDPR', href: '/gdpr' }
];

function normalizeHref(value: unknown): string | null {
	if (typeof value !== 'string') return null;
	const href = value.trim();
	if (!href || href.length > 200) return null;
	if (href.startsWith('/') && !href.startsWith('//')) return href;
	try {
		const url = new URL(href);
		if (url.protocol === 'https:' || url.protocol === 'http:') return url.toString();
	} catch {
		return null;
	}
	return null;
}

/** Chybějící hodnota vrátí výchozí odkazy. Prázdné pole znamená, že odkazy mají zmizet. */
export function readSiteLinks(value: unknown, fallback: SiteLink[]): SiteLink[] {
	if (!Array.isArray(value)) return fallback.map((link) => ({ ...link }));
	return value.flatMap((item) => {
		if (!item || typeof item !== 'object') return [];
		const label = String((item as SiteLink).label ?? '').trim().slice(0, 40);
		const href = normalizeHref((item as SiteLink).href);
		if (!label || !href) return [];
		return [{ label, href }];
	});
}
