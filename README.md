# 🍽️ Šťastné srdce - Happy heart

Webová aplikace pro správu a objednávání jídel.
Web application for food management and ordering.

## 🛠️ Technologie - Techstack

- Frontend: SvelteKit, TypeScript
- Backend: Supabase
- Styling: TailwindCSS, DaisyUI
- Deployment: Vercel
- Ver. system: GitHub

## 🌟 Klíčové funkce - Key features

- Správa denního menu
- Objednávkový systém pro zákazníky
- Administrační rozhraní pro správu jídel, objednávek a uživatelů
- Responzivní design pro mobilní i desktopové zařízení
- Daily menu management
- Order system for customers
- Administrative interface for managing meals, orders, texts and users
- Responsive design for mobile and desktop devices

## 📄 Popis stránek - Page descriptions

### 1. Úvodní stránka (/)
- Prezentuje hlavní informace o službě
- Obsahuje sekce s popisem nabídky jídel, procesu objednávání a dalších informací
- Responzivní design s použitím Tailwind CSS
- Animované prvky pro lepší uživatelský zážitek

### 2. Jídelníček (/jidelnicek)
- Zobrazuje aktuální denní menu na následující 4 týdny
- Dynamické časové rozmezí:
  - Začátek (startDate):
    - Před 17:00: začíná následující den
    - Po 17:00: začíná o dva dny později
  - Konec (endDate): 27 dní od startDate
- Zobrazení menu:
  - Pouze aktivní menu (active = true)
  - V rozsahu od startDate do endDate
  - Seřazeno vzestupně podle data
- Struktura dat:
  - Menu rozdělena do 4 týdnů
  - Každé menu obsahuje: datum, polévku, varianty hlavních jídel, dodatečné informace
- Uživatelské rozhraní:
  - Zobrazení po týdnech (záložky "1. týden", "2. týden" atd.)
  - Pro každý den: datum, polévka, hlavní jídla s možností přidání do košíku
- Umožňuje filtrování jídel podle různých kritérií (vegetariánské, alergenů atd.)
- Dodatečný obsah specifický pro stránku jídelníčku načítaný z databáze
- Funkčnost pro přihlášené uživatele:
  - Přidávání položek do košíku
  - Zobrazení celkového počtu položek v košíku
  - Přímý přechod do košíku
- Používá komponenty z DaisyUI pro konzistentní vzhled

### 3. Košík (/kosik)
- Zobrazení položek v košíku s detaily (datum, polévka, menu, počet, cena)
- Možnost úpravy množství a odstranění položek z košíku
- Výpočet celkové ceny a počtu kusů
- Responsivní design pro mobilní a desktopové zobrazení
- Autentizace a autorizace:
  - Kontrola přihlášení uživatele pro přístup ke košíku
  - Propojení s uživatelským účtem pro získání informací o zákazníkovi
- Zpracování objednávky:
  - Vytvoření objednávky v databázi (Supabase)
  - Ukládání detailů objednávky včetně položek, cen a množství
  - Propojení objednávky s uživatelským účtem
- Bezpečnost:
  - Ověření session uživatele před zpracováním objednávky
  - Kontrola prázdného košíku před vytvořením objednávky
- Uživatelské rozhraní:
  - Modální okno pro potvrzení objednávky
  - Možnost přidání poznámky k objednávce
  - Odkaz na uživatelský profil pro kontrolu/úpravu údajů
- Integrace s databází:
  - Použití Supabase pro ukládání a načítání dat
  - Práce s tabulkami customers, orders a order_items
- Stavová logika:
  - Použití Svelte stores pro správu stavu košíku
  - Aktualizace celkové ceny a počtu kusů při změnách v košíku
- Chybové stavy:
  - Ošetření chybových stavů při zpracování objednávky
  - Zobrazení chybových hlášek uživateli
- Výkonnostní optimalizace:
  - Lazy loading komponent
  - Efektivní aktualizace UI při změnách v košíku
### 4. Kontakt (/kontakt)
- Kontaktní formulář:
  - Pole pro zadání emailu, jména, telefonu a zprávy
  - Validace vstupních polí (required atributy)
  - Stylizace pomocí Tailwind CSS
- Google reCAPTCHA integrace:
  - Použití reCAPTCHA v3 pro ochranu proti spamu
  - Asynchronní načítání reCAPTCHA skriptu
  - Automatické zpracování reCAPTCHA tokenu před odesláním formuláře
- Zpracování formuláře na serveru:
  - Použití SvelteKit actions pro zpracování POST požadavku
  - Extrakce dat z formuláře pomocí FormData API
- Emailová služba:
  - Využití Nodemailer pro odesílání emailů
  - Konfigurace SMTP pro službu Seznam.cz
  - Odesílání strukturovaného emailu s informacemi z formuláře
- Chybové stavy a zpětná vazba:
  - Zobrazení chybových hlášek uživateli při neúspěšném odeslání
  - Potvrzení úspěšného odeslání formuláře
- Responsivní design:
  - Přizpůsobení layoutu pro mobilní i desktopová zařízení
  - Využití CSS grid a flexbox pro layout
- Animace:
  - Použití animate.css pro animaci nadpisu
- Mapová integrace:
  - Vložení Google Maps iframe s adresou firmy
- Kontaktní informace:
  - Zobrazení firemních údajů včetně adresy, IČO, DIČ a kontaktních údajů
- Bezpečnost:
  - Ochrana proti CSRF útokům pomocí SvelteKit
  - Použití reCAPTCHA pro prevenci automatizovaného spamu
- Výkonnostní optimalizace:
  - Lazy loading pro Google Maps iframe
- Přístupnost:
  - Použití sémantických HTML elementů
  - Popisky (labels) pro formulářové prvky

### 5. Administrační rozhraní (/admin)
- Zabezpečený přístup pouze pro autorizované uživatele
- Správa menu (/admin/menu)
  - CRUD operace pro položky menu
  - Možnost nastavení variant, alergenů a ingrediencí
  - Používá TanStack Table pro pokročilé filtrování a řazení
- Správa objednávek (/admin/order)
  - Přehled všech objednávek s možností filtrace
  - Detail objednávky s možností změny stavu
- Správa zákazníků (/admin/customer)
  - Seznam registrovaných zákazníků
  - Možnost úpravy údajů a nastavení oprávnění

### 6. Profil uživatele (/profile)
- Autentizace a autorizace:
  - Kontrola přihlášení uživatele před načtením stránky
  - Přesměrování na hlavní stránku, pokud uživatel není přihlášen
- Zobrazení a úprava profilu:
  - Načtení uživatelského profilu z databáze Supabase
  - Formulář pro editaci osobních údajů (jméno, příjmení, telefon, adresa atd.)
  - Možnost rozšířeného zobrazení pro dodatečné informace (IČO, DIČ, firma)
- Zobrazení objednávek:
  - Načtení objednávek uživatele z databáze Supabase
  - Řazení objednávek od nejnovějších
  - Detailní zobrazení položek objednávky včetně menu a variant
- Interaktivní UI:
  - Možnost rozbalení/sbalení detailů objednávky
  - Animace při interakci s UI prvky
  - Responsivní design pro různé velikosti obrazovek
- Formulářové zpracování:
  - Využití SvelteKit actions pro zpracování formuláře
  - Ochrana proti CSRF útokům
  - Validace vstupních dat na straně serveru
- Stavová logika:
  - Použití Svelte stores pro správu stavu formuláře
  - Reaktivní aktualizace UI při změnách dat
- Optimalizace výkonu:
  - Lazy loading komponent
  - Efektivní aktualizace DOM při změnách dat
- Zpracování chyb:
  - Logování chyb při načítání dat z databáze
  - Zobrazení chybových hlášek uživateli při neúspěšné aktualizaci profilu
- Datová struktura:
  - Komplexní dotazy do databáze pro získání souvisejících dat (objednávky, položky objednávek, menu)
  - Zpracování a strukturování dat pro efektivní zobrazení (např. seskupení položek objednávky podle data)
- Bezpečnost:
  - Použití prepared statements pro databázové dotazy
  - Ověření identity uživatele před provedením změn v profilu
- UX vylepšení:
  - Formátování dat (např. datum objednávky) pro lepší čitelnost
  - Přehledné zobrazení historie objednávek s možností zobrazení detailů

### 7. Přihlášení a registrace (/login, /signup)
- Implementace autentizace pomocí Supabase
- Ověření emailu při registraci
- Možnost resetování hesla

## 🔧 Společné prvky

- Konzistentní navigace s responzivním menu
- Footer s důležitými odkazy a informacemi
- Optimalizace pro výkon a SEO
- Implementace správy stavu pomocí SvelteKit stores
- Typově bezpečný kód díky TypeScriptu

Projekt využívá pokročilé funkce SvelteKitu jako server-side rendering, API routes pro backend logiku a layout systém pro konzistentní strukturu stránek.

## 📫 Kontakt

Pro více informací o projektu mě kontaktujte na info@malyleo.cz.

## 🤝 Přispívání

Vítáme příspěvky! Pokud máte nápady na vylepšení nebo jste našli chybu, neváhejte otevřít issue nebo pull request.

## 📚 Další informace

Table UI interface for items pages: https://tanstack.com/table/latest
