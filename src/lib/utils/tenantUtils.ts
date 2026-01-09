import { PUBLIC_TENANT } from '$env/static/public';

/**
 * Helper funkce pro získání tenant_id z locals nebo fallback na default
 */
export function getTenantId(locals: any): string {
    return locals.tenantId || PUBLIC_TENANT;
}

/**
 * Helper funkce pro získání tenant_id z data objektu nebo fallback na default
 */
export function getTenantIdFromData(data: any): string {
    return data.tenantId || PUBLIC_TENANT;
}

/**
 * Helper funkce pro získání tenant_id z session nebo fallback na default
 */
export function getTenantIdFromSession(session: any): string {
    return session?.tenantId || PUBLIC_TENANT;
}
