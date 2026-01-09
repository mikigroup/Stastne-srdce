# Centralizace Admin Panelu - Implementační plán

## 📋 Přehled

Transformace současného multi-tenant řešení s lokálními admin panely na centralizovaný admin panel na `admin.malyleo.cz` pro správu všech tenantů a projektů.

### Princip fungování
```
klient1.cz/admin → admin.malyleo.cz/tenants/klient1
klient2.cz/admin → admin.malyleo.cz/tenants/klient2
klient3.cz/admin → admin.malyleo.cz/tenants/klient3

admin.malyleo.cz → Centrální admin pro všechny tenanty
```

- **Jeden centralizovaný admin panel** na `admin.malyleo.cz`
- **Multi-tenant správa** - jeden admin pro všechny klienty
- **Lokální admin přesměrování** na centrální admin
- **Unified management** - správa všech tenantů z jednoho místa

---

## 📊 Analýza současného stavu

### Aktuální architektura:
- **Lokální admin panely** na každé doméně (`klient.cz/admin`)
- **Separátní admin sessions** pro každého klienta
- **Duplikovaný admin kód** na každé doméně
- **Složitá správa** - každý klient má vlastní admin

### Nová architektura:
- **Centrální admin panel** na `admin.malyleo.cz`
- **Unified admin session** pro všechny tenanty
- **Jednotný admin kód** pro všechny klienty
- **Zjednodušená správa** - jeden admin pro všechny

### Co je potřeba změnit:
1. **DNS a routing** - přesměrování na centrální admin
2. **Admin routes** - přidání tenant parametru
3. **Autentifikace** - unified admin session
4. **UI/UX** - tenant switcher a navigace
5. **Bezpečnost** - admin role management

---

## 🎯 Implementační kroky

### **FÁZE 1: DNS a routing konfigurace (0.5 dne)**

#### Krok 1.1: DNS nastavení
```bash
# Přidat subdoménu admin.malyleo.cz
# A record: admin.malyleo.cz → Vercel IP
# CNAME record: admin.malyleo.cz → vas-projekt.vercel.app
```

#### Krok 1.2: Vercel konfigurace
```json
// vercel.json
{
  "rewrites": [
    {
      "source": "/admin/:path*",
      "destination": "/admin/:path*"
    },
    {
      "source": "/tenants/:tenantId/admin/:path*",
      "destination": "/admin/:path*?tenant=:tenantId"
    }
  ]
}
```

#### Krok 1.3: Lokální přesměrování
```nginx
# Nginx konfigurace pro klient.cz
server {
    server_name klient.cz;
    
    location /admin {
        return 301 https://admin.malyleo.cz/tenants/klient/admin$request_uri;
    }
    
    location / {
        # normální web
    }
}
```

---

### **FÁZE 2: Admin route struktura (1 den)**

#### Krok 2.1: Nová admin struktura
```
admin.malyleo.cz/
├── /dashboard                    # Přehled všech tenantů
├── /tenants                      # Seznam všech tenantů
├── /tenants/[tenantId]           # Konkrétní tenant
│   ├── /dashboard               # Tenant dashboard
│   ├── /menu                    # Správa menu
│   ├── /orders                  # Správa objednávek
│   ├── /customers               # Správa zákazníků
│   ├── /settings                # Tenant nastavení
│   └── /analytics               # Tenant analytics
├── /global-settings             # Globální nastavení
└── /users                       # Správa admin uživatelů
```

#### Krok 2.2: Route handlers
```typescript
// src/routes/admin/tenants/[tenantId]/+layout.server.ts
export const load: LayoutServerLoad = async ({ params, locals }) => {
  const { tenantId } = params;
  
  // Ověřit, že admin má přístup k tomuto tenantovi
  const hasAccess = await checkAdminTenantAccess(locals.user.id, tenantId);
  if (!hasAccess) {
    throw error(403, 'Access denied');
  }
  
  // Nastavit tenant context
  await TenantService.setTenantContext(tenantId);
  
  return {
    currentTenantId: tenantId,
    tenant: await TenantService.getTenantById(tenantId)
  };
};
```

---

### **FÁZE 3: Unified autentifikace (1 den)**

#### Krok 3.1: Admin role management
```sql
-- Přidat admin role do profiles
ALTER TABLE profiles ADD COLUMN admin_roles JSONB DEFAULT '[]';

-- Vytvořit tabulku admin_tenant_access
CREATE TABLE admin_tenant_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES profiles(id),
    tenant_id UUID REFERENCES tenants(id),
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(admin_id, tenant_id)
);

-- RLS policy pro admin access
CREATE POLICY "Admin tenant access" ON admin_tenant_access
    FOR ALL USING (
        admin_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND 
            admin_roles ? 'super_admin'
        )
    );
```

#### Krok 3.2: Admin service
```typescript
// src/lib/services/adminService.ts
export class AdminService {
  static async getAdminTenants(adminId: string): Promise<Tenant[]> {
    const { data, error } = await supabase
      .from('admin_tenant_access')
      .select(`
        tenant_id,
        role,
        tenants (*)
      `)
      .eq('admin_id', adminId);
    
    return data?.map(item => ({
      ...item.tenants,
      role: item.role
    })) || [];
  }
  
  static async checkTenantAccess(adminId: string, tenantId: string): Promise<boolean> {
    const { data } = await supabase
      .from('admin_tenant_access')
      .select('role')
      .eq('admin_id', adminId)
      .eq('tenant_id', tenantId)
      .single();
    
    return !!data;
  }
  
  static async isSuperAdmin(adminId: string): Promise<boolean> {
    const { data } = await supabase
      .from('profiles')
      .select('admin_roles')
      .eq('id', adminId)
      .single();
    
    return data?.admin_roles?.includes('super_admin') || false;
  }
}
```

---

### **FÁZE 4: UI/UX - Tenant switcher (1 den)**

#### Krok 4.1: Admin layout s tenant switcher
```svelte
<!-- src/routes/admin/+layout.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import TenantSwitcher from '$lib/components/TenantSwitcher.svelte';
  
  $: currentTenantId = $page.params.tenantId;
</script>

<header class="admin-header">
  <div class="logo">Admin Panel</div>
  
  {#if currentTenantId}
    <TenantSwitcher {currentTenantId} />
  {/if}
  
  <nav class="admin-nav">
    <a href="/admin/dashboard">Dashboard</a>
    <a href="/admin/tenants">Tenants</a>
    <a href="/admin/global-settings">Settings</a>
  </nav>
</header>

<main>
  <slot />
</main>
```

#### Krok 4.2: Tenant switcher komponenta
```svelte
<!-- src/lib/components/TenantSwitcher.svelte -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import type { Tenant } from '$lib/types/tenant';
  
  export let currentTenantId: string;
  
  let tenants: Tenant[] = [];
  let showDropdown = false;
  
  $: currentTenant = tenants.find(t => t.id === currentTenantId);
  
  async function loadTenants() {
    tenants = await AdminService.getAdminTenants(user.id);
  }
  
  function switchTenant(tenantId: string) {
    goto(`/admin/tenants/${tenantId}/dashboard`);
    showDropdown = false;
  }
  
  onMount(loadTenants);
</script>

<div class="tenant-switcher">
  <button on:click={() => showDropdown = !showDropdown}>
    {currentTenant?.name || 'Select Tenant'}
    <span class="arrow">▼</span>
  </button>
  
  {#if showDropdown}
    <div class="dropdown">
      {#each tenants as tenant}
        <button 
          class:active={tenant.id === currentTenantId}
          on:click={() => switchTenant(tenant.id)}
        >
          {tenant.name}
          <span class="role">{tenant.role}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>
```

---

### **FÁZE 5: Migrace existujících adminů (0.5 dne)**

#### Krok 5.1: Migrace admin uživatelů
```sql
-- Migrovat existující admin uživatele
INSERT INTO admin_tenant_access (admin_id, tenant_id, role)
SELECT 
    p.id as admin_id,
    t.id as tenant_id,
    'admin' as role
FROM profiles p
CROSS JOIN tenants t
WHERE p.role = 'admin' AND t.slug = 'stastnesrdce';

-- Vytvořit super admin
UPDATE profiles 
SET admin_roles = '["super_admin"]'
WHERE email = 'admin@malyleo.cz';
```

#### Krok 5.2: Přesměrování middleware
```typescript
// src/hooks.server.ts - přidat admin redirect
const adminRedirect: Handle = async ({ event, resolve }) => {
  const url = new URL(event.request.url);
  
  // Pokud je to lokální admin, přesměrovat na centrální
  if (url.pathname.startsWith('/admin') && event.locals.tenant) {
    const redirectUrl = `https://admin.malyleo.cz/tenants/${event.locals.tenant.id}${url.pathname}`;
    throw redirect(301, redirectUrl);
  }
  
  return resolve(event);
};

export const handle: Handle = sequence(supabase, tenantResolver, adminRedirect, authGuard);
```

---

### **FÁZE 6: Bezpečnost a oprávnění (1 den)**

#### Krok 6.1: Role-based access control
```typescript
// src/lib/utils/permissions.ts
export const PERMISSIONS = {
  SUPER_ADMIN: ['*'],
  ADMIN: ['tenant:read', 'tenant:write', 'menu:manage', 'orders:manage'],
  MANAGER: ['tenant:read', 'menu:read', 'orders:read'],
  VIEWER: ['tenant:read', 'menu:read']
} as const;

export function hasPermission(userRole: string, permission: string): boolean {
  const userPermissions = PERMISSIONS[userRole] || [];
  return userPermissions.includes('*') || userPermissions.includes(permission);
}
```

#### Krok 6.2: Route guards
```typescript
// src/routes/admin/tenants/[tenantId]/settings/+page.server.ts
export const load: PageServerLoad = async ({ params, locals }) => {
  const { tenantId } = params;
  
  // Ověřit přístup
  const hasAccess = await AdminService.checkTenantAccess(locals.user.id, tenantId);
  if (!hasAccess) {
    throw error(403, 'Access denied');
  }
  
  // Ověřit oprávnění pro settings
  const userRole = await AdminService.getUserRole(locals.user.id, tenantId);
  if (!hasPermission(userRole, 'tenant:write')) {
    throw error(403, 'Insufficient permissions');
  }
  
  return {
    tenant: await TenantService.getTenantById(tenantId),
    userRole
  };
};
```

---

### **FÁZE 7: Testování a deployment (1 den)**

#### Krok 7.1: Testovací scénáře
- [ ] Test přesměrování z lokálních adminů
- [ ] Test tenant switcher funkcionality
- [ ] Test role-based access control
- [ ] Test super admin funkcí
- [ ] Test cross-tenant operací

#### Krok 7.2: Monitoring a logging
```typescript
// src/lib/utils/adminLogger.ts
export class AdminLogger {
  static async logAction(action: string, tenantId: string, userId: string, details?: any) {
    await supabase.from('admin_audit_log').insert({
      action,
      tenant_id: tenantId,
      admin_id: userId,
      details,
      timestamp: new Date().toISOString()
    });
  }
}
```

---

## 🚨 Kritické body

### Bezpečnost:
- **VŽDY** ověřit admin oprávnění před každou operací
- **Audit logging** všech admin akcí
- **Session management** pro admin uživatele
- **Rate limiting** pro admin endpoints
- **IP whitelisting** pro super admin funkce

### UX/UI:
- **Jasná navigace** mezi tenanty
- **Kontextové informace** o aktuálním tenantovi
- **Breadcrumbs** pro snadnou navigaci
- **Responsive design** pro mobilní admin

### Performance:
- **Caching** tenant informací
- **Lazy loading** pro velké seznamy tenantů
- **Optimizace** cross-tenant dotazů

---

## 📝 Kontrolní seznam

### DNS a Routing
- [ ] DNS záznamy pro admin.malyleo.cz
- [ ] Vercel konfigurace pro admin routes
- [ ] Nginx/Apache přesměrování pro lokální adminy

### Databáze
- [ ] Tabulka admin_tenant_access vytvořena
- [ ] Admin role sloupce přidány do profiles
- [ ] RLS policies pro admin access
- [ ] Audit log tabulka vytvořena

### Admin Routes
- [ ] Nová admin route struktura implementována
- [ ] Tenant switcher komponenta
- [ ] Role-based access control
- [ ] Admin layout s navigací

### Autentifikace
- [ ] Unified admin session
- [ ] Super admin role
- [ ] Tenant access management
- [ ] Admin audit logging

### Testování
- [ ] Přesměrování testováno
- [ ] Role permissions testovány
- [ ] Cross-tenant operace testovány
- [ ] Security audit proveden

---

## ⏱️ Časový odhad

| Fáze | Odhad | Popis |
|------|-------|-------|
| 1 | 0.5 dne | DNS a routing konfigurace |
| 2 | 1 den | Admin route struktura |
| 3 | 1 den | Unified autentifikace |
| 4 | 1 den | UI/UX - Tenant switcher |
| 5 | 0.5 dne | Migrace existujících adminů |
| 6 | 1 den | Bezpečnost a oprávnění |
| 7 | 1 den | Testování a deployment |
| **Celkem** | **5 dní** | Kompletní centralizace |

---

## 🔄 Doporučený postup

1. **Začít s DNS a routing** - nastavit admin.malyleo.cz
2. **Implementovat admin routes** - nová struktura
3. **Přidat unified autentifikaci** - admin role management
4. **Vytvořit tenant switcher** - UI pro přepínání
5. **Migrovat existující adminy** - přesměrování
6. **Testovat a nasadit** - postupně

## 💰 **Výhody centralizace:**

- ✅ **Jednotná správa** - jeden admin pro všechny tenanty
- ✅ **Snížené náklady** - méně duplikovaného kódu
- ✅ **Lepší UX** - konzistentní admin rozhraní
- ✅ **Cross-tenant operace** - možnost agregace dat
- ✅ **Centralizovaná bezpečnost** - jednotné oprávnění
- ✅ **Snadnější maintenance** - jeden kód pro admin
- ⚠️ **Single point of failure** - admin.malyleo.cz
- ⚠️ **Složitější routing** - více redirectů

---

## 📞 Kontakt a podpora

Pro otázky k implementaci nebo problémy během vývoje kontaktujte vývojový tým.

**Poslední aktualizace:** 2024-01-XX
**Verze dokumentu:** 1.0 (Centralizace admin panelu) 