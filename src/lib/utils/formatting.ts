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
 * Formátuje datum pouze den a měsíc
 * @param date - datum jako string nebo Date objekt
 * @returns datum ve formátu "2.7."
 */
export function formatDateDayMonth(date: string | Date): string {
	if (!date) return '';
	
	const dateObj = typeof date === 'string' ? new Date(date) : date;
	
	if (isNaN(dateObj.getTime())) {
		return '';
	}
	
	return dateObj.toLocaleDateString('cs-CZ', {
		day: 'numeric',
		month: 'numeric'
	}).replace(/\s/g, '');
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
 * Upraveno pro použití aktuálních dat menu místo zastaralých
 */
export function formatOrderItemName(item: any): string {
	// Priorita: aktuální data > zastaralá data
	let menuDate = null;
	let variantDescription = '';
	
	// 1. Priorita: aktuální data z menuVersionData a currentVariantData
	if (item.menuVersionData?.date) {
		menuDate = item.menuVersionData.date;
	}
	
	if (item.currentVariantData?.description) {
		variantDescription = item.currentVariantData.description;
	}
	
	// 2. Fallback: zastaralá data z variant_id
	if (!menuDate) {
		if (item.variant_id?.menu_id?.date) {
			menuDate = item.variant_id.menu_id.date;
		} else if (item.variant_id?.menu_version_id?.date) {
			menuDate = item.variant_id.menu_version_id.date;
		}
	}
	
	if (!variantDescription) {
		variantDescription = item.variant_id?.description || item.variant?.description || '';
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
	
	// Sestavení názvu - použijeme aktuální popis pokud je dostupný
	let itemName = '';
	
	if (formattedDate) {
		itemName += `${formattedDate} `;
	}
	
	if (variantNumber) {
		itemName += `Menu ${variantNumber}`;
	} else {
		itemName += 'Menu';
	}
	
	// Přidáme aktuální popis varianty pokud je dostupný
	if (variantDescription) {
		itemName += ` - ${variantDescription}`;
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