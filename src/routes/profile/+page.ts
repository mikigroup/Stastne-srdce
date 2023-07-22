import { supabaseClient } from '$lib/supabaseClient'

export async function load({ locals }) {
	// Get the user from the locals if it exists
	const { user } = locals

	if (user) {
		const { data, error } = await supabaseClient.from('users').select('email').eq('id', user.id).single()

		if (error) {
			console.error(error)
			return {
				status: 500,
				body: error
			}
		} else {
			// Return the data as props
			return {
				status: 200,
				body: {
					email: data.email
				}
			}
		}
	}

	// If no user is logged in, return an empty object
	return {
		status: 200,
		body: {}
	}
}
