export const DEFAULT_FILL = '#166534';
export const DEFAULT_LINE = '#15803d';

const DEFAULT_SCALE = {
	50: '#f0fdf4',
	100: '#dcfce7',
	200: '#bbf7d0',
	500: '#22c55e',
	600: '#16a34a',
	700: '#15803d',
	800: '#166534',
	900: '#14532d'
} as const;

export type BrandStep = keyof typeof DEFAULT_SCALE;
export type BrandScale = Record<BrandStep, string>;

const HEX = /^#([0-9a-f]{6})$/i;

export function normalizeHex(value: unknown): string | null {
	if (typeof value !== 'string') return null;
	const match = value.trim().match(HEX);
	if (!match) return null;
	return `#${match[1].toLowerCase()}`;
}

function channels(hex: string): [number, number, number] {
	const n = Number.parseInt(hex.slice(1), 16);
	return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex(r: number, g: number, b: number): string {
	const byte = (n: number) =>
		Math.round(Math.min(255, Math.max(0, n)))
			.toString(16)
			.padStart(2, '0');
	return `#${byte(r)}${byte(g)}${byte(b)}`;
}

function mix(base: string, target: string, weight: number): string {
	const [r1, g1, b1] = channels(base);
	const [r2, g2, b2] = channels(target);
	return toHex(r1 + (r2 - r1) * weight, g1 + (g2 - g1) * weight, b1 + (b2 - b1) * weight);
}

export function brandScale(fillInput: unknown, lineInput: unknown): BrandScale {
	const fill = normalizeHex(fillInput) ?? DEFAULT_FILL;
	const line = normalizeHex(lineInput) ?? DEFAULT_LINE;
	if (fill === DEFAULT_FILL && line === DEFAULT_LINE) {
		return { ...DEFAULT_SCALE };
	}
	return {
		50: mix(fill, '#ffffff', 0.94),
		100: mix(fill, '#ffffff', 0.88),
		200: mix(fill, '#ffffff', 0.78),
		500: mix(line, '#ffffff', 0.35),
		600: mix(line, '#ffffff', 0.12),
		700: line,
		800: fill,
		900: mix(fill, '#000000', 0.22)
	};
}
