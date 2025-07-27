# Multi-Tenant Architektura - Implementační plán (Separátní databáze)

## 📋 Přehled

Transformace současné single-tenant SvelteKit aplikace na multi-tenant řešení s podporou více klientských domén. **Každý klient má vlastní Supabase databázi a auth.**

### Princip fungování
```
klient1.cz/admin → proxy → vas-projekt.vercel.app/admin → Supabase DB #1
klient2.cz/admin → proxy → vas-projekt.vercel.app/admin → Supabase DB #2
klient3.cz/admin → proxy → vas-projekt.vercel.app/admin → Supabase DB #3
```

- **Jeden SvelteKit projekt** na Vercelu
- **Rozpoznání klienta** podle Host headeru
- **Vlastní Supabase projekt** pro každého klienta (DB + Auth)
- **Dynamické připojení** k příslušné databázi podle domény
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
- **SvelteKit** aplikace s **mnoha Supabase** projekty
- **Multi-tenant** design - každý klient má vlastní DB + Auth
- **Mapování domén** → Supabase projekty
- **Dynamické připojení** k příslušné databázi

### Co je potřeba změnit:
1. **Mapování** - domain → Supabase projekt credentials
2. **Hooks** - rozpoznání domény a dynamické Supabase připojení
3. **Služby** - univerzální, ale s dynamickým Supabase klientem
4. **Route handlers** - předávání správného Supabase klienta

---

## 🎯 Implementační kroky

### **FÁZE 1: Mapování domén a Supabase projektů (0.5 dne)**

#### Krok 1.1: Vytvoření mapování domén
```typescript
// src/lib/tenantMapping.ts
export const TENANT_MAPPING = {
  'stastnesrdce.cz': {
    supabaseUrl: 'https://xxx.supabase.co',
    supabaseAnonKey: 'eyJ...',
    name: 'Šťastné srdce',
    clientId: 'stastnesrdce'
  },
  'klient1.cz': {
    supabaseUrl: 'https://yyy.supabase.co', 
    supabaseAnonKey: 'eyJ...',
    name: 'Klient 1',
    clientId: 'klient1'
  },
  // localhost pro development
  'localhost': {
    supabaseUrl: 'https://xxx.supabase.co',
    supabaseAnonKey: 'eyJ...',
    name: 'Development',
    clientId: 'dev'
  }
};
```

#### Krok 1.2: Vytvoření Supabase projektů pro každého klienta
- Vytvořit nové Supabase projekty pro každého klienta
- Zkopírovat databázové schéma do každého projektu
- Nastavit Auth pro každý projekt

#### Krok 1.3: Žádné databázové změny není potřeba!
- ❌ **NEPOTŘEBUJEME** tenant_id sloupce
- ❌ **NEPOTŘEBUJEME** tabulku tenants
- ❌ **NEPOTŘEBUJEME** RPC funkce pro tenant resolving
- ✅ Každý klient má čistou vlastní databázi

---

### **FÁZE 2: TypeScript typy (0.5 dne)**

#### Krok 2.1: Rozšíření app.d.ts
```typescript
interface Locals {
  // ... existující
  tenant: {
    clientId: string;
    domain: string;
    name: string;
    supabaseUrl: string;
    supabaseAnonKey: string;
  } | null;
  // Supabase klient bude dynamicky vytvořen podle tenanta
}
```

#### Krok 2.2: Tenant typy
```typescript
// src/lib/types/tenant.ts
export interface TenantConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  name: string;
  clientId: string;
}

export interface TenantMapping {
  [domain: string]: TenantConfig;
}
```

#### Krok 2.3: Database.types.ts zůstává stejný
- ❌ **NEMĚNÍME** database.types.ts
- ✅ Každý projekt má stejné schéma
- ✅ Žádné tenant_id sloupce

---

### **FÁZE 3: Tenant resolving a dynamické Supabase (1 den)**

#### Krok 3.1: Vytvoření tenantService.ts
```typescript
// src/lib/services/tenantService.ts
import { TENANT_MAPPING } from '$lib/tenantMapping';
import type { TenantConfig } from '$lib/types/tenant';

export function getTenantByDomain(domain: string): TenantConfig | null {
  // Odstranit www. prefix
  const cleanDomain = domain.replace(/^www\./, '');
  return TENANT_MAPPING[cleanDomain] || null;
}

export function createTenantSupabaseClient(tenantConfig: TenantConfig) {
  return createServerClient(
    tenantConfig.supabaseUrl, 
    tenantConfig.supabaseAnonKey,
    // ... options
  );
}
```

#### Krok 3.2: Úprava hooks.server.ts - dynamické Supabase
```typescript
const tenantResolver: Handle = async ({ event, resolve }) => {
  const host = event.request.headers.get('host');
  const tenant = getTenantByDomain(host);
  
  if (!tenant) {
    throw error(400, 'Unknown domain');
  }
  
  // Přepsat Supabase klienta pro tento tenant
  event.locals.supabase = createTenantSupabaseClient(tenant);
  event.locals.tenant = tenant;
  
  return resolve(event);
};

export const handle: Handle = sequence(tenantResolver, authGuard);
```

---

### **FÁZE 4: Služby zůstávají stejné! (0 dní)**

#### Krok 4.1: MenuService - ŽÁDNÉ změny
```typescript
// Funkce zůstávají stejné, jen dostanou jiný Supabase klient
export async function loadMenuList(
  supabase: SupabaseClient, // <- Tento klient už je pro správný tenant
  options: LoadMenuOptions
) {
  // Žádný .eq('tenant_id', tenantId) !!!
  // Prostě normální dotaz - data jsou už izolovaná v DB
  return supabase.from('menus').select('*');
}
```

#### Krok 4.2: Ostatní služby - ŽÁDNÉ změny
- ✅ `orderService.ts` - beze změn
- ✅ `customerService.ts` - beze změn  
- ✅ `settingsService.ts` - beze změn
- ✅ `fakturoidService.ts` - beze změn

**Všechny služby fungují stejně, jen dostávají správný Supabase klient!**

#### Krok 4.3: RPC funkce - ŽÁDNÉ změny
- ✅ RPC funkce zůstávají stejné
- ✅ Žádné tenant_id parametry
- ✅ Fungují na vlastní databázi každého klienta

---

### **FÁZE 5: Route handlers - minimální změny (0.5 dne)**

#### Krok 5.1: Admin routes - jen ověření tenanta
```typescript
// src/routes/admin/menu/+page.server.ts
export const load: PageServerLoad = async ({ locals: { supabase, session, tenant } }) => {
  if (!tenant) {
    throw error(400, 'Unknown domain');
  }
  
  // Supabase je už správný pro tento tenant!
  const menus = await loadMenuList(supabase, options);
  
  return {
    menus,
    tenantInfo: tenant, // Pro zobrazení názvu klienta v UI
    // ...
  };
};
```

#### Krok 5.2: Public routes - žádné změny
- ✅ `/obedy/+page.server.ts` - funguje stejně
- ✅ `/kosik/+page.server.ts` - funguje stejně
- ✅ Všechny route handlers fungují stejně!

---

### **FÁZE 6: Testování a bezpečnost (1 den)**

#### Krok 6.1: Bezpečnostní kontroly
- [ ] Ověření, že doména A nevidí data domény B
- [ ] Test neznámé domény (error handling)
- [ ] Validace, že se připojujeme ke správné DB

#### Krok 6.2: Testovací prostředí
```typescript
// Development mapování v tenantMapping.ts
export const TENANT_MAPPING = {
  'localhost': {
    supabaseUrl: 'https://test-project.supabase.co',
    supabaseAnonKey: 'test-key...',
    name: 'Localhost Test',
    clientId: 'localhost'
  },
  'leo-dev.local': {
    supabaseUrl: 'https://dev-project.supabase.co', 
    supabaseAnonKey: 'dev-key...',
    name: 'Development',
    clientId: 'dev'
  }
};
```

#### Krok 6.3: Test s více doménami
- [ ] Test localhost → test DB
- [ ] Test production doména → production DB
- [ ] Test neznámé domény → error

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
- **VŽDY** filtrovat podle `tenant_id` v databázových dotazech
- Validace tenant přístupu v každém route handleru
- Error handling pro neexistující tenenty
- Ochrana proti tenant confusion attacks

### Performance:
- Indexy na všechny `tenant_id` sloupce
- Optimalizace dotazů s tenant filtrem
- Caching tenant informací

### Backwards compatibility:
- Migrace existujících dat k defaultnímu tenantovi
- Postupné nasazení bez výpadku služby
- Fallback mechanismy

---

## 📝 Kontrolní seznam

### Supabase projekty
- [ ] Nové Supabase projekty vytvořeny pro každého klienta
- [ ] Databázové schéma zkopírováno do všech projektů
- [ ] Auth nastaveno pro každý projekt
- [ ] Credentials získány pro mapování
- [ ] Testovací data naplněna (v každém projektu)

### TypeScript
- [ ] `app.d.ts` rozšířen pro tenant info
- [ ] Tenant typy definovány (`tenant.ts`)
- [ ] Tenant mapování vytvořeno (`tenantMapping.ts`)

### Služby
- [ ] `tenantService.ts` implementován
- [ ] ✅ `menuService.ts` - ŽÁDNÉ změny potřeba
- [ ] ✅ `orderService.ts` - ŽÁDNÉ změny potřeba  
- [ ] ✅ Ostatní služby - ŽÁDNÉ změny potřeba

### Routes
- [ ] `hooks.server.ts` upraven
- [ ] Admin routes aktualizovány
- [ ] Public routes aktualizovány

### Testování
- [ ] Izolace dat testována
- [ ] Více domén testováno
- [ ] Bezpečnost ověřena

### Deployment
- [ ] Vercel konfigurace
- [ ] Dokumentace pro klienty
- [ ] DNS nastavení ověřeno

---

## ⏱️ Časový odhad

| Fáze | Odhad | Popis |
|------|-------|-------|
| 1 | 0.5 dne | Mapování domén + Supabase projekty |
| 2 | 0.5 dne | TypeScript typy |
| 3 | 1 den | Tenant resolving + dynamické Supabase |
| 4 | 0 dní | ✅ Služby - ŽÁDNÉ změny! |
| 5 | 0.5 dne | Route handlers - minimální změny |
| 6 | 1 den | Testování |
| 7 | 1 den | Deployment |
| **Celkem** | **4-5 dní** | Kompletní implementace |

---

## 🔄 Doporučený postup

1. **Začít s mapováním domén** - vytvořit TENANT_MAPPING
2. **Vytvořit Supabase projekty** - pro každého klienta
3. **Implementovat tenant resolving** - hooks.server.ts 
4. **Testovat s localhost** - ověřit dynamické připojení
5. **Nasadit postupně** - domain po doméně

## 💰 **Výhody tohoto přístupu:**

- ✅ **Úplná izolace dat** - každý klient má vlastní DB
- ✅ **Snadný backup** - každý klient zvlášť
- ✅ **Škálovatelnost** - žádné výkonnostní problémy
- ✅ **Jednoduchost** - minimální změny kódu
- ✅ **Bezpečnost** - nemožnost mixování dat
- ❌ **Náklady** - více Supabase projektů
- ❌ **Správa** - více projektů na správu

---

## 📞 Kontakt a podpora

Pro otázky k implementaci nebo problémy během vývoje kontaktujte vývojový tým.

**Poslední aktualizace:** {DATUM}
**Verze dokumentu:** 1.0 