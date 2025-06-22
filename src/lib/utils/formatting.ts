// =============================================================================
// GLOBÁLNÍ FORMÁTOVACÍ FUNKCE PRO PROJEKT ŠŤASTNÉ SRDCE
// =============================================================================

// =============================================================================
// FORMÁTOVÁNÍ DATUMŮ A ČASU
// =============================================================================

/**
 * Formátuje datum do českého formátu (pouze datum) - dlouhý formát
 * @param date - datum jako string nebo Date objekt
 * @returns datum ve formátu "1. ledna 2024"
 */
export function formatDateToCzech(date: string | Date): string {
	if (!date) return '';
	
	const dateObj = typeof date === 'string' ? new Date(date) : date;
	
	if (isNaN(dateObj.getTime())) {
		return '';
	}
	
	return dateObj.toLocaleDateString('cs-CZ', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
}

/**
 * Formátuje datum do českého formátu (krátký)
 * @param date - datum jako string nebo Date objekt
 * @returns datum ve formátu "1. 1. 2024"
 */
export function formatDateToCzechShort(date: string | Date): string {
	if (!date) return '';
	
	const dateObj = typeof date === 'string' ? new Date(date) : date;
	
	if (isNaN(dateObj.getTime())) {
		return '';
	}
	
	return dateObj.toLocaleDateString('cs-CZ');
}

/**
 * Formátuje datum a čas do českého formátu - dlouhý formát
 * @param dateTime - datum a čas jako string nebo Date objekt
 * @returns datum a čas ve formátu "1. ledna 2024 v 14:30"
 */
export function formatDateTimeToCzech(dateTime: string | Date): string {
	if (!dateTime) return '';
	
	const dateObj = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
	
	if (isNaN(dateObj.getTime())) {
		return '';
	}
	
	return dateObj.toLocaleString('cs-CZ', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

/**
 * Formátuje datum a čas do českého formátu (krátký)
 * @param dateTime - datum a čas jako string nebo Date objekt
 * @returns datum a čas ve formátu "1. 1. 2024 14:30"
 */
export function formatDateTimeToCzechShort(dateTime: string | Date): string {
	if (!dateTime) return '';
	
	const dateObj = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
	
	if (isNaN(dateObj.getTime())) {
		return '';
	}
	
	return dateObj.toLocaleString('cs-CZ', {
		day: '2-digit',
		month: '2-digit',  
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

/**
 * Formátuje datum a čas do českého formátu (krátký bez úvodních nul)
 * @param dateTime - datum a čas jako string nebo Date objekt
 * @returns datum a čas ve formátu "1. 6. 2024 14:30"
 */
export function formatDateTimeToCzechShortNoZero(dateTime: string | Date): string {
	if (!dateTime) return '';
	
	const dateObj = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
	
	if (isNaN(dateObj.getTime())) {
		return '';
	}
	
	return dateObj.toLocaleString('cs-CZ', {
		day: 'numeric',
		month: 'numeric',  
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

/**
 * Formátuje pouze čas
 * @param time - čas jako string (HH:MM:SS nebo HH:MM) nebo Date objekt
 * @returns čas ve formátu "14:30"
 */
export function formatTime(time: string | Date): string {
	if (!time) return '';
	
	if (typeof time === 'string') {
		// Pokud je to string ve formátu HH:MM:SS nebo HH:MM
		const [hours, minutes] = time.split(':');
		return `${hours}:${minutes}`;
	}
	
	// Pokud je to Date objekt
	return time.toLocaleTimeString('cs-CZ', {
		hour: '2-digit',
		minute: '2-digit'
	});
}

/**
 * Formátuje datum pro Supabase (ISO formát)
 * @param inputDate - datum jako string ve formátu YYYY-MM-DD
 * @returns datum ve formátu ISO string
 */
export function formatDateForSupabase(inputDate: string): string {
	if (!inputDate) return '';
	
	const date = new Date(inputDate);
	if (isNaN(date.getTime())) {
		return '';
	}
	
	return date.toISOString();
}

/**
 * Formátuje Date objekt do ISO formátu pro Supabase
 * @param date - Date objekt
 * @returns datum ve formátu ISO string
 */
export function formatDateToISO(date: Date): string {
	return date.toISOString().split('T')[0];
}

/**
 * Formátuje rozsah datumů pro zobrazení
 * @param start - počáteční datum
 * @param end - koncové datum
 * @returns formátovaný rozsah datumů
 */
export function formatDateRange(start: Date, end: Date): string {
	const formatOptions: Intl.DateTimeFormatOptions = {
		day: '2-digit',
		month: 'long',
		year: 'numeric'
	};

	if (start.toDateString() === end.toDateString()) {
		return start.toLocaleDateString('cs-CZ', formatOptions);
	} else if (
		start.getMonth() === end.getMonth() &&
		start.getFullYear() === end.getFullYear()
	) {
		// Stejný měsíc a rok
		return `${start.getDate()} - ${end.toLocaleDateString('cs-CZ', formatOptions)}`;
	} else if (start.getFullYear() === end.getFullYear()) {
		// Stejný rok
		return `${start.toLocaleDateString('cs-CZ', {day: '2-digit', month: 'long'})} - ${end.toLocaleDateString('cs-CZ', formatOptions)}`;
	} else {
		// Různé roky
		return `${start.toLocaleDateString('cs-CZ', formatOptions)} - ${end.toLocaleDateString('cs-CZ', formatOptions)}`;
	}
}

// =============================================================================
// FORMÁTOVÁNÍ CENY A MĚNY
// =============================================================================

/**
 * Formátuje cenu s možností přidat měnu
 * @param price - cena jako číslo
 * @param includeCurrency - zda zahrnout měnu (výchozí: false)
 * @param currencyCode - kód měny (výchozí: 'CZK')
 * @returns formátovaná cena
 */
export function formatPrice(price: number, includeCurrency: boolean = false, currencyCode: string = 'CZK'): string {
	if (typeof price !== 'number' || isNaN(price)) {
		return '0';
	}
	
	const formattedNumber = new Intl.NumberFormat('cs-CZ').format(price);
	
	if (includeCurrency) {
		// Jednoduché formátování s pevně definovanými symboly
		const currencySymbols: { [key: string]: string } = {
			'CZK': 'Kč',
			'EUR': '€',
			'USD': '$'
		};
		
		const symbol = currencySymbols[currencyCode] || currencyCode;
		return `${formattedNumber} ${symbol}`;
	}
	
	return formattedNumber;
}

/**
 * Formátuje cenu jako měnu (s symbolem měny)
 * @param value - hodnota jako číslo
 * @param currencyCode - kód měny (výchozí: 'CZK')
 * @returns formátovaná cena s symbolem měny
 */
export function formatCurrency(value: number, currencyCode: string = 'CZK'): string {
	if (typeof value !== 'number' || isNaN(value)) {
		return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: currencyCode }).format(0);
	}
	
	return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: currencyCode }).format(value);
}

// =============================================================================
// FORMÁTOVÁNÍ ČÍSEL
// =============================================================================

/**
 * Formátuje číslo do českého formátu
 * @param number - číslo k formátování
 * @returns formátované číslo
 */
export function formatNumber(number: number): string {
	if (typeof number !== 'number' || isNaN(number)) {
		return '0';
	}
	
	return new Intl.NumberFormat('cs-CZ').format(number);
}

// =============================================================================
// SPECIÁLNÍ FORMÁTOVACÍ FUNKCE PRO APLIKACI
// =============================================================================

/**
 * Formátuje název položky objednávky pro Fakturoid
 */
export function formatOrderItemName(item: any): string {
	// Zkusíme získat datum z různých možných míst ve struktuře
	let menuDate = null;
	
	// Priorita: menu_id > menu_version_id > jiné možnosti
	if (item.variant_id?.menu_id?.date) {
		menuDate = item.variant_id.menu_id.date;
	} else if (item.variant_id?.menu_version_id?.date) {
		menuDate = item.variant_id.menu_version_id.date;
	} else if (item.menuVersionData?.date) {
		menuDate = item.menuVersionData.date;
	}
	
	// Získání čísla varianty
	const variantNumber = item.variant_id?.variant_number || item.variant?.variant_number;
	
	// Formátování data do českého formátu
	let formattedDate = '';
	if (menuDate) {
		try {
			const date = new Date(menuDate);
			if (!isNaN(date.getTime())) {
				formattedDate = date.toLocaleDateString('cs-CZ', {
					day: 'numeric',
					month: 'numeric', 
					year: 'numeric'
				});
			}
		} catch (e) {
			console.warn('Chyba při formátování data:', e);
		}
	}
	
	// Sestavení názvu
	let itemName = '';
	
	if (formattedDate) {
		itemName += `${formattedDate} `;
	}
	
	if (variantNumber) {
		itemName += `Menu ${variantNumber}`;
	} else {
		itemName += 'Menu';
	}
	
	return itemName || 'Položka menu';
}

// =============================================================================
// POMOCNÉ FUNKCE PRO DATOVÉ FORMÁTY
// =============================================================================

/**
 * Vytváří formátovač pro datum a čas s vlastními možnostmi
 * @param locale - lokalizace (výchozí: 'cs-CZ')
 * @param options - možnosti formátování
 * @returns formátovač
 */
export function createDateTimeFormatter(
	locale: string = 'cs-CZ', 
	options: Intl.DateTimeFormatOptions = {}
): Intl.DateTimeFormat {
	return new Intl.DateTimeFormat(locale, options);
}

/**
 * Ověřuje, zda je datum validní
 * @param date - datum k ověření
 * @returns true pokud je datum validní
 */
export function isValidDate(date: any): boolean {
	if (!date) return false;
	
	const dateObj = typeof date === 'string' ? new Date(date) : date;
	return dateObj instanceof Date && !isNaN(dateObj.getTime());
}

// =============================================================================
// KONSTANTY PRO FORMÁTOVÁNÍ
// =============================================================================

export const CZECH_DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
	year: 'numeric',
	month: 'long',
	day: 'numeric'
};

export const CZECH_DATE_SHORT_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
	day: '2-digit',
	month: '2-digit',
	year: 'numeric'
};

export const CZECH_DATETIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
	year: 'numeric',
	month: 'long',
	day: 'numeric',
	hour: '2-digit',
	minute: '2-digit'
};

export const CZECH_DATETIME_SHORT_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
	day: '2-digit',
	month: '2-digit',
	year: 'numeric',
	hour: '2-digit',
	minute: '2-digit'
};

export const CZECH_TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
	hour: '2-digit',
	minute: '2-digit'
};

export const CZECH_CURRENCY_FORMAT_OPTIONS: Intl.NumberFormatOptions = {
	style: 'currency',
	currency: 'CZK'
};

// =============================================================================
// EXPORTY PRO ZPĚTNOU KOMPATIBILITU
// =============================================================================

// Aliasy pro zpětnou kompatibilitu s existujícím kódem
export const formatDate = formatDateToCzech;
export const formatDateTime = formatDateTimeToCzech; 