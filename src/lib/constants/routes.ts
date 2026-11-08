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
	}
} as const; 