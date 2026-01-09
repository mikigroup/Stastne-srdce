# Multi-Tenant Architektura - Implementační plán (Jedna databáze s tenant_id)

## 📋 Přehled

Transformace současné single-tenant SvelteKit aplikace na multi-tenant řešení s podporou více klientských domén. **Všichni klienti sdílí jednu Supabase databázi s tenant_id izolací.**

### Princip fungování
```
klient1.cz/admin → proxy → vas-projekt.vercel.app/admin → Supabase DB (tenant_id = 'klient1')
klient2.cz/admin → proxy → vas-projekt.vercel.app/admin → Supabase DB (tenant_id = 'klient2')
klient3.cz/admin → proxy → vas-projekt.vercel.app/admin → Supabase DB (tenant_id = 'klient3')
```

- **Jeden SvelteKit projekt** na Vercelu
- **Jeden Supabase projekt** s tenant izolací
- **Rozpoznání klienta** podle Host headeru
- **Row Level Security (RLS)** pro izolaci dat
- **Dynamické nastavení tenant contextu** v databázi
- **Transparentní** pro koncové uživatele

---

## 📊 Analýza současného stavu

### Aktuální architektura:
- **SvelteKit** aplikace s **jednou Supabase** databází
- **Single-tenant** design - všechna data v jedné DB
- Autentifikace přes jednu Supabase Auth instanci
- Admin sekce na `/admin/*` routes
- Fakturoid integrace pro fakturaci

### Nová architektura:
- **SvelteKit** aplikace s **jedním Supabase** projektem
- **Multi-tenant** design - všichni klienti sdílí jednu DB s tenant_id izolací
- **Mapování domén** → tenant konfigurace
- **Row Level Security** pro automatickou izolaci dat

### Co je potřeba změnit:
1. **Databáze** - přidat tenant_id sloupce a RLS policies
2. **Mapování** - domain → tenant konfigurace
3. **Hooks** - rozpoznání domény a nastavení tenant contextu
4. **Služby** - upravit pro tenant-aware dotazy
5. **Route handlers** - ověření tenant přístupu

---

## 🎯 Implementační kroky

### **FÁZE 1: Databázové změny a tenant struktura (1 den)**

#### Krok 1.1: Vytvoření tabulky tenants
```sql
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    settings JSONB DEFAULT '{}',
    features JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted'))
);

-- Indexy pro rychlé vyhledávání
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_domain ON tenants(domain);
CREATE INDEX idx_tenants_status ON tenants(status);
```

#### Krok 1.2: Přidání tenant_id sloupce do existujících tabulek
```sql
-- Přidat tenant_id do všech relevantních tabulek
ALTER TABLE profiles ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE menus ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE orders ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE customers ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE site_settings ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE fakturoid_tokens ADD COLUMN tenant_id UUID REFERENCES tenants(id);

-- Vytvořit indexy pro tenant_id
CREATE INDEX idx_profiles_tenant_id ON profiles(tenant_id);
CREATE INDEX idx_menus_tenant_id ON menus(tenant_id);
CREATE INDEX idx_orders_tenant_id ON orders(tenant_id);
CREATE INDEX idx_customers_tenant_id ON customers(tenant_id);
CREATE INDEX idx_site_settings_tenant_id ON site_settings(tenant_id);
CREATE INDEX idx_fakturoid_tokens_tenant_id ON fakturoid_tokens(tenant_id);
```

#### Krok 1.3: Vytvoření default tenanta a migrace dat
```sql
-- Vytvořit default tenant pro existující data
INSERT INTO tenants (slug, name, domain, features, settings) 
VALUES (
    'stastnesrdce', 
    'Šťastné srdce', 
    'stastnesrdce.cz',
    '{"fakturoid": true, "loyalty": true, "allergens": true}',
    '{"theme": "default", "currency": "CZK"}'
);

-- Migrovat existující data k default tenantovi
DO $$
DECLARE
    default_tenant_id UUID;
BEGIN
    SELECT id INTO default_tenant_id FROM tenants WHERE slug = 'stastnesrdce';
    
    UPDATE profiles SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE menus SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE orders SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE customers SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE site_settings SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE fakturoid_tokens SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
END $$;
```

#### Krok 1.4: Row Level Security (RLS)
```sql
-- Enable RLS na všech tabulkách
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE fakturoid_tokens ENABLE ROW LEVEL SECURITY;

-- RLS policies pro každou tabulku
CREATE POLICY "Tenant isolation - profiles" ON profiles
    FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Tenant isolation - menus" ON menus
    FOR ALL USING (tenant_id = get_current_tenant_id());

-- ... podobně pro ostatní tabulky
```

---

### **FÁZE 2: TypeScript typy a tenant struktura (0.5 dne)**

#### Krok 2.1: Rozšíření app.d.ts
```typescript
interface Locals {
  // ... existující
  tenant: Tenant | null;
  // Tenant context je nastaven v databázi
}
```

#### Krok 2.2: Tenant typy
```typescript
// src/lib/types/tenant.ts
export interface Tenant {
  id: string;
  slug: string;
  name: string;
  domain: string;
  created_at: string;
  updated_at: string;
  settings: Record<string, any>;
  features: {
    fakturoid?: boolean;
    loyalty?: boolean;
    allergens?: boolean;
  };
  status: 'active' | 'suspended' | 'deleted';
}

export interface TenantConfig {
  id: string;
  slug: string;
  name: string;
  domain: string;
  features: Tenant['features'];
}
```

#### Krok 2.3: Database.types.ts aktualizace
- ✅ **AKTUALIZUJEME** database.types.ts pro nové tenant sloupce
- ✅ Přidáme tenant_id do všech relevantních tabulek
- ✅ Přidáme novou tabulku tenants

---

### **FÁZE 3: Tenant resolving a database context (1 den)**

#### Krok 3.1: Vytvoření tenantService.ts
```typescript
// src/lib/services/tenantService.ts
import { supabase } from '$lib/supabase';
import type { Tenant } from '$lib/types/tenant';

export class TenantService {
  static async getTenantByDomain(domain: string): Promise<Tenant | null> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('domain', domain)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error('Error fetching tenant:', error);
      return null;
    }

    return data;
  }

  static async setTenantContext(tenantId: string): Promise<void> {
    await supabase.rpc('set_tenant_context', { tenant_id: tenantId });
  }

  static hasFeature(tenant: Tenant, feature: string): boolean {
    return tenant.features?.[feature] === true;
  }
}
```

#### Krok 3.2: Úprava hooks.server.ts - tenant context
```typescript
const tenantResolver: Handle = async ({ event, resolve }) => {
  const host = event.request.headers.get('host');
  
  if (!host) {
    throw error(400, 'Host header required');
  }

  // Clean domain (remove www. prefix and port)
  const cleanDomain = host.replace(/^www\./, '').split(':')[0];
  
  try {
    // Get tenant by domain
    const tenant = await TenantService.getTenantByDomain(cleanDomain);
    
    if (!tenant) {
      throw error(400, `Unknown domain: ${cleanDomain}`);
    }

    // Set tenant context for database queries
    await TenantService.setTenantContext(tenant.id);
    
    // Add tenant to locals
    event.locals.tenant = tenant;
    
  } catch (tenantError) {
    console.error('Error resolving tenant:', tenantError);
    throw error(500, 'Error resolving tenant');
  }

  return resolve(event);
};

export const handle: Handle = sequence(supabase, tenantResolver, authGuard);
```

---

### **FÁZE 4: Úprava služeb pro tenant-aware dotazy (0.5 dne)**

#### Krok 4.1: MenuService - minimální změny
```typescript
// Funkce zůstávají stejné, tenant context je nastaven automaticky
export async function loadMenuList(
  supabase: SupabaseClient,
  options: LoadMenuOptions
) {
  // Tenant context je už nastaven v hooks.server.ts
  // RLS policies automaticky filtrují podle tenant_id
  return supabase.from('menus').select('*');
}
```

#### Krok 4.2: Ostatní služby - minimální změny
- ✅ `orderService.ts` - beze změn (RLS automaticky)
- ✅ `customerService.ts` - beze změn (RLS automaticky)
- ✅ `settingsService.ts` - beze změn (RLS automaticky)
- ✅ `fakturoidService.ts` - beze změn (RLS automaticky)

**Všechny služby fungují stejně, RLS automaticky izoluje data!**

#### Krok 4.3: RPC funkce - minimální změny
- ✅ RPC funkce zůstávají stejné
- ✅ Tenant context je nastaven automaticky
- ✅ Fungují na izolovaných datech díky RLS

---

### **FÁZE 5: Route handlers - tenant ověření (0.5 dne)**

#### Krok 5.1: Admin routes - ověření tenanta
```typescript
// src/routes/admin/menu/+page.server.ts
export const load: PageServerLoad = async ({ locals: { supabase, session, tenant } }) => {
  if (!tenant) {
    throw error(400, 'Unknown domain');
  }
  
  // Tenant context je už nastaven, RLS automaticky izoluje data
  const menus = await loadMenuList(supabase, options);
  
  return {
    menus,
    tenantInfo: tenant, // Pro zobrazení názvu klienta v UI
    // ...
  };
};
```

#### Krok 5.2: Public routes - tenant ověření
- ✅ `/obedy/+page.server.ts` - funguje stejně (RLS automaticky)
- ✅ `/kosik/+page.server.ts` - funguje stejně (RLS automaticky)
- ✅ Všechny route handlers fungují stejně díky RLS!

---

### **FÁZE 6: Testování a bezpečnost (1.5 dne)**

#### Krok 6.1: Bezpečnostní kontroly
- [ ] Ověření, že doména A nevidí data domény B (RLS testy)
- [ ] Test neznámé domény (error handling)
- [ ] Validace tenant context nastavení
- [ ] Test RLS policies na všech tabulkách

#### Krok 6.2: Testovací prostředí
```sql
-- Vytvořit testovací tenanty
INSERT INTO tenants (slug, name, domain, features) VALUES 
('test', 'Test Tenant', 'localhost', '{"fakturoid": false, "loyalty": true}'),
('dev', 'Development', 'dev.local', '{"fakturoid": true, "loyalty": true}');
```

#### Krok 6.3: Test s více doménami
- [ ] Test localhost → test tenant data
- [ ] Test production doména → production tenant data
- [ ] Test neznámé domény → error
- [ ] Test RLS policies bypass pokusy

---

### **FÁZE 7: Deployment a dokumentace (1 den)**

#### Krok 7.1: Vercel konfigurace
- Všechny domény směřují na jeden projekt
- Correct Host header forwarding

#### Krok 7.2: Dokumentace pro klienty

**Nginx konfigurace:**
```nginx
server {
    server_name klient.cz;
    
    location / {
        root /var/www/klient.cz;
        try_files $uri $uri/ =404;
    }
    
    location /admin {
        proxy_pass https://vas-projekt.vercel.app/admin;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Path $request_uri;
    }
}
```

**Apache konfigurace:**
```apache
<VirtualHost *:443>
    ServerName klient.cz
    DocumentRoot /var/www/klient.cz
    
    ProxyPreserveHost On
    ProxyPass /admin https://vas-projekt.vercel.app/admin
    ProxyPassReverse /admin https://vas-projekt.vercel.app/admin
</VirtualHost>
```

---

## 🚨 Kritické body

### Bezpečnost:
- **VŽDY** testovat RLS policies na všech tabulkách
- **VŽDY** ověřit tenant context nastavení
- Validace tenant přístupu v každém route handleru
- Error handling pro neexistující tenenty
- Ochrana proti tenant confusion attacks
- Monitoring RLS policy violations

### Performance:
- Indexy na všechny `tenant_id` sloupce
- Composite indexy pro časté dotazy (tenant_id + další sloupce)
- Monitoring query performance s RLS
- Caching tenant informací

### Backwards compatibility:
- Migrace existujících dat k defaultnímu tenantovi
- Postupné nasazení bez výpadku služby
- Fallback mechanismy pro chyby v tenant resolving

---

## 📝 Kontrolní seznam

### Databáze
- [ ] Tabulka `tenants` vytvořena
- [ ] `tenant_id` sloupce přidány do všech tabulek
- [ ] RLS policies vytvořeny a otestovány
- [ ] Default tenant vytvořen a data migrována
- [ ] Database functions pro tenant context vytvořeny

### TypeScript
- [ ] `app.d.ts` rozšířen pro tenant info
- [ ] Tenant typy definovány (`tenant.ts`)
- [ ] Tenant mapování vytvořeno (`tenantMapping.ts`)

### Služby
- [ ] `tenantService.ts` implementován
- [ ] ✅ `menuService.ts` - minimální změny (RLS automaticky)
- [ ] ✅ `orderService.ts` - minimální změny (RLS automaticky)
- [ ] ✅ Ostatní služby - minimální změny (RLS automaticky)

### Routes
- [ ] `hooks.server.ts` upraven
- [ ] Admin routes aktualizovány
- [ ] Public routes aktualizovány

### Testování
- [ ] RLS policies testovány na všech tabulkách
- [ ] Tenant context nastavení ověřeno
- [ ] Izolace dat testována mezi tenanty
- [ ] Více domén testováno
- [ ] Bezpečnost ověřena
- [ ] Performance testy s RLS

### Deployment
- [ ] Vercel konfigurace
- [ ] Dokumentace pro klienty
- [ ] DNS nastavení ověřeno

---

## ⏱️ Časový odhad

| Fáze | Odhad | Popis |
|------|-------|-------|
| 1 | 1 den | Databázové změny + tenant struktura |
| 2 | 0.5 dne | TypeScript typy a tenant struktura |
| 3 | 1 den | Tenant resolving + database context |
| 4 | 0.5 dne | Úprava služeb pro tenant-aware dotazy |
| 5 | 0.5 dne | Route handlers - tenant ověření |
| 6 | 1.5 dne | Testování a bezpečnost |
| 7 | 1 den | Deployment |
| **Celkem** | **6 dní** | Kompletní implementace |

---

## 🔄 Doporučený postup

1. **Začít s databázovými změnami** - vytvořit tenant strukturu
2. **Implementovat tenant resolving** - hooks.server.ts 
3. **Testovat RLS policies** - ověřit izolaci dat
4. **Testovat s localhost** - ověřit tenant context
5. **Nasadit postupně** - domain po doméně

## 💰 **Výhody tohoto přístupu:**

- ✅ **Nízké náklady** - jeden Supabase projekt ($25/měsíc)
- ✅ **Jednoduchá správa** - jedna databáze
- ✅ **Cross-tenant analýzy** - možnost agregace dat
- ✅ **Automatická izolace** - RLS policies
- ✅ **Bezpečnost** - tenant context + RLS
- ✅ **Škálovatelnost** - snadné přidání nových tenantů
- ⚠️ **Složitější dotazy** - potřeba optimalizace
- ⚠️ **RLS závislost** - nutnost důkladného testování

---

## 📞 Kontakt a podpora

Pro otázky k implementaci nebo problémy během vývoje kontaktujte vývojový tým.

**Poslední aktualizace:** 2024-01-XX
**Verze dokumentu:** 2.0 (Jedna databáze s tenant_id) 