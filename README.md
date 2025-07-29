# 🍽️ Šťastné srdce

Webová aplikace pro správu a objednávání jídel s automatickým verzováním a deploymentem.

## 🛠️ Technologie

- **Frontend**: SvelteKit, TypeScript
- **Backend**: Supabase
- **Styling**: TailwindCSS, DaisyUI
- **Deployment**: Vercel
- **Verzování**: GitHub Actions + automatické bumpování
- **Email Service**: Nodemailer
- **Maps**: Google Maps
- **Security**: Google reCAPTCHA v3
- **Authentication**: OAuth (Google), Supabase Auth, OTP
- **Text Editor**: cl-editor (WYSIWYG)
- **Fakturace**: Fakturoid API s Circuit Breaker pattern

## 🌟 Klíčové funkce

- **Automatické verzování** - GitHub Actions s commit hashem
- **Správa denního menu** - 4 týdny dopředu s dynamickým časováním
- **Objednávkový systém** - kompletní workflow od košíku po fakturu
- **Administrační rozhraní** - správa jídel, objednávek, zákazníků a textů
- **Responzivní design** - mobilní i desktopové zařízení
- **Automatizované notifikace** - emailové upozornění
- **Kontaktní formulář** - s ochranou proti spamu
- **Uživatelský profil** - historie objednávek a správa údajů
- **Bezpečný systém** - resetování hesla, OTP verifikace
- **Sociální přihlášení** - Google OAuth
- **Fakturoid integrace** - automatické vytváření faktur s resilientní architekturou
- **Site settings** - kompletní správa vzhledu a obsahu webu

## 🔄 Automatické verzování

### Workflow systémy

1. **Release workflow** (`.github/workflows/release.yml`)
   - Spouští se při push do `main` větve
   - Automaticky zvyšuje verzi (patch)
   - Přidává GitHub commit hash
   - Aktualizuje footer s novou verzí
   - Deploy na Vercel

2. **Development workflow** (`.github/workflows/dev-deploy.yml`)
   - Spouští se při push do `develop`/`dev` větve
   - Nezvýšuje verzi v `package.json`
   - Vytváří dev verzi s hashem
   - Deploy na Vercel

3. **Manual release** (`.github/workflows/manual-release.yml`)
   - Manuální spuštění z GitHub Actions
   - Výběr typu zvýšení (patch/minor/major)
   - Kompletní release proces

### Verzovací formát

```
Lokální vývoj: core1.1.0-local
Produkce: core1.1.1-a1b2c3d
Development: core1.1.0-dev-a1b2c3d
```

## 📄 Popis stránek

### 1. Úvodní stránka (/)
- Prezentuje hlavní informace o službě
- Responzivní design s Tailwind CSS
- Animované prvky pro lepší UX
- Dynamický obsah z databáze

### 2. Jídelníček (/obedy)
- **Dynamické časové rozmezí**:
  - Do 17:00: objednávka na další den
  - Po 17:00: objednávka napozítří
  - Zobrazení: 4 týdny dopředu
- **Struktura menu**:
  - Polévka + varianty hlavních jídel
  - Alergeny a ingredience
  - Ceny a popisy
- **Uživatelské rozhraní**:
  - Týdenní záložky
  - Přidávání do košíku
  - Responzivní design

### 3. Košík (/kosik)
- **Zobrazení položek** s detaily (datum, polévka, menu, počet, cena)
- **Úprava množství** a odstranění položek
- **Výpočet celkové ceny** a počtu kusů
- **Zpracování objednávky**:
  - Vytvoření v Supabase
  - Emailová notifikace
  - Propojení s uživatelským účtem
- **Emailová služba** s Nodemailer a SMTP (Seznam.cz)

### 4. Kontakt (/kontakt)
- **Kontaktní formulář** s validací
- **Google reCAPTCHA v3** pro ochranu proti spamu
- **Emailová služba** s Nodemailer
- **Google Maps** integrace
- **Firemní údaje** (adresa, IČO, DIČ)

### 5. Administrační rozhraní (/admin)

#### 5.1 Správa zákazníků (/admin/customer)
- **Seznam zákazníků** s paginací (20 na stránku)
- **Vyhledávání** podle jména, emailu, telefonu, adresy
- **Řazení** podle data registrace
- **Detail zákazníka** s možností editace
- **Vytvoření nového zákazníka**

#### 5.2 Správa menu (/admin/menu)
- **Seznam menu** s paginací (10 na stránku)
- **Vyhledávání** podle polévky a variant
- **CRUD operace** pro položky menu
- **Tag Selector** pro alergeny a ingredience
- **TanStack Table** pro pokročilé filtrování

#### 5.3 Vytváření nového menu (/admin/menu/newmenu)
- **Formulář** pro vytvoření menu
- **Komponenta MenuItemDetail** pro editaci
- **Správa variant** s cenami a popisy
- **Alergeny a ingredience** s tag systémem

#### 5.4 Editace existujícího menu (/admin/menu/[menuId])
- **Načítání detailů** včetně souvisejících dat
- **Soft delete** implementace
- **Komplexní datové operace** v jedné transakci
- **Verzování menu** (připraveno pro budoucí rozšíření)

#### 5.5 Správa objednávek (/admin/order)
- **Seznam objednávek** s paginací (20 na stránku)
- **Vyhledávání** podle jména, emailu, čísla objednávky
- **Detail objednávky** s možností editace
- **Fakturoid integrace** pro vytváření faktur

#### 5.6 Vytváření nové objednávky (/admin/order/neworder)
- **Formulář** pro vytvoření objednávky
- **Komponenta OrderItemDetail** pro editaci
- **Automatické přiřazení** uživatele
- **Validace** vstupních dat

#### 5.7 Editace existující objednávky (/admin/order/[orderId])
- **Načítání detailů** včetně položek
- **Komplexní datové operace**
- **Kalkulace součtů** ceny a množství
- **Fakturoid integrace**

#### 5.8 Správa textového obsahu (/admin/text)
- **WYSIWYG editor** (cl-editor)
- **Dynamické načítání** komponent
- **Správa pozic** textů na stránkách
- **Validace formuláře** podle typu stránky

### 6. Profil uživatele (/profile)
- **Autentizace a autorizace** s kontrolou přihlášení
- **Zobrazení a úprava profilu** s osobními údaji
- **Historie objednávek** s detaily
- **Interaktivní UI** s animacemi
- **Formátování dat** pro lepší čitelnost

### 7. Přihlášení a registrace (/auth)
- **Registrace uživatele** s validací
- **Sociální přihlášení** přes Google OAuth
- **Bezpečnost** s minimální délkou hesla
- **Potvrzení emailu** s OTP verifikací
- **Přiřazení role** "customer" novým uživatelům

### 8. Resetování hesla (/auth/forgot, /auth/reset)
- **Obnovení hesla** s bezpečným odkazem
- **Emailová služba** s Nodemailer
- **Rozlišení** mezi zákazníky a profily
- **Bezpečnostní doporučení** v emailu

### 9. Autentizační callbacky (/auth/callback, /auth/confirm)
- **Zpracování OAuth** callbacků
- **OTP verifikace** s token_hash
- **Flexibilní přesměrování** podle typu autentizace
- **PKCE** (Proof Key for Code Exchange) podpora

## 🔧 Fakturoid API Integration - Resilientní architektura

### Circuit Breaker Pattern
- **Automatická ochrana** před kaskádovými selháními
- **Stavy**: CLOSED → OPEN → HALF_OPEN
- **Self-healing** mechanismus s automatickým obnovením
- **Konfigurace**: 5 selhání před otevřením, 60s recovery timeout

### Exponential Backoff s Retry Logikou
- **Inteligentní retry** s exponenciálním zvyšováním delay
- **Jitter** pro prevenci "thundering herd" problému
- **Non-retryable error detection** (401, 403, 404, 422)
- **Konfigurace**: 3 pokusy, 1-30s delay

### Health Check Endpoint
- **Monitoring stavu** systému (`/api/fakturoid/health`)
- **Detailní diagnostika** s metrikami
- **Automatická doporučení** na základě health metrik
- **HTTP status kódy** dle stavu (200 healthy, 503 unhealthy)

### Token Management
- **Globální přístup** k tokenům
- **Proaktivní refresh** 60 minut před expirací
- **Resilientní refresh** s Circuit Breaker + Exponential Backoff
- **Automatický cleanup** neplatných refresh tokenů

## 🔧 Společné prvky

- **Konzistentní navigace** s responzivním menu
- **Footer** s verzí a důležitými odkazy
- **Optimalizace** pro výkon a SEO
- **Správa stavu** pomocí SvelteKit stores
- **Typově bezpečný kód** díky TypeScriptu
- **Server-side rendering** pro lepší SEO

## 🚀 Deployment a verzování

### GitHub Secrets/Variables
- `VERCEL_TOKEN` (secret) - token pro Vercel API
- `VERCEL_PROJECT_ID` (variable) - ID Vercel projektu
- `GITHUB_TOKEN` (automaticky) - pro GitHub API

### Lokální vývoj
```bash
npm run dev  # core1.1.0-local
npm run build  # pro produkci
```

### Automatické deployment
- **Push do main** → automatický release + deploy
- **Push do develop** → dev deploy s hash
- **Manual release** → výběr typu zvýšení verze

## 📫 Kontakt

Pro více informací o projektu mě kontaktujte na info@malyleo.cz.

## 🤝 Přispívání

Vítáme příspěvky! Pokud máte nápady na vylepšení nebo jste našli chybu, neváhejte otevřít issue nebo pull request.

## 📚 Další informace

- **Table UI**: https://tanstack.com/table/latest
- **Google reCAPTCHA**: https://www.google.com/recaptcha/about/
- **Nodemailer**: https://nodemailer.com/
- **Google Maps API**: https://developers.google.com/maps
- **Supabase**: https://supabase.io/
- **OAuth 2.0**: https://developers.google.com/identity/protocols/oauth2
- **PKCE**: https://oauth.net/2/pkce/
- **cl-editor**: https://github.com/ckeditor/ckeditor5

## 📋 Supabase Storage Configuration

### Vytvoření Storage Bucket

Pro správné fungování nahrávání souborů v site-setting sekci:

1. **Vytvoření bucket**:
   - Supabase Dashboard → Storage → Buckets
   - Nový bucket: `site-assets` (public)

2. **RLS (Row Level Security)**:
   ```sql
   -- Nahrávání pouze autentizovaným administrátorům
   CREATE POLICY "Allow authenticated users to upload site assets" ON storage.objects
   FOR INSERT TO authenticated
   WITH CHECK (bucket_id = 'site-assets');

   -- Čtení všem uživatelům
   CREATE POLICY "Allow public access to site assets" ON storage.objects
   FOR SELECT TO public
   USING (bucket_id = 'site-assets');

   -- Smazání pouze autentizovaným administrátorům
   CREATE POLICY "Allow authenticated users to delete site assets" ON storage.objects
   FOR DELETE TO authenticated
   USING (bucket_id = 'site-assets');
   ```

3. **Struktura souborů**:
   ```
   site-assets/
   └── uploads/
       ├── logo-[timestamp].png
       ├── favicon-[timestamp].ico
       └── ...
   ```

### Použití Upload funkce

V site-setting sekci "Vzhled":
- **Maximální velikost**: 2MB
- **Podporované formáty**: PNG, JPG, SVG, ICO
- **Automatické uložení** do Supabase Storage
- **Automatické vložení URL** do nastavení

---

**Verze**: core1.1.0-dev (automatické verzování aktivní)
