import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession }, url }) => {
	const { session } = await safeGetSession();
	
	// Výjimky - stránky, které nevyžadují autentizaci
	const publicAdminRoutes = ['/admin/signin', '/admin/signup', '/admin/forgot', '/admin/reset'];
	
	// Pokud je uživatel na veřejné admin stránce, nepřesměrovávat
	if (publicAdminRoutes.some(route => url.pathname.startsWith(route))) {
		return {
			session
		};
	}
	
	if (!session) {
		throw redirect(303, '/admin/signin');
	}
	
	// Můžete také zkontrolovat role uživatele
	// if (session.user.user_metadata?.role !== 'admin') {
	//     throw redirect(303, '/');
	// }
	
	return {
		session
	};
}; 