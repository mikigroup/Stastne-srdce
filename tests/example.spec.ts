import { test, expect } from "@playwright/test";
import { fakerCS_CZ as faker } from "@faker-js/faker";

/**
 * 1. AUTENTIZACE
 * Nejkritičtější testy, které ověří základní fungování přihlášení a registrace
 */
test.describe("Autentizace", () => {
	// Testovací data
	/*	const testUser = {
			email: `test-${faker.string.uuid()}mikigroup@seznam.cz`,
			password: "Test@123456",
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName()
		};*/

	/*test("Registrace nového uživatele", async ({ page }) => {
		await page.goto("/signup");
		await page.fill('input[name="email"]', testUser.email);
		await page.fill('input[name="password"]', testUser.password);
		await page.fill('input[name="repassword"]', testUser.password);

		// Kontrola souhlasu s podmínkami, pokud existuje
		const termsCheckbox = await page.$('input[type="checkbox"][required]');
		if (termsCheckbox) {
			await termsCheckbox.check();
		}

		await page.click('button[type="submit"]');

		// Ověření úspěšné registrace
		await expect(
			page.locator('div:has-text("Na emailovou adresu")')
		).toBeVisible();
	});*/

	test("Přihlášení existujícího uživatele", async ({ page }) => {
		// Předpokládáme, že testovací uživatel již existuje v databázi
		const existingUser = {
			email: "mikigroup@seznam.cz",
			password: "jjjjjj"
		};

		await page.goto("http://localhost:5173/login");

		await page.focus('input[name="email"]');
		await page.keyboard.press("Control+A");
		await page.keyboard.press("Delete");

		await page.fill('input[name="email"]', existingUser.email);
		await page.fill('input[name="password"]', existingUser.password);
		await page.click('button[type="submit"]');

		await page.waitForURL("http://localhost:5173/obedy");

		await page.click("#signOut");
		await page.waitForURL("http://localhost:5173/");
	});

	/*test("Obnovení zapomenutého hesla", async ({ page }) => {
		await page.goto("/forgot");
		await page.fill('input[name="email"]', "existing-user@example.com");
		await page.click('button[type="submit"]');

		// Ověření odeslání instrukce pro obnovu hesla
		await expect(
			page.locator(
				'div:has-text("Do emailové schránky jsme ti poslali instrukce")'
			)
		).toBeVisible();
	});
});*/

	/**
	 * 2. OBJEDNÁVKA JÍDLA
	 * Klíčová funkce aplikace - objednávání jídla
	 */
	/*test.describe("Objednávka jídla", () => {
	// Před testy se přihlásíme
	test.beforeEach(async ({ page }) => {
		// Přihlášení před každým testem
		await page.goto("/login");
		await page.fill('input[name="email"]', "existing-user@example.com");
		await page.fill('input[name="password"]', "Password123");
		await page.click('button[type="submit"]');
		await page.waitForURL("/!*");
	});

	test("Procházení jídelníčku", async ({ page }) => {
		await page.goto("/obedy");

		// Kontrola, že se jídelníček načetl
		await expect(page.locator('h1:has-text("Obědy")')).toBeVisible();

		// Kontrola přepínání týdnů
		await page.click('button:has-text("2. týden")');

		// Ověření, že se zobrazilo menu pro daný týden
		await expect(page.locator(".mt-10")).toBeVisible();
	});

	test("Přidání jídla do košíku", async ({ page }) => {
		await page.goto("/obedy");

		// Počkáme na načtení prvního menu
		await page.waitForSelector(".border.rounded-2xl.p-5");

		// Klikneme na tlačítko "Do košíku" u prvního jídla
		await page.click('.border.rounded-2xl.p-5 >> text="Do košíku"');

		// Ověření, že jídlo bylo přidáno do košíku - kontrola ikony košíku
		const cartCounter = page.locator('a[href="/kosik"] >> text=/\\d+/');
		await expect(cartCounter).toBeVisible();
		await expect(cartCounter).not.toHaveText("0");
	});

	test("Dokončení objednávky", async ({ page }) => {
		// Nejprve přidáme jídlo do košíku
		await page.goto("/obedy");
		await page.waitForSelector(".border.rounded-2xl.p-5");
		await page.click('.border.rounded-2xl.p-5 >> text="Do košíku"');

		// Přejdeme do košíku
		await page.click('a[href="/kosik"]');

		// Ověříme, že košík obsahuje vybrané jídlo
		await expect(page.locator(".menuWrap")).toBeVisible();

		// Přidáme poznámku k objednávce
		await page.fill('textarea[name="note"]', "Testovací poznámka k objednávce");

		// Pokračujeme v objednávce
		await page.click('button:has-text("Potvrzení košíku")');

		// V modálním okně potvrdíme objednávku
		await page.click('input[formaction="?/sendOrder"]');

		// Ověření úspěšné objednávky - přesměrování na stránku s poděkováním
		await page.waitForURL("/thankyou*");
		await expect(
			page.locator('h1:has-text("Děkujeme za objednávku")')
		).toBeVisible();
	});
});

/!**
 * 3. SPRÁVA PROFILU
 * Testy pro úpravu uživatelského profilu
 *!/
test.describe("Správa profilu", () => {
	// Před testy se přihlásíme
	test.beforeEach(async ({ page }) => {
		await page.goto("/login");
		await page.fill('input[name="email"]', "existing-user@example.com");
		await page.fill('input[name="password"]', "Password123");
		await page.click('button[type="submit"]');
		await page.waitForURL("/!*");
	});

	test("Úprava uživatelského profilu", async ({ page }) => {
		await page.goto("/profile");

		// Kontrola, že se profil načetl
		await expect(page.locator('h1:has-text("Profil účtu")')).toBeVisible();

		// Upravíme jméno
		const newFirstName = faker.person.firstName();
		await page.fill('input[name="first_name"]', newFirstName);

		// Uložíme změny
		await page.click('button:has-text("Uložit")');

		// Ověření, že změny byly uloženy
		await expect(
			page.locator('div:has-text("Profil byl úspěšně aktualizován")')
		).toBeVisible();

		// Obnovíme stránku a zkontrolujeme, že změny přetrvaly
		await page.reload();
		await expect(page.locator('input[name="first_name"]')).toHaveValue(
			newFirstName
		);
	});

	test("Zobrazení historie objednávek", async ({ page }) => {
		await page.goto("/profile");

		// Kontrola, že se zobrazují objednávky
		await expect(page.locator('h1:has-text("Moje objednávky")')).toBeVisible();

		// Pokud existují objednávky, kontrola jejich zobrazení
		const hasOrders = await page.isVisible(
			".rounded-xl.overflow-hidden.shadow.border"
		);

		if (hasOrders) {
			// Kontrola detailu objednávky
			await page.click(".flex.justify-between.items-center.p-4");
			await expect(page.locator(".border-t.border-gray-100.p-5")).toBeVisible();
		}
	});
});

/!**
 * 4. ADMINISTRACE (pro admin uživatele)
 * Testy pro administrační rozhraní
 *!/
test.describe("Administrace", () => {
	// Před testy se přihlásíme jako admin
	test.beforeEach(async ({ page }) => {
		await page.goto("/admin/signin");
		await page.fill('input[name="email"]', "admin@example.com");
		await page.fill('input[name="password"]', "AdminPassword123");
		await page.click('button[type="submit"]');
		await page.waitForURL("/admin*");
	});

	test("Správa jídelníčku", async ({ page }) => {
		await page.goto("/admin/menu");

		// Kontrola, že se stránka správy jídelníčku načetla
		await expect(page.locator('title:has-text("LEO - Menu")')).toBeVisible();

		// Vytvoření nového menu
		await page.click('button:has-text("Vytvořit")');
		await page.waitForURL("/admin/menu/newmenu");

		// Vyplníme základní údaje nového menu
		const today = new Date();
		const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

		await page.fill('input[type="date"]', formattedDate);
		await page.fill('input[placeholder*="Polévka"]', "Testovací polévka");

		// Vyplníme varianty menu
		await page.fill(
			'textarea[placeholder*="Menu 1"]',
			"Testovací hlavní chod 1"
		);
		await page.fill('input[type="number"]', "120");

		// Uložíme menu
		await page.click('button:has-text("Vytvořit menu")');

		// Ověříme, že menu bylo vytvořeno - přesměrování na seznam menu
		await page.waitForURL("/admin/menu");

		// Zkontrolujeme, zda je nové menu v seznamu
		await expect(page.locator("text=Testovací polévka")).toBeVisible();
	});

	test("Správa objednávek", async ({ page }) => {
		await page.goto("/admin/order");

		// Kontrola, že se stránka správy objednávek načetla
		await expect(
			page.locator('title:has-text("LEO - Objednávky")')
		).toBeVisible();

		// Otevření detail objednávky (první v seznamu)
		if (await page.isVisible('a:has-text("Upravit")')) {
			await page.click('a:has-text("Upravit")');

			// Kontrola, že se detail objednávky otevřel
			await expect(page.locator('h2:has-text("Objednávka")')).toBeVisible();

			// Změna stavu objednávky
			await page.selectOption(
				'select[bind\\:value="selectedOrderState"]',
				"Expedována"
			);

			// Uložení změn
			await page.click('button:has-text("Uložit změny")');

			// Ověření, že změny byly uloženy
			await expect(
				page.locator('div:has-text("Objednávka byla úspěšně uložena")')
			).toBeVisible();
		}
	});

	test("Správa zákazníků", async ({ page }) => {
		await page.goto("/admin/customer");

		// Kontrola, že se stránka správy zákazníků načetla
		await expect(
			page.locator('title:has-text("LEO - Zákazníci")')
		).toBeVisible();

		// Vyhledání zákazníka
		await page.fill('input[placeholder="Hledat..."]', "test");
		await page.click('button:has-text("Vyhledat")');

		// Kontrola výsledků vyhledávání
		await expect(page.locator("tbody")).toBeVisible();
	});

	test("Správa textů na webu", async ({ page }) => {
		await page.goto("/admin/text");

		// Kontrola, že se stránka správy textů načetla
		await expect(page.locator('title:has-text("Editor textů")')).toBeVisible();

		// Výběr stránky
		await page.selectOption('select[id="page-select"]', "hlavni");

		// Úprava textu
		await page.fill('div[contenteditable="true"]', "Testovací obsah stránky");

		// Uložení změn
		await page.click('button:has-text("Uložit text")');

		// Ověření, že změny byly uloženy
		await expect(
			page.locator('div:has-text("Text byl úspěšně aktualizován")')
		).toBeVisible();
	});
});

/!**
 * 5. INTEGRACE KOMPONENT
 * Testy pro ověření, že jednotlivé komponenty správně spolupracují
 *!/
test.describe("Integrace komponent", () => {
	test("DateRangeSelector funguje správně", async ({ page }) => {
		// Přihlášení jako admin
		await page.goto("/admin/signin");
		await page.fill('input[name="email"]', "admin@example.com");
		await page.fill('input[name="password"]', "AdminPassword123");
		await page.click('button[type="submit"]');
		await page.waitForURL("/admin*");

		// Přejdeme na dashboard, kde je použitý DateRangeSelector
		await page.goto("/admin");

		// Interakce s komponentou DateRangeSelector
		await page.click(".dropdown-hover button");
		await expect(page.locator("ul.dropdown-content")).toBeVisible();

		// Výběr jiného období
		await page.click('a:has-text("Tento týden")');

		// Ověření změny období
		await expect(page.locator("text=Statistiky za období")).toBeVisible();
	});

	test("GDPR banner funguje správně", async ({ page }) => {
		// Nastavíme cookies tak, aby se zobrazil GDPR banner
		await page.context().clearCookies();

		// Navštívíme hlavní stránku
		await page.goto("/");

		// Kontrola, že se zobrazil GDPR banner
		await expect(page.locator(".cookieConsentWrapper")).toBeVisible();

		// Akceptování cookies
		await page.click('button:has-text("Souhlasíš")');

		// Kontrola, že banner zmizel
		await expect(page.locator(".cookieConsentWrapper")).not.toBeVisible();

		// Obnovíme stránku a zkontrolujeme, že se banner už nezobrazuje
		await page.reload();
		await expect(page.locator(".cookieConsentWrapper")).not.toBeVisible();
	});

	test("Košík uchovává položky mezi návštěvami", async ({ page }) => {
		// Přihlášení
		await page.goto("/login");
		await page.fill('input[name="email"]', "existing-user@example.com");
		await page.fill('input[name="password"]', "Password123");
		await page.click('button[type="submit"]');

		// Přidání položky do košíku
		await page.goto("/obedy");
		await page.waitForSelector(".border.rounded-2xl.p-5");
		await page.click('.border.rounded-2xl.p-5 >> text="Do košíku"');

		// Kontrola, že položka byla přidána
		const itemCount = await page.textContent('a[href="/kosik"] >> text=/\\d+/');

		// Přejdeme na jinou stránku
		await page.goto("/");

		// A zpět do jídelníčku
		await page.goto("/obedy");

		// Kontrola, že počet položek v košíku zůstal stejný
		const newItemCount = await page.textContent(
			'a[href="/kosik"] >> text=/\\d+/'
		);
		expect(newItemCount).toBe(itemCount);
	});
});

/!**
 * 6. RESPONZIVITA
 * Ověření, že aplikace správně funguje na různých zařízeních
 *!/
test.describe("Responzivita", () => {
	test("Mobilní zobrazení hlavní stránky", async ({ page }) => {
		// Nastavíme viewport na mobilní rozměry
		await page.setViewportSize({ width: 375, height: 667 });

		await page.goto("/");

		// Kontrola, že se menu zobrazuje jako burger menu
		await expect(
			page.locator("button.flex.items-center.xl\\:hidden")
		).toBeVisible();

		// Otevření mobilního menu
		await page.click("button.flex.items-center.xl\\:hidden");

		// Kontrola, že se zobrazilo mobilní menu
		await expect(page.locator("div[transition\\:slide]")).toBeVisible();
	});

	test("Mobilní zobrazení košíku", async ({ page }) => {
		// Přihlášení
		await page.goto("/login");
		await page.fill('input[name="email"]', "existing-user@example.com");
		await page.fill('input[name="password"]', "Password123");
		await page.click('button[type="submit"]');

		// Nastavíme viewport na mobilní rozměry
		await page.setViewportSize({ width: 375, height: 667 });

		// Přidání položky do košíku
		await page.goto("/obedy");
		await page.waitForSelector(".border.rounded-2xl.p-5");
		await page.click('.border.rounded-2xl.p-5 >> text="Do košíku"');

		// Přejdeme do košíku
		await page.click('a[href="/kosik"]');

		// Kontrola, že se zobrazila mobilní verze košíku
		await expect(page.locator(".md\\:hidden")).toBeVisible();

		// Kontrola, že se nezobrazuje desktopová verze
		await expect(page.locator(".hidden.md\\:grid")).not.toBeVisible();
	}); */
});
