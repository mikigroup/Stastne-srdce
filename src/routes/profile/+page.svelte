<script lang="ts">
	import { supabaseClient } from '$lib/supabaseClient'
	import { onMount } from 'svelte'
	import type { AuthSession } from '@supabase/supabase-js'
	import Account from './Account.svelte'
	import { page } from "$app/stores";

	export let session: AuthSession
  
  
	/* let loading = false
	let username: string | null = null
	let website: string | null = null
	let avatarUrl: string | null = null
	let first_name = null;	
	let last_name = null;
	let telephone = null;
	let company_name = null;
	let street = null;
	let street_number = null;
	let city = null;
	let ico = null;
	let dic = null;
	let company = null;

	onMount(() => {
		getProfile()
	})
    const getProfile = async () => {
      try {
        loading = true
        const { user } = session
        const { data, error, status } = await supabaseClient
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

	async function updateProfile() {
		try {
			loading = true
			const { user } = session

			const updates = {
				id: user.id,
				avatar_url: avatarUrl,
				updated_at: new Date(),
				username,
				website
			}

			let { error } = await supabaseClient.from('profiles').upsert(updates)

			if (error) throw error
		} catch (error) {
			if (error instanceof Error) {
				alert(error.message)
			}
		} finally {
			loading = false
		}
	} */

</script>
<svelte:head>
	<title>Šťastné srdce - Účet</title>
	<meta name="description" content="Účet" />
</svelte:head>

{#if !$page.data.session}
	<p class="pt-10 mt-10">Přihlaš se</p>
{:else}
	<Account session={$page.data.session} />
{/if}



