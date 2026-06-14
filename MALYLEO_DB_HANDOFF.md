# Handoff: Přerod DB a změny logiky v `app.malyleo.cz` → dopad na eshop Šťastné srdce

> **Účel dokumentu:** Předat eshopu (tento projekt, `Stastne-srdce-1.0`) kompletní přehled
> o změnách v databázi a backend logice administrační aplikace `app.malyleo.cz`, se kterou
> eshop **sdílí jednu Supabase databázi**. Eshop vytváří objednávky přímo do této DB,
> proto ho zásadně ovlivnily bezpečnostní (RLS) migrace z června 2026.
>
> **Datum:** 2026-06-14 · **Zdroj:** repozitář `app.malyleo.cz`
> **Sdílená DB:** Supabase projekt „APP Maly Leo" (`orgshebezwfizhmlmeum`, eu-central-1, PostgreSQL 14.1)

---

## 0. TL;DR — co musí eshop udělat / ověřit

1. **Checkout objednávek funguje** přes RPC `create_order_with_items1` voláné jako `authenticated`.
   Po bezpečnostní fázi 2 byl grant odebrán, fáze **4d** ho vrátila. Pokud eshop hlásí
   `permission denied for function` → není nasazená migrace `20260613_sec_phase4d_fix_order_rpc_grant.sql`.
2. **Tenant context** (`set_tenant_context` / `get_current_tenant_id`) voláný přes **anon** klienta
   v `hooks.server.ts` — vrácen migrací fáze **4e**.
3. **Veřejné čtení** `site_settings`, menu grafu a `texts` pro anon — fáze **4b** a **4c**.
4. **Tajné klíče platební brány NEUKLÁDAT do `site_settings.payment`** — anon ho čte.
5. Notifikace o nové objednávce běží **automaticky** přes Database Webhook → edge funkci
   `notify-order-created` → `/api/order-notification` (řeší admin app, eshop nic nevolá).

---

## 1. Časová osa změn (červen 2026)

| Datum | Změna |
|-------|-------|
| **13. 6.** | Bezpečnostní audit DB (`ANALYZA_PROJEKTU.md`) — zjištěno, že RLS politiky měly `USING(true)` = žádná tenant izolace |
| **13. 6.** | Nasazení RLS migrací: fáze 2 (revoke), fáze 3 (helper + RLS na `tenants`), fáze 4 (tenant-scoped politiky) |
| **13. 6.** | Opravy kolizí s eshopem: fáze 4b–4e (anon čtení nastavení/menu, granty RPC pro checkout) |
| **13. 6.** | Indexy + sloupec `orders.deleted`, RPC `get_dashboard_stats`, tabulka `signup_tokens` |
| **14. 6.** | Nová tabulka `tenant_members` + přepis RLS helperů na model členství |
| **15. 6.** | Příprava odstranění legacy sloupce `profiles.accessible_tenant_ids` |
| **15. 6.** | Soft-delete `tenant_members` (`deleted_at`) + retenční purge přes cron; **RLS helpery nově vyžadují aktivní tenant** |

**Hlavní posun:** z `USING(true)` (kdokoli přihlášený viděl data všech tenantů) na
**tenant-scoped RLS** přes funkci `app_current_user_tenants()`, později založené na
tabulce `tenant_members`.

> ⚠️ **Důležité pro eshop (změna z 15. 6.):** RLS helpery (`app_current_user_tenants()`,
> `app_customer_tenant_ids()`) nyní filtrují přes `JOIN tenants ON status = 'active'` a
> `tenant_members.deleted_at IS NULL`. **Pokud je tenant „Šťastné srdce" pozastaven
> (`status <> 'active'`) nebo členství zákazníka soft-smazáno, přihlášený zákazník přes
> anon/authenticated klienta ztratí přístup k vlastním objednávkám** (RLS je odfiltruje).
> Operace přes service_role tím nejsou dotčené.

---

## 2. Integrační kontrakt eshopu se sdílenou DB

### 2.1 Vytvoření objednávky — RPC `create_order_with_items1`

Eshop volá tuto funkci jako **přihlášený (authenticated) zákazník** při checkoutu:

```ts
const { data, error } = await supabase.rpc('create_order_with_items1', {
  p_user_id: user.id,
  p_created_at: new Date().toISOString(),
  p_date: deliveryDate,
  p_customer_first_name: '...',
  p_customer_last_name: '...',
  p_customer_street: '...',
  p_customer_street_number: '...',
  p_customer_city: '...',
  p_customer_zip_code: '...',
  p_customer_telephone: '...',
  p_customer_email: '...',
  p_note: '...',
  p_total_pieces: 3,
  p_total_price: 450,
  p_currency: 'CZK',
  p_pay_state: false,
  p_shipping_method: 'delivery',
  p_tenant_id: PUBLIC_TENANT_ID,
  p_order_items: [ /* order_item_input[] */ ]
});
```

- Funkce je `SECURITY DEFINER` → běží jako owner, **obchází RLS** na `orders`/`order_items`.
- Generuje číslo objednávky přes `generate_order_number1(p_tenant_id)` (MAX+1 v rámci tenanta).
- Souběh je krytý unique constraintem `orders_order_number_tenant_unique (order_number, tenant_id)`.
  Při vzácném souběhu může druhý insert selhat → doporučen **retry na straně eshopu**.

#### Typ položky objednávky `order_item_input`

```sql
CREATE TYPE public.order_item_input AS (
    variant_id uuid,
    price      numeric,
    quantity   integer
);
```

> **Pozor na duplicity v DB:** existují `create_order_with_items` i `create_order_with_items1`
> a `generate_order_number` i `generate_order_number1`. Eshop používá **verze s „1"** (tenant-aware).
> Verze bez „1" jsou legacy a jsou kandidáti na `DROP` (viz `20260613_rpc_cleanup_notes.sql`).

### 2.2 Tenant context (legacy, ale stále vyžadováno)

Eshop v `hooks.server.ts` volá přes **anon** klienta pro každý nepřihlášený request:

```ts
await supabase.rpc('set_tenant_context', { tenant_id: PUBLIC_TENANT_ID });
```

- Funkce jen nastavuje transakční GUC `app.current_tenant_id`.
- **Nová RLS tuto GUC nepoužívá** (filtruje přes `auth.uid()`), takže jde o legacy zbytek.
  Přesto musí mít anon `EXECUTE` grant, jinak hook hází chybu → fáze **4e** ho vrací.

### 2.3 Veřejné čtení dat (anon klíč)

Po přepisu RLS smí anon číst jen vybrané věci:

| Data | Politika | Poznámka |
|------|----------|----------|
| `site_settings` | `site_settings_anon_public_read` | anon čte vše **kromě** klíčů `email` (SMTP) a `integrations` (Fakturoid) |
| menu graf (`menus`, `menu_versions`, `menu_variants`, `menu_allergens`, `menu_ingredients`, `menu_soups`, `soup_allergens`, `variant_allergens`, `variant_ingredients`) | `*_anon_read` | u `menus` jen `deleted IS NOT TRUE` |
| číselníky `allergens`, `ingredients`, `texts` | `*_anon_read` | veřejný obsah |

> ⚠️ **Bezpečnostní pravidlo:** tajný klíč online platební brány **neukládat** do
> `site_settings.payment` — anon ho čte. Držet ho mimo, nebo přidat `payment` do blacklistu politiky.

### 2.4 Notifikace o nové objednávce

Po `INSERT` do `orders` se notifikace řeší **automaticky** (eshop nic nevolá):

```
INSERT do orders
  → Supabase Database Webhook "Email Notification - New Order"
    → edge funkce notify-order-created (proxy)
      → POST /api/order-notification (admin app)
        → odeslání e-mailu dle site_settings.orders.notificationEmail
```

Podmínky odeslání: `site_settings.orders.sendOrderConfirmation = true` a vyplněný `notificationEmail`.

---

## 3. Datový model relevantní pro eshop

### Tabulka `orders` (klíčové sloupce)

```
id                  uuid (PK)
order_number        text NOT NULL        -- generováno per tenant
tenant_id           uuid                 -- PUBLIC_TENANT eshopu
user_id             uuid                 -- přihlášený zákazník
state               text                 -- "Nová", "Přijatá", ... (číselník v site_settings.orders.orderStates)
date                date                 -- datum doručení
created_at          timestamptz
updated_at          timestamptz
customer_*          text                 -- jméno, adresa, telefon, email zákazníka
delivery_*          text                 -- doručovací údaje
pay_method          text
pay_state           boolean
shipping_method     text
note                text
total_pieces        bigint
total_price         bigint
currency            text
fakturoid_data      jsonb                -- data faktury z Fakturoidu
deleted             boolean NOT NULL DEFAULT false   -- soft-delete (přidáno 13.6.)
```

### Tabulka `order_items`

```
id          uuid (PK)
order_id    uuid → orders.id
variant_id  uuid → menu_variants.id
price       numeric
quantity    integer
created_at  timestamptz
updated_at  timestamptz
```

### Tabulka `tenant_members` (nová, 14. 6.)

Nový model identity napříč admin appkou a eshopy:

```
id            uuid (PK)
user_id       uuid → auth.users
tenant_id     uuid → tenants
role          text  -- 'owner' | 'admin' | 'manager' | 'staff' | 'customer'
permissions   jsonb
deleted_at    timestamptz DEFAULT NULL   -- soft-delete (přidáno 15.6.); NULL = aktivní člen
UNIQUE (user_id, tenant_id)
```

- Zákazníci eshopu mají roli **`customer`**.
- **Soft-delete:** člen se „maže" nastavením `deleted_at`. Aktivní jsou jen záznamy s `deleted_at IS NULL`
  (částečný index `idx_tenant_members_active`). Soft-smazané záznamy starší než retenční doba
  (default 90 dní) tvrdě maže funkce `purge_soft_deleted_tenant_members(p_retention_days)`,
  kterou spouští denní cron (`/api/cron`, jen service_role).
- **RLS helpery berou jen aktivní členství v aktivním tenantu** — viz upozornění v kap. 1 a 4.
- Legacy sloupec `profiles.accessible_tenant_ids` (seznam admin přístupů) se má odstranit
  migrací `20260615_drop_legacy_accessible_tenant_ids.sql` — **až po ověření auditem**
  (`SELECT * FROM audit_tenant_members_sync() WHERE NOT in_sync;` musí být prázdné).

### Nastavení objednávek (`site_settings`, klíč `orders`)

```jsonc
{
  "enabled": true,
  "orderStates": [ { "name": "Nová", "color": "#0284c7" }, ... ],
  "notificationEmail": "admin@vasedomena.cz",
  "invoiceItemsMode": "detail"
}
```

---

## 4. RLS — jak nyní funguje izolace

- Helper `app_current_user_tenants()` vrací členství uživatele.
  Je `SECURITY DEFINER` s prázdným `search_path` → bypassuje RLS na `profiles` (žádná rekurze).
  **Aktuálně (od 15. 6.)** čte z `tenant_members` a vrací jen tenanty, kde:
  `deleted_at IS NULL` **A** `tenants.status = 'active'`:

```sql
SELECT array_agg(DISTINCT tm.tenant_id)
FROM public.tenant_members tm
JOIN public.tenants t ON t.id = tm.tenant_id AND t.status = 'active'
WHERE tm.user_id = auth.uid()
  AND tm.deleted_at IS NULL;
```

- Tenant-scoped politiky: `USING (tenant_id = ANY(app_current_user_tenants()))`.
- **Důsledek pro eshop:** pozastavení tenanta nebo soft-delete členství zákazníka =
  ztráta přístupu k datům přes uživatelský/anon klient (nikoli přes service_role).
- **Cross-tenant operace** (registrace, cron, embed, admin správa) běží přes **service_role**
  klienta (`PRIVATE_SBKey`), který RLS obchází (BYPASSRLS).
- Ověřeno: uživatel tenantu A nevidí data tenantu B (orders/profiles/menus/order_items/site_settings)
  a anon nečte citlivé tabulky.

---

## 5. Env proměnné

### Admin app (`app.malyleo.cz`) — pro kontext
- `PRIVATE_ALLOWED_ORIGINS` — CORS whitelist (vlastní domény tenantů pro embed)
- `PRIVATE_ORDER_NOTIFICATION_SECRET` — volitelné (funguje i přes service_role webhook)
- `PRIVATE_REGISTER_TENANT_SECRET` — registrace tenantů (fail-closed)

### Eshop (tento projekt)
- `PUBLIC_SUPABASE_URL` — sdílená Supabase instance
- `PUBLIC_SUPABASE_ANON_KEY` — anon klíč
- `PUBLIC_TENANT` (UUID tenanta „Šťastné srdce") — pro `set_tenant_context` a filtraci dat
- Authenticated session zákazníka pro checkout (RPC `create_order_with_items1`)

---

## 6. Seznam zdrojových souborů v `app.malyleo.cz`

Pokud potřebuješ originály, najdeš je v repozitáři admin aplikace na těchto cestách:

### Dokumentace
- `supabase/migrations/README.md` — **nejdůležitější**: pořadí migrací + vysvětlení kolizí s eshopem
- `ANALYZA_PROJEKTU.md` — kompletní bezpečnostní audit (RLS, duplicitní RPC, doporučení)
- `PLAN_OPRAV_ARCHITEKTURA.md` — plán refaktoru app vrstvy
- `PLAN_OPRAV_REGISTRACE.md` — dopad RLS na registraci + `tenant_members`
- `PLAN_OPTIMALIZACE_DOTAZU.md` — optimalizace dotazů na orders/menu
- `docs/BASELINE_ARCHITECTURE.md` — stav refaktoru
- `doc/02-architecture/database.md` — schéma a datové objekty
- `doc/02-architecture/multi-tenant.md` — ⚠️ částečně zastaralé (tvrdí, že RLS se nepoužívá)
- `doc/03-features/user-flows.md` — uživatelská flow včetně objednávek

### SQL migrace (pořadí aplikace)
**Objednávky / základ:**
- `supabase/migrations/20260317_soft_delete_orders.sql` — RPC `update_order_items` + typ `order_item_input_v2`
- `supabase/migrations/20260613_orders_indexes_and_deleted.sql` — `orders.deleted` + indexy
- `supabase/migrations/20260613_dashboard_stats_rpc.sql` — RPC `get_dashboard_stats`
- `supabase/migrations/20260613_rpc_cleanup_notes.sql` — poznámky k duplicitním RPC

**Bezpečnost (fáze 2–4, kritické pro eshop):**
- `20260613_sec_phase2_rpc_revoke.sql`
- `20260613_sec_phase3_rls_helper_tenants.sql`
- `20260613_sec_phase4_rls_policies.sql`
- `20260613_sec_phase4b_site_settings_anon_read.sql` — **eshop**
- `20260613_sec_phase4c_menu_texts_anon_read.sql` — **eshop**
- `20260613_sec_phase4d_fix_order_rpc_grant.sql` — **eshop**
- `20260613_sec_phase4e_restore_anon_tenant_context.sql` — **eshop**
- (každá fáze má `*_rollback.sql`)

**Identita / členství:**
- `20260614_tenant_members.sql` — tabulka + helpery + sync trigger
- `20260614_rls_tenant_members.sql`
- `20260615_tenant_members_soft_delete.sql` — `deleted_at`, retenční purge, **RLS helpery vyžadují aktivní tenant**
- `20260615_drop_legacy_accessible_tenant_ids.sql` — až po auditu
- `20260613_signup_tokens.sql` — tabulka pro potvrzovací tokeny
- `scripts/audit-tenant-members.sql` — audit před drop legacy sloupce

### Referenční schéma
- `zaloha_DB/schema.sql` — kompletní DDL (RPC `create_order_with_items1`, `order_item_input`, `orders`)
- `backups/backup_20251215_034437.sql` — nejnovější záloha (baseline kandidát)
- `src/lib/types/database.types.ts` — TypeScript typy

### App logika (objednávky / eshop)
- `src/routes/api/order-notification/+server.ts` — webhook endpoint pro e-mail
- `src/routes/api/orders/+server.ts` — API pro embed formulář (jiná cesta než eshop RPC)
- `supabase/functions/notify-order-created/index.ts` — edge proxy
- `src/lib/services/eshopSettingsService.ts` — načítání `site_settings` (`orders`, `eshop`, `doprava`)
- `src/lib/constants/defaultSettings.ts` — výchozí struktura `orders`/`eshop`
- `src/lib/data/tenantDataAccess.ts` — centralizovaný tenant filtr
- `src/lib/services/tenantMembersService.ts` — správa členství + soft-delete + `purgeSoftDeletedTenantMembers()`
- `src/routes/api/cron/+server.ts` — denní cron (expirace balíčků + retenční purge členství)

---

## 7. Doporučené pořadí čtení pro eshop tým

```
1. Tento dokument (kapitoly 0–4)         ← integrační checklist
2. supabase/migrations/README.md         ← detail kolizí a env
3. zaloha_DB/schema.sql (RPC + orders)   ← přesný kontrakt create_order_with_items1
4. 20260614_tenant_members.sql           ← nový model členství
5. ANALYZA_PROJEKTU.md sekce 5 + 1.5     ← proč se měnila RLS
```

---

## 8. Otevřené body / rizika

1. **Baseline migrace celého schématu ještě chybí** — README admin appky to vede jako TODO
   (`supabase db dump` nebo použít zálohu `backups/backup_20251215_034437.sql`).
2. `doc/02-architecture/multi-tenant.md` je z 2024 a popisuje stav „RLS se nepoužívá" —
   **to už neplatí**. Aktuální pravda je v migracích a `ANALYZA_PROJEKTU.md`.
3. `20260615_drop_legacy_accessible_tenant_ids.sql` spouštět až po prázdném výsledku auditu.
4. Tajné klíče platební brány nikdy do `site_settings.payment` (anon read).
5. Při tvorbě objednávky počítat s možným souběhem čísel objednávek → retry logika.
6. **Stav tenanta a členství řídí přístup zákazníka:** pokud admin pozastaví tenant
   (`status <> 'active'`) nebo soft-smaže členství zákazníka (`tenant_members.deleted_at`),
   zákazník eshopu přes svůj login ztratí přístup k objednávkám (RLS). Eshop by měl tento
   stav ošetřit (např. srozumitelná hláška místo prázdného výpisu / chyby).
