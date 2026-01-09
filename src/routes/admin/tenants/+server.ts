import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();

	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const tenantData = await request.json();
		const { slug, name, domain, status = 'active' } = tenantData;

		// Validace
		if (!slug || !name) {
			return json({ error: 'Slug a název jsou povinné' }, { status: 400 });
		}

		if (slug.length < 3) {
			return json({ error: 'Slug musí mít alespoň 3 znaky' }, { status: 400 });
		}

		if (!/^[a-z0-9-]+$/.test(slug)) {
			return json({ error: 'Slug může obsahovat pouze malá písmena, čísla a pomlčky' }, { status: 400 });
		}

		// Kontrola unikátnosti slug
		const { data: existingTenant, error: checkError } = await supabase
			.from('tenants')
			.select('id')
			.eq('slug', slug)
			.single();

		if (checkError && checkError.code !== 'PGRST116') {
			console.error('Error checking tenant uniqueness:', checkError);
			return json({ error: 'Chyba při kontrole unikátnosti' }, { status: 500 });
		}

		if (existingTenant) {
			return json({ error: 'Tenant s tímto slug již existuje' }, { status: 400 });
		}

		// Vytvořit nový tenant
		const { data: newTenant, error: createError } = await supabase
			.from('tenants')
			.insert({
				slug,
				name,
				domain: domain || null,
				status,
				settings: {},
				features: {}
			})
			.select()
			.single();

		if (createError) {
			console.error('Error creating tenant:', createError);
			return json({ error: 'Chyba při vytváření tenanta' }, { status: 500 });
		}

		return json({ tenant: newTenant, message: 'Tenant úspěšně vytvořen' });

	} catch (error) {
		console.error('Error in tenant creation:', error);
		return json({ error: 'Interní chyba serveru' }, { status: 500 });
	}
};

export const GET: RequestHandler = async ({ locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();

	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { data: tenants, error } = await supabase
			.from('tenants')
			.select('*')
			.eq('status', 'active')
			.order('name');

		if (error) {
			console.error('Error fetching tenants:', error);
			return json({ error: 'Chyba při načítání tenantů' }, { status: 500 });
		}

		return json({ tenants: tenants || [] });

	} catch (error) {
		console.error('Error in tenant fetch:', error);
		return json({ error: 'Interní chyba serveru' }, { status: 500 });
	}
}; 