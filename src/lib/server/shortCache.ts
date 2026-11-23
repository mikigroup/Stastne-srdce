const TTL_MS = 60_000;

type Entry = {
	expires: number;
	value: unknown;
};

const entries = new Map<string, Entry>();

export function readShortCache<T>(key: string): T | undefined {
	const hit = entries.get(key);
	if (!hit) return undefined;
	if (hit.expires <= Date.now()) {
		entries.delete(key);
		return undefined;
	}
	return hit.value as T;
}

export function writeShortCache<T>(key: string, value: T): T {
	entries.set(key, { expires: Date.now() + TTL_MS, value });
	return value;
}
