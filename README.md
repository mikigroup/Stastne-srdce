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
 
#### 5.1 Správa zákazníků (/admin/customer)
- Správa zákazníků:
  * Zobrazení seznamu zákazníků s možností stránkování
  * Vyhledávání zákazníků podle různých kritérií (jméno, příjmení, email, telefon, adresa)
  * Řazení zákazníků podle data registrace (od nejnovějších)

- Paginace:
  * Implementace stránkování pro efektivní zobrazení velkého množství dat
  * Nastavitelný počet položek na stránku (aktuálně 20)

- Vyhledávání:
  * Komplexní vyhledávání napříč několika poli zákazníka
  * Case-insensitive vyhledávání s použitím ILIKE

- Integrace s Supabase:
  * Využití Supabase pro dotazování a filtrování dat
  * Efektivní použití range pro stránkování

- Uživatelské nastavení:
  * Ukládání nastavení tabulky pro každého uživatele
  * Možnost přizpůsobení zobrazení sloupců

- Statistiky:
  * Zobrazení celkového počtu zákazníků
  * Informace o aktuální stránce a celkovém počtu stránek

- Ošetření chyb:
  * Logování chyb při načítání dat
  * Propagace chyb pro další zpracování

- Detaily zákazníka:
  * Možnost zobrazení a editace detailů jednotlivých zákazníků
  * Načítání kompletních informací o zákazníkovi

- Vytvoření nového zákazníka:
  * Samostatná sekce pro přidání nového zákazníka

- Bezpečnost:
  * Kontrola přihlášení uživatele před načtením dat
  * Omezení přístupu k citlivým datům

- Výkon:
  * Optimalizované dotazy pro rychlé načítání dat
  * Použití count pro efektivní získání celkového počtu záznamů

- Flexibilita:
  * Možnost snadného rozšíření o další funkce správy zákazníků
  * Struktura kódu umožňující snadnou údržbu a rozšiřitelnost

Tato sekce poskytuje komplexní nástroje pro správu zákazníků v admin rozhraní, s důrazem na uživatelskou přívětivost, výkon a bezpečnost. Implementace zahrnuje pokročilé funkce vyhledávání, stránkování a přizpůsobení, což umožňuje efektivní správu i velkého počtu zákazníků.

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
- Registrace uživatele:
  - Formulář pro vytvoření nového účtu s polemi pro email a heslo
  - Validace shody hesla a jeho potvrzení
  - Integrace s Supabase pro registraci nového uživatele
- Sociální přihlášení:
  - Možnost registrace pomocí Google účtu
  - Implementace OAuth flow pro Google
- Bezpečnost:
  - Minimální délka hesla (6 znaků)
  - Hashování hesla před uložením do databáze (zajištěno Supabase)
  - Použití HTTPS pro zabezpečený přenos dat
- Uživatelské rozhraní:
  - Responsivní design s využitím Tailwind CSS
  - Vizuální feedback pro uživatele (ikony, stínování)
  - Indikace načítání během procesu registrace
- Zpracování formuláře:
  - Využití SvelteKit actions pro zpracování formuláře na serveru
  - Ochrana proti CSRF útokům
- Ošetření chyb:
  - Zobrazení chybových hlášek při neúspěšné registraci
  - Ošetření případu, kdy je email již registrován
- Potvrzení emailu:
  - Odeslání potvrzovacího emailu po úspěšné registraci
  - Informace pro uživatele o nutnosti potvrdit email
- Uživatelské role:
  - Přiřazení výchozí role "customer" novému uživateli
- Navigace:
  - Odkaz na přihlašovací stránku pro existující uživatele
- SEO optimalizace:
  - Nastavení title a meta description pro stránku
- Přístupnost:
  - Použití sémantických HTML elementů
  - Jasné popisky pro vstupní pole
- Integrace s backend službami:
  - Využití Supabase pro autentizaci a správu uživatelů
- Validace vstupu:
  - Kontrola formátu emailu pomocí HTML5 pattern atributu
  - Serverová validace shody hesel
- Logování:
  - Konzolové logování pro debugování (může být odstraněno v produkci)

### 8. Resetování hesla (/reset)
- Změna hesla:
  - Formulář pro zadání nového hesla
  - Validace shody nového hesla a jeho potvrzení
  - Integrace s Supabase pro aktualizaci hesla uživatele
- Bezpečnost:
  - Minimální délka hesla (6 znaků)
  - Kontrola, zda nové heslo není stejné jako staré
  - Použití HTTPS pro zabezpečený přenos dat
- Uživatelské rozhraní:
  - Responsivní design s využitím Tailwind CSS
  - Vizuální feedback pro uživatele (ikona zámku, stínování)
  - Tlačítko pro odeslání formuláře s indikací načítání
- Zpracování formuláře:
  - Využití SvelteKit actions pro zpracování formuláře na serveru
  - Ochrana proti CSRF útokům
- Ošetření chyb:
  - Detailní zpracování různých chybových stavů (neplatné heslo, stejné heslo, chybný požadavek)
  - Uživatelsky přívětivé chybové zprávy
- Stavová logika:
  - Indikace načítání během změny hesla
  - Zobrazení úspěšné/neúspěšné změny hesla
- Navigace:
  - Možnost přesměrování po úspěšné změně hesla (připraveno, ale zakomentováno)
- SEO optimalizace:
  - Nastavení title a meta description pro stránku
- Přístupnost:
  - Použití sémantických HTML elementů
  - Jasné popisky pro vstupní pole
- Výkon:
  - Minimální použití externích závislostí
  - Efektivní aktualizace DOM při změnách stavu
- Integrace s backend službami:
  - Využití Supabase pro autentizaci a správu uživatelů
- Validace vstupu:
  - Kontrola minimální délky hesla na straně klienta
  - Další validace na straně serveru

### 9. Obnovení zapomenutého hesla (/forgot)
- Funkce obnovení hesla:
  - Formulář pro zadání emailu uživatele
  - Integrace s Supabase pro generování odkazu pro reset hesla
  - Rozlišení mezi zákazníky a profily při zpracování žádosti o reset
- Bezpečnost:
  - Použití Supabase Admin klienta pro generování bezpečných odkazů pro reset hesla
  - Ověření existence uživatele před odesláním emailu pro reset hesla
  - Použití HTTPS pro zabezpečený přenos dat
- Emailová služba:
  - Využití Nodemailer pro odesílání emailů
  - Konfigurace SMTP pro službu Seznam.cz
  - Přizpůsobené emailové šablony pro zákazníky a profily
- Uživatelské rozhraní:
  - Responsivní design s využitím Tailwind CSS
  - Jednoduchý a přehledný formulář pro zadání emailu
  - Vizuální feedback pro uživatele (ikona, stínování)
- Zpracování formuláře:
  - Využití SvelteKit actions pro zpracování formuláře na serveru
  - Ochrana proti CSRF útokům
- Ošetření chyb:
  - Detailní zpracování různých chybových stavů
  - Uživatelsky přívětivé chybové zprávy
- Bezpečnostní doporučení:
  - Instrukce pro vytvoření silného hesla v emailu pro reset
- Logování:
  - Konzolové logování pro debugování (může být odstraněno v produkci)
- SEO optimalizace:
  - Nastavení title a meta description pro stránku
- Přístupnost:
  - Použití sémantických HTML elementů
  - Jasné popisky pro vstupní pole
- Flexibilita:
  - Možnost snadného přizpůsobení emailových šablon
- Výkon:
  - Asynchronní zpracování požadavků pro lepší odezvu aplikace
 
### 10. Zpracování autentizačních callbacků (/auth/callback)
- Zpracování autentizačních callbacků:
  - Handling různých typů autentizačních callbacků (signup, recovery, OTP verifikace)
  - Podpora pro OAuth flows (např. přihlášení přes Google)
- Bezpečnost:
  - Zpracování a verifikace token_hash pro zabezpečení autentizačního procesu
  - Využití code verifier pro PKCE (Proof Key for Code Exchange) v OAuth flow
  - Bezpečné přesměrování po úspěšné nebo neúspěšné autentizaci
- Integrace s Supabase:
  - Využití Supabase auth metod pro verifikaci OTP a výměnu kódu za session
  - Handling různých autentizačních scénářů podporovaných Supabase
- Flexibilní přesměrování:
  - Dynamické generování URL pro přesměrování na základě typu autentizace a výsledku
  - Podpora pro custom "next" URL parametr pro flexibilní workflow
- Ošetření chyb:
  - Detekce a zpracování chyb během autentizačního procesu
  - Přesměrování na chybovou stránku s relevantními informacemi
- Podpora pro různé autentizační toky:
  - Zpracování signup, account recovery a OTP verifikace
  - Rozšiřitelnost pro další autentizační metody
- Debugování a logování:
  - Rozsáhlé logování pro snadné debugování v development prostředí
  - Logování klíčových informací jako full URL, cookies, code verifier atd.
- Kompatibilita s SvelteKit:
  - Implementováno jako SvelteKit RequestHandler
  - Využití SvelteKit `redirect` funkce pro efektivní přesměrování
- Čistý kód a modularita:
  - Rozdělení logiky pro různé autentizační scénáře
  - Použití TypeScript pro lepší typovou bezpečnost
- Flexibilita a rozšiřitelnost:
  - Snadné přidání nových autentizačních metod nebo úprava existujících
  - Možnost customizace chybových zpráv a přesměrování

### 11. Potvrzení emailu a OTP verifikace (/auth/confirm)
- Zpracování potvrzovacích emailů a One-Time Password (OTP) verifikace:
  - Podpora pro různé typy EmailOtpType definované Supabase
- Bezpečnost:
  - Využití token_hash pro bezpečnou verifikaci
  - Odstranění citlivých parametrů z URL po zpracování
- Flexibilní přesměrování:
  - Podpora pro custom "next" URL parametr
  - Dynamické generování URL pro přesměrování po úspěšné verifikaci
- Integrace s Supabase:
  - Využití Supabase auth.verifyOtp metody pro ověření token_hash
- Ošetření chyb:
  - Implicitní handling chyb při verifikaci
  - Přesměrování na profilovou stránku v případě chyby nebo chybějících parametrů
- Čistý kód:
  - Stručná a efektivní implementace
  - Využití TypeScript pro lepší typovou bezpečnost
- Kompatibilita s SvelteKit:
  - Implementováno jako SvelteKit RequestHandler
  - Využití SvelteKit `redirect` funkce pro efektivní přesměrování
- Flexibilita:
  - Snadné rozšíření pro handling dalších scénářů nebo typů verifikace
- Uživatelský tok:
  - Po úspěšné verifikaci je uživatel přesměrován na požadovanou stránku
  - V případě chyby nebo neúplných dat je uživatel přesměrován na profilovou stránku
- Modularita:
  - Oddělený handler pro potvrzení emailu a OTP verifikaci
  - Možnost snadné integrace do větší autentizační struktury

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
https://github.com/zernonia/supabase-schema
