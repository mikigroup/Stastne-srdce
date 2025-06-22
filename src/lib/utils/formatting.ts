/**
 * Formátuje datum z formátu YYYY-MM-DD na DD.MM.YYYY
 */
export function formatDateToCzech(date: string): string {
	if (!date) return "";
	const parts = date.split("-");
	if (parts.length !== 3) {
		return date;
	}
	const [year, month, day] = parts;
	return `${day}.${month}.${year}`;
}

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

/**
 * Formátuje cenu podle zadané měny
 */
export function formatPrice(price: number, currencyCode: string = 'CZK', settings?: any): string {
	// Jednoduché formátování s pevně definovanými symboly
	const currencySymbols: { [key: string]: string } = {
		'CZK': 'Kč',
		'EUR': '€',
		'USD': '$'
	};
	
	const symbol = currencySymbols[currencyCode] || currencyCode;
	
	// Použijeme standard Intl.NumberFormat pro formátování čísla
	const formattedNumber = new Intl.NumberFormat('cs-CZ').format(price);
	
	return `${formattedNumber} ${symbol}`;
} 