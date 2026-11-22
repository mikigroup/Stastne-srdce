/** Povolená je jen relativní cesta v této aplikaci. */
export function safeInternalPath(next: string | null | undefined, fallback = "/"): string {
	if (!next) return fallback;
	if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
	if (next.includes("\\") || next.includes("://") || next.includes("\0")) return fallback;
	return next;
}
