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

#### 5.2 Správa menu (/admin/menu)
- Správa menu:
  * Zobrazení seznamu menu s možností stránkování
  * Vyhledávání menu podle polévky a variant
  * Řazení menu podle data (od nejnovějších)
  * Možnost vytvoření nového menu
  * Editace existujících menu

- Paginace:
  * Implementace stránkování pro efektivní zobrazení velkého množství dat
  * Nastavitelný počet položek na stránku (aktuálně 10)

- Vyhledávání:
  * Komplexní vyhledávání v polích polévky a variant menu
  * Case-insensitive vyhledávání s použitím ILIKE

- Integrace s Supabase:
  * Využití Supabase pro dotazování a filtrování dat
  * Efektivní použití range pro stránkování

- Uživatelské nastavení:
  * Ukládání nastavení tabulky pro každého uživatele
  * Možnost přizpůsobení zobrazení sloupců

- Detailní zobrazení menu:
  * Komponenta MenuItemDetail pro zobrazení a editaci detailů menu
  * Možnost přidávání a odebírání alergenů a ingrediencí
  * Správa variant menu s možností editace ceny a popisu

- Tag Selector:
  * Vlastní komponenta pro výběr tagů (alergenů a ingrediencí)
  * Dynamické filtrování dostupných tagů při psaní
  * Možnost přidávání a odebírání tagů

- Responzivní design:
  * Přizpůsobení layoutu pro mobilní i desktopová zařízení

- Optimalizace výkonu:
  * Lazy loading komponent
  * Efektivní aktualizace UI při změnách dat

- Bezpečnost:
  * Kontrola přihlášení uživatele před načtením dat
  * Filtrování smazaných menu (soft delete)

- Ošetření chyb:
  * Logování chyb při načítání dat
  * Uživatelsky přívětivé chybové zprávy

- Flexibilita:
  * Možnost snadného rozšíření o další funkce správy menu
  * Struktura kódu umožňující snadnou údržbu a rozšiřitelnost

Tato sekce poskytuje komplexní nástroje pro správu menu v admin rozhraní, s důrazem na uživatelskou přívětivost, výkon a flexibilitu. Implementace zahrnuje pokročilé funkce vyhledávání, stránkování, a detailní správu menu včetně alergenů a ingrediencí.

#### 5.3 Vytváření nového menu (/admin/menu/newmenu)
- Vytváření nového menu:
  * Formulář pro vytvoření nového menu s detailními informacemi
  * Možnost přidání polévky, hlavních chodů (variant), alergenů a ingrediencí
  * Nastavení data a aktivního stavu menu

- Komponenta MenuItemDetail:
  * Znovupoužitelná komponenta pro zobrazení a editaci detailů menu
  * Podpora pro přidávání a odebírání alergenů a ingrediencí
  * Správa variant menu s možností editace ceny a popisu

- Integrace s Supabase:
  * Asynchronní operace pro vytvoření nového menu v databázi
  * Vkládání souvisejících dat (varianty, alergeny, ingredience) v rámci jedné transakce

- Validace vstupů:
  * Kontrola povinných polí (např. datum)
  * Ošetření chybových stavů při vytváření menu

- Uživatelské rozhraní:
  * Responsivní design s využitím Tailwind CSS
  * Animace pro plynulé přechody a lepší UX (fly, fade)
  * Tlačítka pro navigaci zpět a vytvoření menu

- Stavová logika:
  * Správa stavu načítání během vytváření menu
  * Zobrazení úspěšných a chybových zpráv

- TypeScript integrace:
  * Využití typů pro zajištění typové bezpečnosti (Menu, PageData)

- Načítání předem definovaných dat:
  * Načtení seznamu všech alergenů a ingrediencí pro výběr

- Flexibilita:
  * Možnost snadného rozšíření o další pole nebo funkcionality
  * Struktura umožňující jednoduché přidání dalších variant menu

- Výkonová optimalizace:
  * Efektivní načítání dat z Supabase
  * Použití reactive statements pro optimalizaci aktualizací UI

- Logování:
  * Detailní konzolové logování pro snadné debugování

- Bezpečnost:
  * Ošetření vstupů před odesláním do databáze
  * Kontrola přístupu k API endpointům (implementováno v server.ts)

Tato sekce poskytuje komplexní řešení pro vytváření nových menu položek v admin rozhraní. Nabízí uživatelsky přívětivé rozhraní s pokročilými funkcemi pro správu detailů menu, včetně alergenů a ingrediencí, s důrazem na flexibilitu, výkon a bezpečnost.

#### 5.4 Editace existujícího menu (/admin/menu/[menuId])
- Editace existujícího menu:
  * Načítání detailů konkrétního menu včetně variant, alergenů a ingrediencí
  * Možnost úpravy všech aspektů menu (datum, polévka, varianty, alergeny, ingredience atd.)
  * Implementace "soft delete" pro označení menu jako smazané bez fyzického odstranění z databáze

- Komplexní datové operace:
  * Načítání souvisejících dat (varianty, alergeny, ingredience) v jednom dotazu
  * Efektivní aktualizace všech součástí menu včetně souvisejících tabulek

- Komponenta MenuItemDetail:
  * Znovupoužitelná komponenta pro zobrazení a editaci detailů menu
  * Podpora pro dynamické přidávání a odebírání alergenů a ingrediencí

- Integrace s Supabase:
  * Využití komplexních dotazů pro efektivní načítání dat
  * Implementace RPC volání pro operace soft delete

- Ošetření chyb:
  * Detailní logování chyb při načítání a ukládání dat
  * Uživatelsky přívětivé zobrazení chybových zpráv

- Uživatelské rozhraní:
  * Responsivní design s využitím Tailwind CSS
  * Animace pro plynulé přechody (fly, fade)
  * Potvrzovací zprávy pro úspěšné operace

- Typová bezpečnost:
  * Využití TypeScript pro definici typů (Menu, Database)
  * Zajištění typové konzistence napříč komponentami

- Optimalizace výkonu:
  * Efektivní načítání dat v jednom dotazu
  * Použití reactive statements pro optimalizaci re-renderování

- Navigace:
  * Možnost návratu na seznam menu
  * Přesměrování po úspěšném smazání menu

- Flexibilita:
  * Snadné rozšíření o další funkcionality díky modulární struktuře
  * Možnost přidání dalších polí nebo vztahů k menu

- Bezpečnost:
  * Ověření existence menu před načtením detailů
  * Kontrola přístupu k API endpointům (implementováno v server.ts)

- Verzování menu:
  * Příprava pro možné budoucí implementace verzování menu (menu_versions tabulka)

Tato sekce poskytuje komplexní řešení pro správu jednotlivých menu položek v admin rozhraní. Nabízí pokročilé možnosti editace s důrazem na uživatelskou přívětivost, výkon a integritu dat. Implementace zahrnuje sofistikované operace s databází a flexibilní UI komponenty pro efektivní správu menu.

#### 5.5 Správa objednávek (/admin/order)
- Správa objednávek:
  * Zobrazení seznamu objednávek s možností stránkování
  * Vyhledávání objednávek podle jména zákazníka, emailu a čísla objednávky
  * Řazení objednávek podle data (od nejnovějších)

- Paginace:
  * Implementace stránkování pro efektivní zobrazení velkého množství dat
  * Nastavitelný počet položek na stránku (aktuálně 20)

- Vyhledávání:
  * Komplexní vyhledávání napříč několika poli objednávky
  * Podpora pro vyhledávání podle čísla objednávky

- Integrace s Supabase:
  * Využití Supabase pro dotazování a filtrování dat
  * Efektivní použití range pro stránkování

- Uživatelské nastavení:
  * Ukládání nastavení tabulky pro každého uživatele
  * Možnost přizpůsobení zobrazení sloupců

- Detailní zobrazení objednávky:
  * Komponenta OrderItemDetail pro zobrazení a editaci detailů objednávky
  * Správa základních údajů, platebních údajů, fakturačních a dodacích adres

- Formátování dat:
  * Převod datumů do českého formátu
  * Formátování stavu platby

- Responzivní design:
  * Přizpůsobení layoutu pro mobilní i desktopová zařízení

- Flexibilní filtrování:
  * Možnost filtrování podle data a stavu objednávky

- Optimalizace výkonu:
  * Lazy loading komponent
  * Efektivní aktualizace UI při změnách dat

- Bezpečnost:
  * Kontrola přihlášení uživatele před načtením dat
  * Ošetření vstupů pro vyhledávání

- Ošetření chyb:
  * Logování chyb při načítání dat
  * Propagace chyb pro další zpracování

- Statistiky:
  * Zobrazení celkového počtu objednávek
  * Informace o aktuální stránce a celkovém počtu stránek

- Flexibilita:
  * Připraveno pro budoucí rozšíření (např. vytváření nových objednávek)
  * Snadná úprava a přidávání nových funkcí

Tato sekce poskytuje komplexní nástroje pro správu objednávek v admin rozhraní, s důrazem na uživatelskou přívětivost, výkon a flexibilitu. Implementace zahrnuje pokročilé funkce vyhledávání, stránkování a detailní správu objednávek, což umožňuje efektivní práci i s velkým počtem objednávek.

#### 5.6 Vytváření nové objednávky (/admin/order/neworder)
- Vytváření nové objednávky:
  * Formulář pro vytvoření nové objednávky s detailními informacemi
  * Možnost zadání základních údajů o objednávce (datum, měna, způsob dopravy, platební metoda, stav objednávky)

- Komponenta OrderItemDetail:
  * Znovupoužitelná komponenta pro zobrazení a editaci detailů objednávky
  * Podpora pro zadávání fakturačních a dodacích údajů

- Integrace s Supabase:
  * Asynchronní operace pro vytvoření nové objednávky v databázi
  * Automatické přiřazení uživatele k objednávce

- Uživatelské rozhraní:
  * Responsivní design s využitím Tailwind CSS a DaisyUI
  * Animace pro plynulé přechody (fly)
  * Tlačítka pro navigaci zpět a vytvoření objednávky

- Stavová logika:
  * Správa stavu načítání během vytváření objednávky
  * Validace vstupních dat (např. kontrola platnosti data)

- Formátování dat:
  * Převod datumů do formátu vhodného pro Supabase

- Flexibilní nastavení:
  * Předefinované možnosti pro způsob platby, stav objednávky, měnu a způsob dopravy
  * Snadné rozšíření o další možnosti

- Navigace:
  * Možnost návratu na seznam objednávek
  * Přesměrování po úspěšném vytvoření objednávky

- Typová bezpečnost:
  * Využití TypeScript pro definici typů a lepší kontrolu chyb

- Optimalizace výkonu:
  * Lazy loading komponenty OrderItemDetail

- Bezpečnost:
  * Ověření přihlášení uživatele před vytvořením objednávky
  * Automatické přiřazení ID přihlášeného uživatele k objednávce

- Logování:
  * Konzolové logování pro snadné debugování

Tato sekce poskytuje uživatelsky přívětivé rozhraní pro vytváření nových objednávek v admin systému. Nabízí flexibilní možnosti nastavení objednávky s důrazem na jednoduchost použití a integraci s backendovým systémem. Implementace zahrnuje validaci vstupů, správu stavů a efektivní ukládání dat do databáze Supabase.

#### 5.7 Editace existující objednávky (/admin/order/[orderId])
- Editace existující objednávky:
  * Načítání detailů konkrétní objednávky včetně souvisejících položek
  * Možnost úpravy všech aspektů objednávky (datum, stav, platební údaje, dodací údaje atd.)
  * Zobrazení položek objednávky s detaily o variantách a menu

- Komplexní datové operace:
  * Načítání souvisejících dat (order_items, variant_id, menu_id) v jednom dotazu
  * Efektivní aktualizace všech součástí objednávky

- Komponenta OrderItemDetail:
  * Znovupoužitelná komponenta pro zobrazení a editaci detailů objednávky
  * Podpora pro editaci fakturačních a dodacích údajů

- Integrace s Supabase:
  * Využití komplexních dotazů pro efektivní načítání dat
  * Aktualizace objednávky v databázi

- Ošetření chyb:
  * Detailní logování chyb při načítání a ukládání dat
  * Uživatelsky přívětivé zobrazení chybových zpráv

- Uživatelské rozhraní:
  * Responsivní design s využitím Tailwind CSS a DaisyUI
  * Animace pro plynulé přechody (fly, fade)
  * Potvrzovací zprávy pro úspěšné operace

- Manipulace s datumy:
  * Formátování datumů pro zobrazení a ukládání
  * Validace vstupních datumů

- Kalkulace součtů:
  * Výpočet celkové ceny a množství položek v objednávce

- Navigace:
  * Možnost návratu na seznam objednávek
  * Přesměrování po úspěšném smazání objednávky

- Bezpečnost:
  * Ověření existence objednávky před načtením detailů
  * Kontrola přístupu k API endpointům (implementováno v server.ts)

- Flexibilita:
  * Možnost snadného rozšíření o další funkcionality (např. přidávání/odebírání položek)
  * Struktura umožňující jednoduché přidání dalších polí nebo vztahů

- Optimalizace výkonu:
  * Efektivní načítání dat v jednom dotazu
  * Použití reaktivních proměnných pro optimalizaci re-renderování

Tato sekce poskytuje komplexní řešení pro správu jednotlivých objednávek v admin rozhraní. Nabízí pokročilé možnosti editace s důrazem na uživatelskou přívětivost, výkon a integritu dat. Implementace zahrnuje sofistikované operace s databází a flexibilní UI komponenty pro efektivní správu objednávek.

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
