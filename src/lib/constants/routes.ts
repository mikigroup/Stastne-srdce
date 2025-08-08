// Globální konstanty pro URL routy
export const ROUTES = {
	// Auth routy
	AUTH: {
		LOGIN: '/auth/login',
		SIGNUP: '/auth/signup',
		SIGNUP_COMPLETE: '/auth/signup/complete',
		CALLBACK: '/auth/callback',
		ERROR: '/auth/error',
		RESET: '/reset',
		FORGOT: '/forgot',
		REACTIVATE: '/auth/reactivate'
	},
	
	// Hlavní stránky
	MAIN: {
		HOME: '/',
		PROFILE: '/profile',
		OBEDY: '/obedy',
		KOSIK: '/kosik',
		KONTAKT: '/kontakt',
		OBCHODNI_PODMINKY: '/obchodni-podminky',
		GDPR: '/gdpr',
		HACCP: '/haccp',
		PORADNA: '/poradna',
		PREDNASKY: '/prednasky-a-kurzy',
		CENIK: '/cenik',
		ALERGENY: '/alergeny'
	},
	
	// Admin routy
	ADMIN: {
		DASHBOARD: '/admin',
		CUSTOMERS: '/admin/customer',
		MENU: '/admin/menu',
		ORDERS: '/admin/order',
		SETTINGS: '/admin/settings',
		SITE_SETTINGS: '/admin/site-setting',
		TEXT_EDITOR: '/admin/text',
		LOYALTY: '/admin/settings/loyalty'
	},
	
	// API routy
	API: {
		FAKTUROID: {
			CREATE_INVOICE: '/api/fakturoid/create-invoice',
			FORCE_REFRESH: '/api/fakturoid/force-refresh',
			HEALTH: '/api/fakturoid/health',
			TEST_SLUG: '/api/fakturoid/test-slug',
			TOKEN_STATUS: '/api/fakturoid/token-status',
			VERIFY_TOKEN: '/api/fakturoid/verify-token'
		},
		TOKEN_MAINTENANCE: '/api/token-maintenance'
	}
} as const;

// Helper funkce pro vytvoření URL s parametry
export function createUrl(route: string, params?: Record<string, string>): string {
	if (!params) return route;
	
	const url = new URL(route, 'http://localhost');
	Object.entries(params).forEach(([key, value]) => {
		url.searchParams.append(key, value);
	});
	
	return url.pathname + url.search;
}

// Helper funkce pro auth callback URL
export function createAuthCallbackUrl(type: 'signup' | 'recovery', token?: string): string {
	const params: Record<string, string> = { success: type };
	if (token) params.token = token;
	
	return createUrl(ROUTES.AUTH.SIGNUP_COMPLETE, params);
} 