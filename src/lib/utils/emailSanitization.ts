/**
 * Utility funkce pro sanitizaci hodnot před vložením do emailu
 * Chrání proti email injection útokům
 */

/**
 * Sanitizuje text pro bezpečné vložení do emailu
 * Odstraní nebezpečné znaky, které by mohly manipulovat s emailovými hlavičkami
 * 
 * @param text - Text k sanitizaci
 * @returns Sanitizovaný text
 */
export function sanitizeEmailText(text: string | null | undefined): string {
	if (!text) return '';
	
	// Převedení na string a odstranění nebezpečných znaků
	let sanitized = String(text)
		// Odstranit CRLF a LF, které mohou manipulovat s hlavičkami
		.replace(/\r\n/g, ' ')
		.replace(/\n/g, ' ')
		.replace(/\r/g, ' ')
		// Odstranit další nebezpečné znaky pro email hlavičky
		.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
		// Odstranit více mezer za sebou
		.replace(/\s+/g, ' ')
		.trim();
	
	return sanitized;
}

/**
 * Sanitizuje email adresu
 * 
 * @param email - Email adresa k sanitizaci
 * @returns Sanitizovaná email adresa
 */
export function sanitizeEmailAddress(email: string | null | undefined): string {
	if (!email) return '';
	
	// Základní sanitizace - odstranit nebezpečné znaky
	let sanitized = String(email)
		.replace(/[\r\n]/g, '')
		.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
		.trim();
	
	return sanitized;
}

/**
 * Sanitizuje telefonní číslo
 * 
 * @param phone - Telefonní číslo k sanitizaci
 * @returns Sanitizované telefonní číslo
 */
export function sanitizePhone(phone: string | null | undefined): string {
	if (!phone) return '';
	
	// Základní sanitizace
	let sanitized = String(phone)
		.replace(/[\r\n]/g, '')
		.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
		.trim();
	
	return sanitized;
}
