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
- Zobrazuje aktuální denní menu 
- Umožňuje filtrování jídel podle různých kritérií (vegetariánské, alergenů atd.)
- Každé jídlo má detailní popis, cenu a možnost přidat do košíku
- Používá komponenty z DaisyUI pro konzistentní vzhled

### 3. Košík (/kosik)
- Přehled vybraných jídel s možností úpravy množství nebo odstranění
- Výpočet celkové ceny objednávky
- Formulář pro zadání dodacích údajů
- Možnost platby online nebo při doručení

### 4. Kontakt (/kontakt)
- Kontaktní informace restaurace
- Mapa s lokací
- Kontaktní formulář pro dotazy zákazníků

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
- Zobrazení a úprava osobních údajů
- Historie objednávek
- Možnost změny hesla

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
