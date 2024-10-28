# 🍽️ Šťastné srdce - Happy heart

Webová aplikace pro správu a objednávání jídel.

Web application for food management and ordering.

## 🛠️ Technologie - Techstack

- Frontend: SvelteKit, TypeScript
- Backend: Supabase
- Styling: TailwindCSS, DaisyUI
- Deployment: Vercel
- Ver. system: GitHub
- Email Service: Nodemailer
- Maps: Google Maps
- Security: Google reCAPTCHA v3
- Authentication: OAuth (Google), Supabase Auth, OTP
- Text Editor: cl-editor (WYSIWYG)

## 🌟 Klíčové funkce - Key features

- Správa denního menu
- Objednávkový systém pro zákazníky
- Administrační rozhraní pro správu jídel, objednávek, textů a uživatelů
- Responzivní design pro mobilní i desktopové zařízení
- Automatizované emailové notifikace
- Interaktivní kontaktní formulář s ochranou proti spamu
- Komplexní uživatelský profil s historií objednávek
- Bezpečný systém pro resetování hesla
- Registrace uživatelů s možností sociálního přihlášení
- Funkce obnovení zapomenutého hesla
- Pokročilé zpracování autentizačních callbacků
- Potvrzení emailu a OTP verifikace
- Správa textového obsahu webu s WYSIWYG editorem

- Daily menu management
- Order system for customers
- Administrative interface for managing meals, orders, texts and users
- Responsive design for mobile and desktop devices
- Automated email notifications
- Interactive contact form with spam protection
- Comprehensive user profile with order history
- Secure password reset system
- User registration with social login option
- Forgotten password recovery function
- Advanced authentication callback handling
- Email confirmation and OTP verification
- Website content management with WYSIWYG editor

## 📄 Popis stránek - Page descriptions

### 1. Úvodní stránka (/)

- Prezentuje hlavní informace o službě
- Obsahuje sekce s popisem nabídky jídel, procesu objednávání a dalších informací
- Responzivní design s použitím Tailwind CSS
- Animované prvky pro lepší uživatelský zážitek

### 1. Home page (/)

- Presents main information about the service
- Contains sections describing food offerings, ordering process, and other information
- Responsive design using Tailwind CSS
- Animated elements for better user experience

### 2. Jídelníček (/jidelnicek)

- Zobrazuje aktuální denní menu na následující 4 týdny
- Dynamické časové rozmezí:
  - Začátek (startDate):
    - Do 17:00 si zákazník objedná na další den
    - Po 17:00 si zákazník objedná napozítří
    - Jedna stránka: 7 dní
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
- Dodatečný obsah specifický pro stránku jídelníčku načítaný z databáze
- Funkčnost pro přihlášené uživatele:
  - Přidávání položek do košíku
  - Zobrazení celkového počtu položek v košíku
  - Přímý přechod do košíku

### 2. Menu (/jidelnicek)

- Displays current daily menu for the next 4 weeks
- Dynamic time range:
  - Start (startDate):
    - Until 17:00, customer orders for the next day
    - After 17:00, customer orders for the day after tomorrow
    - One page: 7 days
    - End (endDate): 27 days from startDate
- Menu display:
  - Only active menus (active = true)
  - Within the range from startDate to endDate
  - Sorted ascending by date
- Data structure:
  - Menus divided into 4 weeks
  - Each menu contains: date, soup, main dish variants, additional information
- User interface:
  - Display by weeks (tabs "Week 1", "Week 2", etc.)
  - For each day: date, soup, main dishes with option to add to cart
- Additional content specific to the menu page loaded from the database
- Functionality for logged-in users:
  - Adding items to cart
  - Displaying total number of items in cart
  - Direct transition to cart

### 3. Košík (/kosik)

- Zobrazení položek v košíku s detaily (datum, polévka, menu, počet, cena)
- Možnost úpravy množství a odstranění položek z košíku
- Výpočet celkové ceny a počtu kusů
- Responzivní design pro mobilní a desktopové zobrazení
- Autentizace a autorizace:
  - Kontrola přihlášení uživatele pro přístup ke košíku
  - Propojení s uživatelským účtem pro získání informací o zákazníkovi
- Zpracování objednávky:
  - Vytvoření objednávky v databázi (Supabase)
  - Ukládání detailů objednávky včetně položek, cen a množství
  - Propojení objednávky s uživatelským účtem
  - Odeslání emailu o vytvořené objednávce přihlášenému zákazníkovi
- Emailová služba:
  - Využití Nodemailer pro odesílání emailů
  - Konfigurace SMTP pro službu Seznam.cz
  - Odesílání strukturovaného emailu s informacemi z formuláře kde jsou obsaženy jednotlivé položky, celkem cena, ks
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

### 3. Cart (/kosik)

- Display of cart items with details (date, soup, menu, quantity, price)
- Ability to edit quantity and remove items from cart
- Calculation of total price and number of items
- Responsive design for mobile and desktop view
- Authentication and authorization:
  - User login check for cart access
  - Connection with user account to obtain customer information
- Order processing:
  - Creation of order in database (Supabase)
  - Storing order details including items, prices, and quantities
  - Linking order with user account
  - Sending email about created order to logged-in customer
- Email service:
  - Use of Nodemailer for sending emails
  - SMTP configuration for Seznam.cz service
  - Sending structured email with information from form including individual items, total price, quantity
- Security:
  - Verification of user session before processing order
  - Empty cart check before creating order
- User interface:
  - Modal window for order confirmation
  - Option to add note to order
  - Link to user profile for checking/editing information
- Database integration:
  - Use of Supabase for data storage and retrieval
  - Work with customers, orders, and order_items tables
- State logic:
  - Use of Svelte stores for cart state management
  - Update of total price and quantity when cart changes
- Error states:
  - Handling of error states during order processing
  - Display of error messages to user
- Performance optimization:
  - Lazy loading of components
  - Efficient UI updates when cart changes

### 4. Kontakt (/kontakt)

- Kontaktní formulář:
  - Pole pro zadání emailu, jména, telefonu a zprávy
  - Validace vstupních polí (required atributy)
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

### 4. Contact (/kontakt)

- Contact form:
  - Fields for entering email, name, phone, and message
  - Validation of input fields (required attributes)
- Google reCAPTCHA integration:
  - Use of reCAPTCHA v3 for spam protection
  - Asynchronous loading of reCAPTCHA script
  - Automatic processing of reCAPTCHA token before form submission
- Server-side form processing:
  - Use of SvelteKit actions for processing POST request
  - Extraction of form data using FormData API
- Email service:
  - Use of Nodemailer for sending emails
  - SMTP configuration for Seznam.cz service
  - Sending structured email with information from the form
- Error states and feedback:
  - Display of error messages to user on unsuccessful submission
  - Confirmation of successful form submission
- Responsive design:
  - Layout adaptation for mobile and desktop devices
  - Use of CSS grid and flexbox for layout
- Animation:
  - Use of animate.css for title animation
- Map integration:
  - Embedding Google Maps iframe with company address
- Contact information:
  - Display of company details including address, ID, VAT number, and contact information
- Security:
  - Protection against CSRF attacks using SvelteKit
  - Use of reCAPTCHA to prevent automated spam
- Performance optimization:
  - Lazy loading for Google Maps iframe
- Accessibility:
  - Use of semantic HTML elements
  - Labels for form elements

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

### 5. Administrative interface (/admin)

- Secure access only for authorized users
- Menu management (/admin/menu)
  - CRUD operations for menu items
  - Option to set variants, allergens, and ingredients
  - Uses TanStack Table for advanced filtering and sorting
- Order management (/admin/order)
  - Overview of all orders with filtering options
  - Order detail with status change possibility
- Customer management (/admin/customer)
  - List of registered customers
  - Option to edit data and set permissions

#### 5.1 Správa zákazníků (/admin/customer)

- Správa zákazníků:
  - Zobrazení seznamu zákazníků s možností stránkování
  - Vyhledávání zákazníků podle různých kritérií (jméno, příjmení, email, telefon, adresa)
  - Řazení zákazníků podle data registrace (od nejnovějších)
- Paginace:
  - Implementace stránkování pro efektivní zobrazení velkého množství dat
  - Nastavitelný počet položek na stránku (aktuálně 20)
- Vyhledávání:
  - Komplexní vyhledávání napříč několika poli zákazníka
  - Case-insensitive vyhledávání s použitím ILIKE
  - Kritéria vyhledávání (jméno, příjmení, email, telefon, adresa)
- Integrace se Supabase:
  - Využití Supabase pro dotazování a filtrování dat
  - Efektivní použití range pro stránkování
- Uživatelské nastavení:
  - Ukládání nastavení tabulky pro každého uživatele
  - Možnost přizpůsobení zobrazení sloupců
- Statistiky:
  - Zobrazení celkového počtu zákazníků
  - Informace o aktuální stránce a celkovém počtu stránek
- Detaily zákazníka:
  - Možnost zobrazení a editace detailů jednotlivých zákazníků
  - Načítání kompletních informací o zákazníkovi
- Vytvoření nového zákazníka:
  - Samostatná sekce pro přidání nového zákazníka
- Bezpečnost:
  - Kontrola přihlášení uživatele před načtením dat
  - Omezení přístupu k citlivým datům
- Výkon:
  - Optimalizované dotazy pro rychlé načítání dat
  - Použití count pro efektivní získání celkového počtu záznamů

#### 5.1 Customer management (/admin/customer)

- Customer management:
  - Display of customer list with pagination option
  - Customer search by various criteria (first name, last name, email, phone, address)
  - Sorting customers by registration date (from newest)
- Pagination:
  - Implementation of pagination for efficient display of large amounts of data
  - Adjustable number of items per page (currently 20)
- Search:
  - Complex search across several customer fields
  - Case-insensitive search using ILIKE
  - Search criteria (first name, last name, email, phone, address)
- Supabase integration:
  - Use of Supabase for data querying and filtering
  - Efficient use of range for pagination
- User settings:
  - Saving table settings for each user
  - Option to customize column display
- Statistics:
  - Display of total number of customers
  - Information about current page and total number of pages
- Customer details:
  - Option to view and edit details of individual customers
  - Loading complete customer information
- Creating a new customer:
  - Separate section for adding a new customer
- Security:
  - User login check before loading data
  - Limiting access to sensitive data
- Performance:
  - Optimized queries for fast data loading
  - Use of count for efficient retrieval of total number of records

#### 5.2 Správa menu (/admin/menu)

- Správa menu:
  - Zobrazení seznamu menu s možností stránkování
  - Vyhledávání menu podle polévky a variant
  - Řazení menu podle data (od nejnovějších)
  - Možnost vytvoření nového menu
  - Editace existujících menu
- Paginace:
  - Implementace stránkování pro efektivní zobrazení velkého množství dat
  - Nastavitelný počet položek na stránku (aktuálně 10)
- Vyhledávání:
  - Komplexní vyhledávání v polích polévky a variant menu
  - Case-insensitive vyhledávání s použitím ILIKE
- Integrace s Supabase:
  - Využití Supabase pro dotazování a filtrování dat
  - Efektivní použití range pro stránkování
- Uživatelské nastavení:
  - Ukládání nastavení tabulky pro každého uživatele
  - Možnost přizpůsobení zobrazení sloupců
- Detailní zobrazení menu:
  - Komponenta MenuItemDetail pro zobrazení a editaci detailů menu
  - Možnost přidávání a odebírání alergenů a ingrediencí
  - Správa variant menu s možností editace ceny a popisu
- Tag Selector:
  - Vlastní komponenta pro výběr tagů (alergenů a ingrediencí)
  - Dynamické filtrování dostupných tagů při psaní
  - Možnost přidávání a odebírání tagů
- Responzivní design:
  - Přizpůsobení layoutu pro mobilní i desktopová zařízení
- Optimalizace výkonu:
  - Lazy loading komponent
  - Efektivní aktualizace UI při změnách dat
- Bezpečnost:
  - Kontrola přihlášení uživatele před načtením dat

#### 5.2 Menu management (/admin/menu)

- Menu management:
  - Display of menu list with pagination option
  - Menu search by soup and variants
  - Sorting menu by date (from newest)
  - Option to create a new menu
  - Editing existing menus
- Pagination:
  - Implementation of pagination for efficient display of large amounts of data
  - Adjustable number of items per page (currently 10)
- Search:
  - Complex search in soup and menu variant fields
  - Case-insensitive search using ILIKE
- Supabase integration:
  - Use of Supabase for data querying and filtering
  - Efficient use of range for pagination
- User settings:
  - Saving table settings for each user
  - Option to customize column display
- Detailed menu display:
  - MenuItemDetail component for displaying and editing menu details
  - Option to add and remove allergens and ingredients
  - Management of menu variants with option to edit price and description
- Tag Selector:
  - Custom component for selecting tags (allergens and ingredients)
  - Dynamic filtering of available tags while typing
  - Option to add and remove tags
- Responsive design:
  - Layout adaptation for mobile and desktop devices
- Performance optimization:
  - Lazy loading of components
  - Efficient UI updates when data changes
- Security:
  - User login check before loading data

#### 5.3 Vytváření nového menu (/admin/menu/newmenu)

- Vytváření nového menu:
  - Formulář pro vytvoření nového menu s detailními informacemi
  - Možnost přidání polévky, hlavních chodů (variant), alergenů a ingrediencí
  - Nastavení data a aktivního stavu menu
- Komponenta MenuItemDetail:
  - Znovupoužitelná komponenta pro zobrazení a editaci detailů menu
  - Podpora pro přidávání a odebírání alergenů a ingrediencí
  - Správa variant menu s možností editace ceny a popisu
- Integrace s Supabase:
  - Asynchronní operace pro vytvoření nového menu v databázi
  - Vkládání souvisejících dat (varianty, alergeny, ingredience) v rámci jedné transakce
- Validace vstupů:
  - Kontrola povinných polí (např. datum)
  - Ošetření chybových stavů při vytváření menu
- Uživatelské rozhraní:
  - Responsivní design s využitím Tailwind CSS
  - Animace pro plynulé přechody a lepší UX (fly, fade)
  - Tlačítka pro navigaci zpět a vytvoření menu
- Stavová logika:
  - Správa stavu načítání během vytváření menu
  - Zobrazení úspěšných a chybových zpráv
- TypeScript integrace:
  - Využití typů pro zajištění typové bezpečnosti (Menu, PageData)
- Načítání předem definovaných dat:
  - Načtení seznamu všech alergenů a ingrediencí pro výběr
- Flexibilita:
  - Možnost snadného rozšíření o další pole nebo funkcionality
  - Struktura umožňující jednoduché přidání dalších variant menu
- Výkonová optimalizace:
  - Efektivní načítání dat z Supabase
  - Použití reactive statements pro optimalizaci aktualizací UI
- Bezpečnost:
  - Ošetření vstupů před odesláním do databáze
  - Kontrola přístupu k API endpointům (implementováno v server.ts)

#### 5.3 Creating a new menu (/admin/menu/newmenu)

- Creating a new menu:
  - Form for creating a new menu with detailed information
  - Option to add soup, main courses (variants), allergens and ingredients
  - Setting the date and active status of the menu
- MenuItemDetail component:
  - Reusable component for displaying and editing menu details
  - Support for adding and removing allergens and ingredients
  - Management of menu variants with option to edit price and description
- Supabase integration:
  - Asynchronous operations for creating a new menu in the database
  - Insertion of related data (variants, allergens, ingredients) within a single transaction
- Input validation:
  - Checking required fields (e.g. date)
  - Handling error states when creating menu
- User interface:
  - Responsive design using Tailwind CSS
  - Animations for smooth transitions and better UX (fly, fade)
  - Buttons for navigation back and menu creation
- State logic:
  - Managing loading state during menu creation
  - Displaying success and error messages
- TypeScript integration:
  - Use of types to ensure type safety (Menu, PageData)
- Loading predefined data:
  - Loading list of all allergens and ingredients for selection
- Flexibility:
  - Possibility of easy extension with additional fields or functionalities
  - Structure allowing easy addition of further menu variants
- Performance optimization:
  - Efficient data loading from Supabase
  - Use of reactive statements to optimize UI updates
- Security:
  - Sanitizing inputs before sending to database
  - Access control to API endpoints (implemented in server.ts)

#### 5.4 Editace existujícího menu (/admin/menu/[menuId])

- Editace existujícího menu:
  - Načítání detailů konkrétního menu včetně variant, alergenů a ingrediencí
  - Možnost úpravy všech aspektů menu (datum, polévka, varianty, alergeny, ingredience atd.)
  - Implementace "soft delete" pro označení menu jako smazané bez fyzického odstranění z databáze
- Komplexní datové operace:
  - Načítání souvisejících dat (varianty, alergeny, ingredience) v jednom dotazu
  - Efektivní aktualizace všech součástí menu včetně souvisejících tabulek
- Komponenta MenuItemDetail:
  - Znovupoužitelná komponenta pro zobrazení a editaci detailů menu
  - Podpora pro dynamické přidávání a odebírání alergenů a ingrediencí
- Integrace s Supabase:
  - Využití komplexních dotazů pro efektivní načítání dat
  - Implementace RPC volání pro operace soft delete
- Ošetření chyb:
  - Detailní logování chyb při načítání a ukládání dat
  - Uživatelsky přívětivé zobrazení chybových zpráv
- Uživatelské rozhraní:
  - Responsivní design s využitím Tailwind CSS
  - Animace pro plynulé přechody (fly, fade)
  - Potvrzovací zprávy pro úspěšné operace
- Typová bezpečnost:
  - Využití TypeScript pro definici typů (Menu, Database)
  - Zajištění typové konzistence napříč komponentami
- Optimalizace výkonu:
  - Efektivní načítání dat v jednom dotazu
  - Použití reactive statements pro optimalizaci re-renderování
- Navigace:
  - Možnost návratu na seznam menu
  - Přesměrování po úspěšném smazání menu
- Bezpečnost:
  - Ověření existence menu před načtením detailů
  - Kontrola přístupu k API endpointům (implementováno v server.ts)
- Verzování menu:
  - Příprava pro možné budoucí implementace verzování menu (menu_versions tabulka)

#### 5.4 Editing existing menu (/admin/menu/[menuId])

- Editing existing menu:
  - Loading details of specific menu including variants, allergens and ingredients
  - Option to edit all aspects of the menu (date, soup, variants, allergens, ingredients etc.)
  - Implementation of "soft delete" for marking menu as deleted without physical removal from database
- Complex data operations:
  - Loading related data (variants, allergens, ingredients) in one query
  - Efficient update of all menu components including related tables
- MenuItemDetail component:
  - Reusable component for displaying and editing menu details
  - Support for dynamic adding and removing of allergens and ingredients
- Supabase integration:
  - Use of complex queries for efficient data loading
  - Implementation of RPC calls for soft delete operations
- Error handling:
  - Detailed error logging during data loading and saving
  - User-friendly display of error messages
- User interface:
  - Responsive design using Tailwind CSS
  - Animations for smooth transitions (fly, fade)
  - Confirmation messages for successful operations
- Type safety:
  - Use of TypeScript for type definition (Menu, Database)
  - Ensuring type consistency across components
- Performance optimization:
  - Efficient data loading in one query
  - Use of reactive statements to optimize re-rendering
- Navigation:
  - Option to return to menu list
  - Redirection after successful menu deletion
- Security:
  - Verification of menu existence before loading details
  - Access control to API endpoints (implemented in server.ts)
- Menu versioning:
  - Preparation for possible future implementations of menu versioning (menu_versions table)

#### 5.5 Správa objednávek (/admin/order)

- Správa objednávek:
  - Zobrazení seznamu objednávek s možností stránkování
  - Vyhledávání objednávek podle jména zákazníka, emailu a čísla objednávky
  - Řazení objednávek podle data (od nejnovějších)
- Paginace:
  - Implementace stránkování pro efektivní zobrazení velkého množství dat
  - Nastavitelný počet položek na stránku (aktuálně 20)
- Vyhledávání:
  - Komplexní vyhledávání napříč několika poli objednávky
  - Podpora pro vyhledávání podle čísla objednávky
- Integrace s Supabase:
  - Využití Supabase pro dotazování a filtrování dat
  - Efektivní použití range pro stránkování
- Uživatelské nastavení:
  - Ukládání nastavení tabulky pro každého uživatele
  - Možnost přizpůsobení zobrazení sloupců
- Detailní zobrazení objednávky:
  - Komponenta OrderItemDetail pro zobrazení a editaci detailů objednávky
  - Správa základních údajů, platebních údajů, fakturačních a dodacích adres
- Formátování dat:
  - Převod datumů do českého formátu
  - Formátování stavu platby
- Responzivní design:
  - Přizpůsobení layoutu pro mobilní i desktopová zařízení
- Flexibilní filtrování:
  - Možnost filtrování podle data a stavu objednávky
- Optimalizace výkonu:
  - Lazy loading komponent
  - Efektivní aktualizace UI při změnách dat
- Bezpečnost:
  - Kontrola přihlášení uživatele před načtením dat
  - Ošetření vstupů pro vyhledávání
- Ošetření chyb:
  - Logování chyb při načítání dat
  - Propagace chyb pro další zpracování
- Statistiky:
  - Zobrazení celkového počtu objednávek
  - Informace o aktuální stránce a celkovém počtu stránek
- Flexibilita:
  - Připraveno pro budoucí rozšíření (např. vytváření nových objednávek)
  - Snadná úprava a přidávání nových funkcí

#### 5.5 Order management (/admin/order)

- Order management:
  - Display of order list with pagination option
  - Order search by customer name, email, and order number
  - Sorting orders by date (from newest)
- Pagination:
  - Implementation of pagination for efficient display of large amounts of data
  - Adjustable number of items per page (currently 20)
- Search:
  - Complex search across several order fields
  - Support for searching by order number
- Supabase integration:
  - Use of Supabase for data querying and filtering
  - Efficient use of range for pagination
- User settings:
  - Saving table settings for each user
  - Option to customize column display
- Detailed order view:
  - OrderItemDetail component for displaying and editing order details
  - Management of basic data, payment data, billing and delivery addresses
- Data formatting:
  - Conversion of dates to Czech format
  - Formatting of payment status
- Responsive design:
  - Layout adaptation for mobile and desktop devices
- Flexible filtering:
  - Option to filter by date and order status
- Performance optimization:
  - Lazy loading of components
  - Efficient UI updates when data changes
- Security:
  - User login check before loading data
  - Sanitizing search inputs
- Error handling:
  - Logging errors during data loading
  - Error propagation for further processing
- Statistics:
  - Display of total number of orders
  - Information about current page and total number of pages
- Flexibility:
  - Prepared for future extensions (e.g., creating new orders)
  - Easy modification and addition of new functions

#### 5.6 Vytváření nové objednávky (/admin/order/neworder)

- Vytváření nové objednávky:
  - Formulář pro vytvoření nové objednávky s detailními informacemi
  - Možnost zadání základních údajů o objednávce (datum, měna, způsob dopravy, platební metoda, stav objednávky)
- Komponenta OrderItemDetail:
  - Znovupoužitelná komponenta pro zobrazení a editaci detailů objednávky
  - Podpora pro zadávání fakturačních a dodacích údajů
- Integrace s Supabase:
  - Asynchronní operace pro vytvoření nové objednávky v databázi
  - Automatické přiřazení uživatele k objednávce
- Uživatelské rozhraní:
  - Responsivní design s využitím Tailwind CSS a DaisyUI
  - Animace pro plynulé přechody (fly)
  - Tlačítka pro navigaci zpět a vytvoření objednávky
- Stavová logika:
  - Správa stavu načítání během vytváření objednávky
  - Validace vstupních dat (např. kontrola platnosti data)
- Formátování dat:
  - Převod datumů do formátu vhodného pro Supabase
- Flexibilní nastavení:
  - Předefinované možnosti pro způsob platby, stav objednávky, měnu a způsob dopravy
  - Snadné rozšíření o další možnosti
- Navigace:
  - Možnost návratu na seznam objednávek
  - Přesměrování po úspěšném vytvoření objednávky
- Typová bezpečnost:
  - Využití TypeScript pro definici typů a lepší kontrolu chyb
- Optimalizace výkonu:
  - Lazy loading komponenty OrderItemDetail
- Bezpečnost:
  - Ověření přihlášení uživatele před vytvořením objednávky
  - Automatické přiřazení ID přihlášeného uživatele k objednávce

#### 5.6 Creating a new order (/admin/order/neworder)

- Creating a new order:
  - Form for creating a new order with detailed information
  - Option to enter basic order data (date, currency, shipping method, payment method, order status)
- OrderItemDetail component:
  - Reusable component for displaying and editing order details
  - Support for entering billing and shipping information
- Supabase integration:
  - Asynchronous operations for creating a new order in the database
  - Automatic assignment of user to the order
- User interface:
  - Responsive design using Tailwind CSS and DaisyUI
  - Animations for smooth transitions (fly)
  - Buttons for navigation back and order creation
- State logic:
  - Managing loading state during order creation
  - Validation of input data (e.g., date validity check)
- Data formatting:
  - Conversion of dates to format suitable for Supabase
- Flexible settings:
  - Predefined options for payment method, order status, currency, and shipping method
  - Easy extension with additional options
- Navigation:
  - Option to return to order list
  - Redirection after successful order creation
- Type safety:
  - Use of TypeScript for type definition and better error control
- Performance optimization:
  - Lazy loading of OrderItemDetail component
- Security:
  - Verification of user login before creating an order
  - Automatic assignment of logged-in user ID to the order

#### 5.7 Editace existující objednávky (/admin/order/[orderId])

- Editace existující objednávky:
  - Načítání detailů konkrétní objednávky včetně souvisejících položek
  - Možnost úpravy všech aspektů objednávky (datum, stav, platební údaje, dodací údaje atd.)
  - Zobrazení položek objednávky s detaily o variantách a menu
- Komplexní datové operace:
  - Načítání souvisejících dat (order_items, variant_id, menu_id) v jednom dotazu
  - Efektivní aktualizace všech součástí objednávky
- Komponenta OrderItemDetail:
  - Znovupoužitelná komponenta pro zobrazení a editaci detailů objednávky
  - Podpora pro editaci fakturačních a dodacích údajů
- Integrace s Supabase:
  - Využití komplexních dotazů pro efektivní načítání dat
  - Aktualizace objednávky v databázi
- Ošetření chyb:
  - Detailní logování chyb při načítání a ukládání dat
  - Uživatelsky přívětivé zobrazení chybových zpráv
- Uživatelské rozhraní:
  - Responsivní design s využitím Tailwind CSS a DaisyUI
  - Animace pro plynulé přechody (fly, fade)
  - Potvrzovací zprávy pro úspěšné operace
- Manipulace s datumy:
  - Formátování datumů pro zobrazení a ukládání
  - Validace vstupních datumů
- Kalkulace součtů:
  - Výpočet celkové ceny a množství položek v objednávce
- Navigace:
  - Možnost návratu na seznam objednávek
  - Přesměrování po úspěšném smazání objednávky
- Bezpečnost:
  - Ověření existence objednávky před načtením detailů
  - Kontrola přístupu k API endpointům (implementováno v server.ts)
- Flexibilita:
  - Možnost snadného rozšíření o další funkcionality (např. přidávání/odebírání položek)
  - Struktura umožňující jednoduché přidání dalších polí nebo vztahů
- Optimalizace výkonu:
  - Efektivní načítání dat v jednom dotazu
  - Použití reaktivních proměnných pro optimalizaci re-renderování

#### 5.7 Editing existing order (/admin/order/[orderId])

- Editing existing order:
  - Loading details of specific order including related items
  - Option to edit all aspects of the order (date, status, payment details, delivery details etc.)
  - Display of order items with details about variants and menu
- Complex data operations:
  - Loading related data (order_items, variant_id, menu_id) in one query
  - Efficient update of all order components
- OrderItemDetail component:
  - Reusable component for displaying and editing order details
  - Support for editing billing and shipping information
- Supabase integration:
  - Use of complex queries for efficient data loading
  - Updating order in database
- Error handling:
  - Detailed error logging during data loading and saving
  - User-friendly display of error messages
- User interface:
  - Responsive design using Tailwind CSS and DaisyUI
  - Animations for smooth transitions (fly, fade)
  - Confirmation messages for successful operations
- Date manipulation:
  - Formatting dates for display and storage
  - Validation of input dates
- Sum calculations:
  - Calculation of total price and quantity of items in the order
- Navigation:
  - Option to return to order list
  - Redirection after successful order deletion
- Security:
  - Verification of order existence before loading details
  - Access control to API endpoints (implemented in server.ts)
- Flexibility:
  - Possibility of easy extension with additional functionalities (e.g. adding/removing items)
  - Structure allowing easy addition of further fields or relationships
- Performance optimization:
  - Efficient data loading in one query
  - Use of reactive variables to optimize re-rendering

#### 5.8 Správa textového obsahu (/admin/text)

- Editor textového obsahu:
  - Možnost vytváření a editace textů pro různé stránky webu
  - Podpora pro formátovaný text s využitím WYSIWYG editoru (cl-editor)
  - Správa textů pro různé sekce webu (hlavní stránka, jídelníček)
- Dynamické načítání komponent:
  - Asynchronní import editoru na klientské straně pro optimalizaci výkonu
- Správa pozic textů:
  - Možnost umístění textů na specifické pozice na hlavní stránce (levá, střed, pravá)
  - Kontrola obsazenosti pozic a prevence konfliktů
- Validace formuláře:
  - Kontrola povinných polí před odesláním
  - Specifická validace pro různé typy stránek (např. povinný nadpis pro hlavní stránku)
- Integrace s Supabase:
  - Načítání existujících textů z databáze
  - Ukládání nových a aktualizace existujících textů
- Uživatelské rozhraní:
  - Responsivní design s využitím Tailwind CSS a DaisyUI
  - Dynamické zobrazování formulářových polí podle vybrané stránky
  - Přepínání mezi existujícími texty a vytvářením nových
- Stavová logika:
  - Správa stavu načítání během ukládání textů
  - Reaktivní aktualizace UI při změnách dat
- Ošetření chyb:
  - Zobrazení chybových zpráv při neúspěšném uložení
  - Logování chyb na straně serveru
- Typová bezpečnost:
  - Využití TypeScript pro definici typů (Text, OccupiedPosition, LoadData)
- Server-side zpracování:
  - Validace a zpracování dat na straně serveru
  - Ochrana proti neautorizovanému přístupu
- Flexibilita:
  - Možnost snadného přidání nových typů stránek nebo pozic
  - Struktura umožňující rozšíření funkcionality editoru
- Optimalizace výkonu:
  - Využití SvelteKit actions pro efektivní zpracování formulářů
  - Podmíněné renderování komponent

#### 5.8 Text content management (/admin/text)

- Text content editor:
  - Option to create and edit texts for various website pages
  - Support for formatted text using WYSIWYG editor (cl-editor)
  - Management of texts for different website sections (main page, menu)
- Dynamic component loading:
  - Asynchronous import of editor on client side for performance optimization
- Text position management:
  - Option to place texts in specific positions on main page (left, center, right)
  - Checking position occupancy and preventing conflicts
- Form validation:
  - Checking required fields before submission
  - Specific validation for different page types (e.g. required title for main page)
- Supabase integration:
  - Loading existing texts from database
  - Saving new and updating existing texts
- User interface:
  - Responsive design using Tailwind CSS and DaisyUI
  - Dynamic display of form fields based on selected page
  - Switching between existing texts and creating new ones
- State logic:
  - Managing loading state during text saving
  - Reactive UI updates when data changes
- Error handling:
  - Displaying error messages on unsuccessful save
  - Logging errors on server side
- Type safety:
  - Use of TypeScript for type definition (Text, OccupiedPosition, LoadData)
- Server-side processing:
  - Validation and processing of data on server side
  - Protection against unauthorized access
- Flexibility:
  - Possibility of easy addition of new page types or positions
  - Structure allowing extension of editor functionality
- Performance optimization:
  - Use of SvelteKit actions for efficient form processing
  - Conditional rendering of components

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

### 6. User Profile (/profile)

- Authentication and Authorization:
  - Checking user login before loading the page
  - Redirecting to the main page if the user is not logged in
- Profile Display and Editing:
  - Loading user profile from Supabase database
  - Form for editing personal data (name, surname, phone, address, etc.)
  - Option for expanded display of additional information (Company ID, VAT ID, company name)
- Order Display:
  - Loading user orders from Supabase database
  - Sorting orders from newest
  - Detailed display of order items including menu and variants
- Interactive UI:
  - Option to expand/collapse order details
  - Animations for UI element interactions
  - Responsive design for various screen sizes
- Form Processing:
  - Using SvelteKit actions for form processing
  - Protection against CSRF attacks
  - Server-side validation of input data
- State Logic:
  - Using Svelte stores for form state management
  - Reactive UI updates when data changes
- Performance Optimization:
  - Lazy loading of components
  - Efficient DOM updates when data changes
- Error Handling:
  - Logging errors when loading data from database
  - Displaying error messages to user on unsuccessful profile update
- Data Structure:
  - Complex database queries to retrieve related data (orders, order items, menu)
  - Processing and structuring data for efficient display (e.g., grouping order items by date)
- Security:
  - Using prepared statements for database queries
  - Verifying user identity before making changes to the profile
- UX Improvements:
  - Formatting data (e.g., order date) for better readability
  - Clear display of order history with option to view details

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

### 7. Login and Registration (/login, /signup)

- User Registration:
  - Form for creating a new account with fields for email and password
  - Validation of password match and confirmation
  - Integration with Supabase for new user registration
- Social Login:
  - Option to register using Google account
  - Implementation of OAuth flow for Google
- Security:
  - Minimum password length (6 characters)
  - Password hashing before storing in database (handled by Supabase)
  - Use of HTTPS for secure data transfer
- User Interface:
  - Responsive design using Tailwind CSS
  - Visual feedback for users (icons, shading)
  - Loading indication during registration process
- Form Processing:
  - Use of SvelteKit actions for server-side form processing
  - Protection against CSRF attacks
- Error Handling:
  - Display of error messages on unsuccessful registration
  - Handling cases where email is already registered
- Email Confirmation:
  - Sending confirmation email after successful registration
  - Information for users about the need to confirm email
- User Roles:
  - Assigning default "customer" role to new user
- Navigation:
  - Link to login page for existing users
- SEO Optimization:
  - Setting title and meta description for the page
- Accessibility:
  - Use of semantic HTML elements
  - Clear labels for input fields
- Backend Service Integration:
  - Use of Supabase for authentication and user management
- Input Validation:
  - Checking email format using HTML5 pattern attribute
  - Server-side validation of password match
- Logging:
  - Console logging for debugging (can be removed in production)

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

### 8. Password Reset (/reset)

- Password Change:
  - Form for entering new password
  - Validation of new password match and confirmation
  - Integration with Supabase for updating user's password
- Security:
  - Minimum password length (6 characters)
  - Check if new password is not the same as the old one
  - Use of HTTPS for secure data transfer
- User Interface:
  - Responsive design using Tailwind CSS
  - Visual feedback for users (lock icon, shading)
  - Submit button with loading indication
- Form Processing:
  - Use of SvelteKit actions for server-side form processing
  - Protection against CSRF attacks
- Error Handling:
  - Detailed processing of various error states (invalid password, same password, invalid request)
  - User-friendly error messages
- State Logic:
  - Loading indication during password change
  - Display of successful/unsuccessful password change
- Navigation:
  - Option for redirection after successful password change (prepared but commented out)
- SEO Optimization:
  - Setting title and meta description for the page
- Accessibility:
  - Use of semantic HTML elements
  - Clear labels for input fields
- Performance:
  - Minimal use of external dependencies
  - Efficient DOM updates on state changes
- Backend Service Integration:
  - Use of Supabase for authentication and user management
- Input Validation:
  - Client-side check for minimum password length
  - Additional server-side validation

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

### 9. Forgotten Password Recovery (/forgot)

- Password Recovery Function:
  - Form for entering user's email
  - Integration with Supabase for generating password reset link
  - Distinction between customers and profiles when processing reset request
- Security:
  - Use of Supabase Admin client for generating secure password reset links
  - Verification of user existence before sending password reset email
  - Use of HTTPS for secure data transfer
- Email Service:
  - Use of Nodemailer for sending emails
  - SMTP configuration for Seznam.cz service
  - Customized email templates for customers and profiles
- User Interface:
  - Responsive design using Tailwind CSS
  - Simple and clear form for email input
  - Visual feedback for users (icon, shading)
- Form Processing:
  - Use of SvelteKit actions for server-side form processing
  - Protection against CSRF attacks
- Error Handling:
  - Detailed processing of various error states
  - User-friendly error messages
- Security Recommendations:
  - Instructions for creating a strong password in reset email
- Logging:
  - Console logging for debugging (can be removed in production)
- SEO Optimization:
  - Setting title and meta description for the page
- Accessibility:
  - Use of semantic HTML elements
  - Clear labels for input fields
- Flexibility:
  - Easy customization of email templates
- Performance:
  - Asynchronous request processing for better application response

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

### 10. Processing Authentication Callbacks (/auth/callback)

- Processing Authentication Callbacks:
  - Handling various types of authentication callbacks (signup, recovery, OTP verification)
  - Support for OAuth flows (e.g., Google login)
- Security:
  - Processing and verification of token_hash to secure the authentication process
  - Use of code verifier for PKCE (Proof Key for Code Exchange) in OAuth flow
  - Secure redirection after successful or unsuccessful authentication
- Supabase Integration:
  - Use of Supabase auth methods for OTP verification and code exchange for session
  - Handling various authentication scenarios supported by Supabase
- Flexible Redirection:
  - Dynamic generation of URLs for redirection based on authentication type and result
  - Support for custom "next" URL parameter for flexible workflow
- Error Handling:
  - Detection and processing of errors during the authentication process
  - Redirection to error page with relevant information
- Support for Various Authentication Flows:
  - Processing of signup, account recovery, and OTP verification
  - Extensibility for additional authentication methods
- Debugging and Logging:
  - Extensive logging for easy debugging in development environment
  - Logging of key information such as full URL, cookies, code verifier, etc.
- Compatibility with SvelteKit:
  - Implemented as SvelteKit RequestHandler
  - Use of SvelteKit `redirect` function for efficient redirection
- Clean Code and Modularity:
  - Separation of logic for different authentication scenarios
  - Use of TypeScript for better type safety
- Flexibility and Extensibility:
  - Easy addition of new authentication methods or modification of existing ones
  - Possibility to customize error messages and redirections

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

### 11. Email Confirmation and OTP Verification (/auth/confirm)

- Processing of Confirmation Emails and One-Time Password (OTP) Verification:
  - Support for various EmailOtpType types defined by Supabase
- Security:
  - Use of token_hash for secure verification
  - Removal of sensitive parameters from URL after processing
- Flexible Redirection:
  - Support for custom "next" URL parameter
  - Dynamic generation of URL for redirection after successful verification
- Supabase Integration:
  - Use of Supabase auth.verifyOtp method for token_hash verification
- Error Handling:
  - Implicit error handling during verification
  - Redirection to profile page in case of error or missing parameters
- Clean Code:
  - Concise and efficient implementation
  - Use of TypeScript for better type safety
- Compatibility with SvelteKit:
  - Implemented as SvelteKit RequestHandler
  - Use of SvelteKit `redirect` function for efficient redirection
- Flexibility:
  - Easy extension for handling additional scenarios or verification types
- User Flow:
  - User is redirected to the requested page after successful verification
  - In case of error or incomplete data, user is redirected to the profile page
- Modularity:
  - Separate handler for email confirmation and OTP verification
  - Possibility of easy integration into larger authentication structure

## 🔧 Společné prvky

- Konzistentní navigace s responzivním menu
- Footer s důležitými odkazy a informacemi
- Optimalizace pro výkon a SEO
- Implementace správy stavu pomocí SvelteKit stores
- Typově bezpečný kód díky TypeScriptu

Projekt využívá pokročilé funkce SvelteKitu jako server-side rendering, API routes pro backend logiku a layout systém pro konzistentní strukturu stránek.

## 🔧 Common Elements

- Consistent navigation with responsive menu
- Footer with important links and information
- Optimization for performance and SEO
- State management implementation using SvelteKit stores
- Type-safe code thanks to TypeScript

The project utilizes advanced SvelteKit features such as server-side rendering, API routes for backend logic, and a layout system for consistent page structure.

## 📫 Kontakt

Pro více informací o projektu mě kontaktujte na info@malyleo.cz.

## 📫 Contact

For more information about the project, contact me at info@malyleo.cz.

## 🤝 Přispívání

Vítáme příspěvky! Pokud máte nápady na vylepšení nebo jste našli chybu, neváhejte otevřít issue nebo pull request.

## 🤝 Contributing

Contributions are welcome! If you have ideas for improvements or have found a bug, don't hesitate to open an issue or pull request.

## 📚 Další informace - Additional Information

- Table UI interface for items pages: https://tanstack.com/table/latest
- Google reCAPTCHA: https://www.google.com/recaptcha/about/
- Nodemailer: https://nodemailer.com/
- Google Maps API: https://developers.google.com/maps
- Supabase: https://supabase.io/
- OAuth 2.0 for Google Identity: https://developers.google.com/identity/protocols/oauth2
- PKCE (Proof Key for Code Exchange): https://oauth.net/2/pkce/
- One-Time Password (OTP): https://en.wikipedia.org/wiki/One-time_password
- cl-editor (WYSIWYG): https://github.com/ckeditor/ckeditor5

ver1_17102024
