/**
 * Utility funkce pro detekci bot registrací na základě analýzy dat
 */

export interface BotDetectionResult {
	isBot: boolean;
	confidence: number; // 0-1, kde 1 = jistě bot
	reasons: string[];
}

/**
 * Detekuje, jestli je text náhodný řetězec (typický pro boty)
 */
export function isRandomString(text: string | null | undefined): boolean {
	if (!text || text.trim() === '') return false;

	const trimmed = text.trim();
	const length = trimmed.length;

	// Příliš krátké nebo dlouhé texty jsou podezřelé
	if (length < 3 || length > 50) return false;

	// Počítat statistiky
	const upperCase = (trimmed.match(/[A-Z]/g) || []).length;
	const lowerCase = (trimmed.match(/[a-z]/g) || []).length;
	const digits = (trimmed.match(/[0-9]/g) || []).length;
	const spaces = (trimmed.match(/\s/g) || []).length;
	const specialChars = (trimmed.match(/[^A-Za-z0-9\s]/g) || []).length;
	const vowels = (trimmed.match(/[aeiouAEIOUáéíóúůýÁÉÍÓÚŮÝ]/g) || []).length;
	const consonants = (trimmed.match(/[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZčďňřšťžČĎŇŘŠŤŽ]/g) || []).length;

	// Podezřelé vzorce:
	
	// 1. Příliš mnoho velkých písmen v poměru k malým (více než 60%)
	if (upperCase + lowerCase > 0) {
		const upperRatio = upperCase / (upperCase + lowerCase);
		if (upperRatio > 0.6 && length > 10) {
			return true; // Např. "urDKKUnMQxQZKOwpeKQHr"
		}
	}

	// 2. Absence mezer v dlouhých textech (skutečná jména mají mezery)
	if (spaces === 0 && length > 15) {
		return true; // Např. "BfUUOKkcyRUjvjrhngGOFLgJ"
	}

	// 3. Příliš mnoho různých znaků bez mezer (náhodný generátor)
	if (spaces === 0 && length > 12) {
		const uniqueChars = new Set(trimmed.toLowerCase()).size;
		const uniqueRatio = uniqueChars / length;
		// Pokud má více než 80% unikátních znaků, je to podezřelé
		if (uniqueRatio > 0.8) {
			return true;
		}
	}

	// 4. Absence samohlásek nebo velmi málo samohlásek (skutečná slova mají samohlásky)
	if (vowels + consonants > 0) {
		const vowelRatio = vowels / (vowels + consonants);
		if (vowelRatio < 0.15 && length > 10) {
			return true; // Např. "QKRTCXMPdZXmpbkpm"
		}
	}

	// 5. Příliš mnoho číslic v textovém poli (kromě telefonu, PSČ, IČO)
	if (digits > length * 0.5 && length > 8) {
		return true;
	}

	// 6. Všechny znaky jsou stejné (např. "AAAAAAAA")
	if (new Set(trimmed).size === 1 && length > 5) {
		return true;
	}

	// 7. Střídání velkých a malých písmen bez logiky (např. "AbCdEfGh")
	if (length > 8 && upperCase > 0 && lowerCase > 0) {
		let patternCount = 0;
		for (let i = 1; i < length; i++) {
			const prevIsUpper = trimmed[i - 1] === trimmed[i - 1].toUpperCase();
			const currIsUpper = trimmed[i] === trimmed[i].toUpperCase();
			if (prevIsUpper !== currIsUpper) {
				patternCount++;
			}
		}
		// Pokud se střídá více než 70% znaků, je to podezřelé
		if (patternCount / (length - 1) > 0.7) {
			return true;
		}
	}

	return false;
}

/**
 * Validuje české PSČ (5 číslic nebo formát 123 45)
 */
export function isValidCzechPostalCode(zipCode: string | null | undefined): boolean {
	if (!zipCode) return false;
	
	const trimmed = zipCode.trim();
	// Formát: 5 číslic nebo 3 číslice + mezera + 2 číslice
	const postalCodeRegex = /^(\d{5}|\d{3}\s\d{2})$/;
	return postalCodeRegex.test(trimmed);
}

/**
 * Validuje české telefonní číslo
 */
export function isValidCzechPhone(phone: string | null | undefined): boolean {
	if (!phone) return false;
	
	const trimmed = phone.trim();
	// Formáty: +420XXXXXXXXX, 00420XXXXXXXXX, nebo 9 číslic (bez předvolby)
	// Odstranit mezery, pomlčky, závorky
	const cleaned = trimmed.replace(/[\s\-\(\)]/g, '');
	
	// +420 nebo 00420 + 9 číslic
	if (/^(\+420|00420)\d{9}$/.test(cleaned)) {
		return true;
	}
	
	// 9 číslic (bez předvolby)
	if (/^\d{9}$/.test(cleaned)) {
		return true;
	}
	
	return false;
}

/**
 * Validuje české IČO (8 číslic)
 */
export function isValidCzechICO(ico: string | null | undefined): boolean {
	if (!ico) return false;
	
	const trimmed = ico.trim();
	// IČO má 8 číslic
	const icoRegex = /^\d{8}$/;
	return icoRegex.test(trimmed);
}

/**
 * Validuje české DIČ (CZ + 8-10 číslic)
 */
export function isValidCzechDIC(dic: string | null | undefined): boolean {
	if (!dic) return false;
	
	const trimmed = dic.trim().toUpperCase();
	// DIČ má formát CZ + 8-10 číslic
	const dicRegex = /^CZ\d{8,10}$/;
	return dicRegex.test(trimmed);
}

/**
 * Detekuje, jestli jsou data z formuláře podezřelá (bot)
 */
export function detectBotRegistration(data: {
	first_name?: string | null;
	last_name?: string | null;
	street?: string | null;
	street_number?: string | null;
	city?: string | null;
	zip_code?: string | null;
	telephone?: string | null;
	ico?: string | null;
	dic?: string | null;
	company?: string | null;
	allergies_description?: string | null;
}): BotDetectionResult {
	const reasons: string[] = [];
	let confidence = 0;

	// Kontrola jména
	if (isRandomString(data.first_name)) {
		reasons.push('Jméno vypadá jako náhodný řetězec');
		confidence += 0.3;
	}

	// Kontrola příjmení
	if (isRandomString(data.last_name)) {
		reasons.push('Příjmení vypadá jako náhodný řetězec');
		confidence += 0.3;
	}

	// Kontrola ulice
	if (isRandomString(data.street)) {
		reasons.push('Ulice vypadá jako náhodný řetězec');
		confidence += 0.2;
	}

	// Kontrola města
	if (isRandomString(data.city)) {
		reasons.push('Město vypadá jako náhodný řetězec');
		confidence += 0.2;
	}

	// Kontrola PSČ
	if (data.zip_code && !isValidCzechPostalCode(data.zip_code)) {
		reasons.push('PSČ není ve správném formátu (očekáváno: 5 číslic nebo 123 45)');
		confidence += 0.2;
	}

	// Kontrola telefonu
	if (data.telephone && !isValidCzechPhone(data.telephone)) {
		reasons.push('Telefonní číslo není ve správném formátu');
		confidence += 0.15;
	}

	// Kontrola IČO (pokud je vyplněno)
	if (data.ico && data.ico.trim() !== '' && !isValidCzechICO(data.ico)) {
		reasons.push('IČO není ve správném formátu (očekáváno: 8 číslic)');
		confidence += 0.1;
	}

	// Kontrola DIČ (pokud je vyplněno)
	if (data.dic && data.dic.trim() !== '' && !isValidCzechDIC(data.dic)) {
		reasons.push('DIČ není ve správném formátu (očekáváno: CZ + 8-10 číslic)');
		confidence += 0.1;
	}

	// Kontrola firmy (pokud je vyplněno)
	if (isRandomString(data.company)) {
		reasons.push('Název firmy vypadá jako náhodný řetězec');
		confidence += 0.15;
	}

	// Kontrola popisu alergií (pokud je vyplněno)
	if (isRandomString(data.allergies_description)) {
		reasons.push('Popis alergií vypadá jako náhodný řetězec');
		confidence += 0.1;
	}

	// Kontrola podobnosti - pokud jsou všechna pole podobně dlouhá a náhodná
	const textFields = [
		data.first_name,
		data.last_name,
		data.street,
		data.city,
		data.company
	].filter(f => f && f.trim() !== '');

	if (textFields.length >= 3) {
		const lengths = textFields.map(f => f!.length);
		const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
		const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
		
		// Pokud jsou všechna pole podobně dlouhá (nízká variance) a jsou náhodná
		if (variance < 25 && textFields.every(f => isRandomString(f))) {
			reasons.push('Všechna textová pole mají podobnou délku a vypadají jako náhodné řetězce');
			confidence += 0.2;
		}
	}

	// Normalizovat confidence na 0-1
	confidence = Math.min(confidence, 1.0);

	return {
		isBot: confidence >= 0.5, // Threshold 50%
		confidence,
		reasons
	};
}

/**
 * Kontrola, jestli email je z dočasné emailové služby
 */
export function isTemporaryEmail(email: string | null | undefined): boolean {
	if (!email) return false;

	const emailLower = email.toLowerCase();
	const domain = emailLower.split('@')[1];
	if (!domain) return false;

	// Seznam známých dočasných emailových služeb
	const temporaryEmailDomains = [
		'10minutemail.com',
		'10minutemail.de',
		'10minutemail.net',
		'guerrillamail.com',
		'guerrillamail.net',
		'guerrillamail.org',
		'mailinator.com',
		'temp-mail.org',
		'tempmail.com',
		'tempmail.net',
		'trashmail.com',
		'yopmail.com',
		'throwaway.email',
		'getnada.com',
		'mohmal.com',
		'fakeinbox.com',
		'dispostable.com',
		'maildrop.cc',
		'mailcatch.com',
		'emailondeck.com',
		'throwawaymail.com',
		'mintemail.com',
		'spamgourmet.com',
		'mytrashmail.com',
		'tempail.com',
		'getairmail.com',
		'mailnesia.com',
		'emailfake.com',
		'fakemailgenerator.com',
		'tempinbox.co.uk',
		'fake-mail.net',
		'emailias.com',
		'throwaway.email',
		'getairmail.com',
		'emailondeck.com',
		'maildrop.cc',
		'throwawaymail.com',
		'mintemail.com',
		'spamgourmet.com',
		'mytrashmail.com',
		'tempail.com',
		'getairmail.com',
		'mailnesia.com',
		'emailfake.com',
		'fakemailgenerator.com',
		'tempinbox.co.uk',
		'fake-mail.net',
		'emailias.com'
	];

	return temporaryEmailDomains.some(tempDomain => domain.includes(tempDomain));
}

