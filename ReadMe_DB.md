
# Dokumentace k projektu objednávkového systému

Tento dokument popisuje architekturu, funkce a instrukce k použití objednávkového systému vyvinutého ve frameworku SvelteKit s TypeScriptem, s využitím Supabase pro databázi a autentizaci a Vercelu pro deploy a build.

## Architektura

Aplikace je postavena na frameworku SvelteKit a napsána v TypeScriptu. Využívá Supabase pro backend služby - databázi PostgreSQL a autentizaci uživatelů. Produkční verze je nasazena a buildována na platformě Vercel.

Databázové schéma v Supabase obsahuje následující tabulky:

-   `profiles` - uživatelské účty
-   `customers` - zákaznické profily s doručovacími a fakturačními údaji
-   `menus` - nabízené pokrmy
-   `menu_variants` - varianty pokrmů
-   `orders` - objednávky
-   `order_items` - jednotlivé položky objednávky
-   `allergens`, `ingredients` - alergeny a ingredience pokrmů

Autentizace je řešena pomocí vestavěných funkcí Supabase s využitím e-mailu a hesla. Autorizace ověřuje role uživatelů (zákazník/administrátor) a podle toho zpřístupňuje příslušné funkce a data.

## Datové objekty

### Profile

-   `id` (uuid) - unikátní identifikátor profilu
-   `first_name` (text) - křestní jméno uživatele
-   `last_name` (text) - příjmení uživatele
-   `email` (text) - e-mail uživatele
-   `telephone` (text) - telefonní číslo
-   `street`, `street_number`, `city`, `zip_code` (text) - adresa
-   `ico`, `dic`, `company`, `website` (text) - firemní údaje
-   `user_role` (text) - role uživatele v systému
-   `created_at`, `updated_at` (timestamp) - časy vytvoření a poslední úpravy
-   `table_settings_*` (jsonb) - uživatelská nastavení tabulek v administraci

Profil reprezentuje uživatelský účet v systému. Obsahuje osobní údaje, adresu, případně firemní údaje. Role určuje oprávnění uživatele (administrátor, zákazník). Nastavení tabulek se ukládá v JSON formátu.

### Customer

-   `id` (uuid) - unikátní identifikátor zákazníka
-   `first_name`, `last_name`, `email`, `telephone`, `street`, `street_number`, `city`, `zip_code` - osobní a kontaktní údaje, stejné jako v profilu
-   `user_role` (text) - role zákazníka

Zákaznický profil obsahuje údaje potřebné pro doručení objednávek a komunikaci se zákazníkem. Většina údajů je stejná jako v uživatelském profilu, aby se předešlo nekonzistencím.

### Menu

-   `id` (uuid) - unikátní identifikátor pokrmu
-   `date` (date) - datum, pro které pokrm platí
-   `soup` (text) - název polévky
-   `active` (boolean) - zda je pokrm aktivní
-   `notes` (text) - interní poznámky
-   `type`, `nutri` (text) - typ a nutriční hodnoty pokrmu
-   `created_at`, `updated_at` (timestamp) - časy vytvoření a poslední úpravy
-   `variants` (pole `menu_variants`) - pole s variantami pokrmu

Nabízený pokrm obsahuje základní údaje společné pro všechny varianty - datum, polévku, aktivitu, poznámky atd. Konkrétní varianty se načítají ze související tabulky `menu_variants`.

### Menu Variant

-   `id` (uuid) - unikátní identifikátor varianty
-   `menu_id` (uuid) - cizí klíč propojující variantu s pokrmem
-   `variant_number` (text) - číslo varianty
-   `description` (text) - popis varianty
-   `price` (numeric) - cena varianty
-   `allergens`, `ingredients` (pole `allergens`/`ingredients`) - pole s alergeny a ingrediencemi varianty

Varianta pokrmu představuje konkrétní možnost výběru s vlastním popisem a cenou. Varianty se vážou na pokrm přes cizí klíč `menu_id`.

### Order

-   `id` (uuid) - unikátní identifikátor objednávky
-   `user_id` (uuid) - cizí klíč propojující objednávku s uživatelem
-   `order_number` (int) - číslo objednávky
-   `date` (date) - datum objednávky
-   `total_price`, `total_pieces` (int) - celková cena a počet kusů
-   `customer_*` (text) - fakturační údaje zákazníka
-   `delivery_*` (text) - doručovací údaje
-   `shipping_method`, `pay_method`, `currency` (text) - způsob dopravy a platby, měna
-   `state` (text) - stav objednávky (přijata, expedována, ...)
-   `pay_state` (boolean) - zda je objednávka uhrazena
-   `note` (text) - poznámka k objednávce
-   `created_at`, `updated_at` (timestamp) - časy vytvoření a poslední úpravy
-   `order_items` (pole `order_items`) - pole s položkami objednávky

Objednávka sdružuje všechny údaje k jedné zákaznické objednávce - fakturační a doručovací údaje, zvolenou dopravu a platbu, stav objednávky, poznámku a seznam objednaných položek.

### Order Item

-   `id` (uuid) - unikátní identifikátor položky
-   `order_id` (uuid) - cizí klíč propojující položku s objednávkou
-   `variant_id` (uuid) - cizí klíč na objednanou variantu pokrmu
-   `quantity` (int) - množství objednaných kusů
-   `price` (numeric) - jednotková cena položky

Položka objednávky představuje jeden řádek objednávky - obsahuje odkaz na objednanou variantu pokrmu, počet kusů a jednotkovou cenu.

### Allergens

-   `id` (int) - unikátní identifikátor alergenu
-   `name` (text) - název alergenu

### Ingredients

-   `id` (int) - unikátní identifikátor ingredience
-   `name` - název ingredience

Alergeny a ingredience představují číselníky (výčtové typy) se seznamem alergenů a ingrediencí, které se používají u pokrmů a jejich variant. Propojení je řešeno přes vazební tabulky `menu_allergens`, `menu_ingredients`, `variant_allergens` a `variant_ingredients`.

## Funkce systému

### Katalog a objednávání

-   Zákazníci si mohou prohlížet nabídku pokrmů, filtrovat a vyhledávat.
-   Pokrmy mohou přidávat do košíku a měnit počet kusů.
-   V košíku vidí souhrn položek a celkovou cenu.
-   Před odesláním objednávky musí být přihlášeni a zadat doručovací údaje.
-   Obdrží e-mailové potvrzení objednávky.

### Správa účtu

-   Zákazníci mohou upravovat své kontaktní a doručovací údaje.
-   Vidí přehled svých objednávek a jejich stavy.

### Administrace

-   Administrátoři spravují nabídku pokrmů a jejich varianty, ceny, alergeny apod.
-   Mají přehled všech objednávek s možností filtrování a řazení.
-   Mohou měnit stavy objednávek a přidávat interní poznámky.
-   Spravují zákaznické účty.

## Instrukce k použití

### Instalace a spuštění

1.  Naklonujte repozitář projektu.
2.  Nainstalujte závislosti pomocí `npm install`.
3.  Vytvořte soubor `.env` a nastavte v něm proměnné podle vzoru v `.env.example`.
4.  Spusťte vývojový server pomocí `npm run dev`.
5.  Otevřete aplikaci na `http://localhost:5173`.

### Nasazení na Vercel

1.  Zaregistrujte se na Vercel.com a propojte s vaším repozitářem.
2.  V nastavení projektu na Vercelu nastavte ENV proměnné pro přístup k Supabase.
3.  Nastavte Vercel pro automatické buildy a deploye při pushnutí do větve `main`.

## Závěr

Tento objednávkový systém umožňuje efektivní prodej a distribuci pokrmů s důrazem na přívětivé uživatelské prostředí. Poskytuje nástroje pro kompletní správu celého procesu a je snadno rozšiřitelný o další funkce dle potřeb provozovatele. V případě dotazů nebo problémů kontaktujte vývojový tým info@malyleo.cz.

Powered - https://stackedit.io/app#
