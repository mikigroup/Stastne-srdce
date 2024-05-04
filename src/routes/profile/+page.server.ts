/* import { redirect } from '@sveltejs/kit'
import type { Actions } from '../auth/$types'

export const actions: Actions = {
  signup: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      console.error(error)
      return redirect(303, '/auth/error')
    } else {
      return redirect(303, '/')
    }
  },
  login: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      console.error(error)
      return redirect(303, '/auth/error')
    } else {
      return redirect(303, '/private')
    }
  },
} */

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
  const { data: profiles } = await supabase.from('profiles').select('name').limit(5).order('name')
  return { profiles: profiles ?? [] }
}


onMount(() => {
		getProfile()
	})
	const getProfile = async (supabase) => {
		try {
			loading = true
			const { user } = session
			const { data, error, status } = await supabase
				.from('profiles')
				.select(
					`username, website, avatar_url, first_name, last_name, telephone, company_name, street, street_number, city, ico, dic, company`
				)
				.eq('id', user.id)
				.single()

			if (data) {
				username = data.username
				website = data.website
				avatarUrl = data.avatar_url
				first_name = data.first_name
				last_name = data.last_name
				telephone = data.telephone
				company_name = data.company_name
				street = data.street
				street_number = data.street_number
				ico = data.ico
				dic = data.dic
				company = data.company
				city = data.city
			}

			if (error && status !== 406) throw error
		} catch (error) {
			if (error instanceof Error) {
				alert(error.message)
			}
		} finally {
			loading = false
		}
	}