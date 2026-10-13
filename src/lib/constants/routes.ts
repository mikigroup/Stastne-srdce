// Globální konstanty pro URL routy
export const ROUTES = {
	// Auth routy
	AUTH: {
		LOGIN: '/auth/login',
		SIGNUP: '/auth/signup',
		SIGNUP_COMPLETE: '/auth/signup/complete',
		CALLBACK: '/auth/callback',
		ERROR: '/auth/error',
		RESET: '/auth/reset',
		FORGOT: '/auth/forgot',
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
	}
} as const; 