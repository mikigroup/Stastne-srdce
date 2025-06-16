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
	let currencies = settings?.currencies;
	
	// Nejprve zkusíme najít měny v obecných nastaveních
	if (!currencies && settings?.general?.currencies) {
		currencies = settings.general.currencies;
	}
	
	// Pak zkusíme najít měny v eshop nastaveních (zpětná kompatibilita)
	if (!currencies && settings?.eshop?.currencies) {
		currencies = settings.eshop.currencies;
	}
	
	if (!currencies) {
		// Fallback pro formátování, když nejsou k dispozici nastavení
		return new Intl.NumberFormat('cs-CZ', { 
			style: 'currency', 
			currency: currencyCode 
		}).format(price);
	}
	
	const currency = currencies.find((curr: any) => curr.code === currencyCode);
	if (!currency) {
		return new Intl.NumberFormat('cs-CZ', { 
			style: 'currency', 
			currency: currencyCode 
		}).format(price);
	}
	
	// Vlastní formátování s uživatelsky nastaveným symbolem
	return `${new Intl.NumberFormat('cs-CZ').format(price)} ${currency.symbol}`;
} 