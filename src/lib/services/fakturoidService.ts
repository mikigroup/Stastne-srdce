import { getAccessToken } from "$lib/fakturoidAuth";
import { FAKTUROID_ACCOUNT_SLUG } from "$env/static/private";
import type { TypedSupabaseClient } from "$lib/types/supabase";
import { supabase } from "$lib/supabaseClient";

interface FakturoidError {
	errors: { [key: string]: string[] };
}

interface FakturoidInvoice {
	id: number;
	number: string;
	subject_id: string;
	total: string;
	status: string;
	due_on: string;
}

export async function getInvoices(page = 1): Promise<{
	data: FakturoidInvoice[];
	totalPages: number;
}> {
	const session = await supabase.auth.getSession();
	if (!session.data.session?.user) {
		throw new Error("Unauthorized");
	}

	try {
		const token = await getAccessToken(supabase as TypedSupabaseClient, session.data.session.user.id);

		const response = await fetch(
			`https://app.fakturoid.cz/api/v3/accounts/${FAKTUROID_ACCOUNT_SLUG}/invoices.json?page=${page}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
					"User-Agent": "Stastne-srdce (info@stastne-srdce.cz)"
				}
			}
		);

		if (!response.ok) {
			const error = await response.json() as FakturoidError;
			throw new Error(Object.values(error.errors).flat().join(", "));
		}

		const data = await response.json() as FakturoidInvoice[];
		const totalPages = parseInt(response.headers.get("X-Total-Pages") || "1");

		return { data, totalPages };
	} catch (error) {
		console.error("Failed to fetch invoices:", error);
		throw error instanceof Error 
			? error 
			: new Error("Failed to fetch invoices");
	}
}

export async function createInvoice(invoiceData: any) {
	const session = await supabase.auth.getSession();
	if (!session.data.session?.user) {
		throw new Error("Unauthorized");
	}

	try {
		const token = await getAccessToken(supabase as TypedSupabaseClient, session.data.session.user.id);

		const response = await fetch(
			`https://app.fakturoid.cz/api/v3/accounts/${FAKTUROID_ACCOUNT_SLUG}/invoices.json`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
					"User-Agent": "Stastne-srdce (info@stastne-srdce.cz)"
				},
				body: JSON.stringify(invoiceData)
			}
		);

		if (!response.ok) {
			const error = await response.json() as FakturoidError;
			throw new Error(Object.values(error.errors).flat().join(", "));
		}

		return await response.json();
	} catch (error) {
		console.error("Failed to create invoice:", error);
		throw error instanceof Error 
			? error 
			: new Error("Failed to create invoice");
	}
}
