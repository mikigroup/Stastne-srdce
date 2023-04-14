<script lang="ts">
	import { supabaseClient } from '$lib/supabaseClient'
	import { onMount } from 'svelte'
	import type { AuthSession } from '@supabase/supabase-js'
	import Account from './Account.svelte'
	import { page } from "$app/stores";

	export let session: AuthSession

	/* let loading = false;
  let username: string | null = null;
  let website: string | null = null;
  onMount(() => {
    getProfile();
  });

  const getProfile = async () => {
    try {
      loading = true;

      const { user } = session;
      const { data, error, status } = await supabaseClient
        .from("profiles")
        .select(`username, website`)
        .eq("id", user.id)
        .single();
      if (data) {
        username = data.username;
        website = data.website;
        avatarUrl = data.avatar_url;
      }

      if (error && status !== 406) throw error;
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      loading = false;
    }
  }; */

	/* 
	const session = supabase.auth.session();
	supabase.auth.onAuthStateChange((_, session) => {
		user.set(session.user);
	}); */

	/* let loading = true
  let user_name = null
  let website = null
  let avatar_url = null
  let email = $user.email;

  function getProfile(node) {
  try {
    loading = true;
    const user = supabase.auth.user();

    supabase
      .from("profiles")
      .select(`user_name, website, avatar_url`)
      .eq("id", user?.id)
      .single()
      .then(({ data, error, status }) => {
        if (data) {
          user_name = data.user_name;
          website = data.website;
          avatar_url = data.avatar_url;
        }
        if (error && status !== 406) throw error;
      });
    } catch (error) {
      alert(error.message);
    } finally {
      loading = false;
    }
  } */

	let loading = false
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
	}

	/* async function getProfile() {
    try {
      loading = true;
      /* const user = supabaseClient.auth.user();

      let { data, error, status } = await supabaseClient
        .from("profile")
        .select(
          `first_name, last_name, telephone, company_name, street, street_number, city, ico, dic, company`
        )
        .eq("id", $session.id)
        .single();

      if (error && status !== 406) throw error;

      if (data) {
        first_name = data.first_name;
        last_name = data.last_name;
        telephone = data.telephone;
        company_name = data.company_name;
        street = data.street;
        street_number = data.street_number;
        ico = data.ico;
        dic = data.dic;
        company = data.company;
        city = data.city;
      }
    } catch (error) {
      alert(error.message);
    } finally {
      loading = false;
    }
  }  */
</script>
<svelte:head>
	<title>Šťastné srdce - Účet</title>
	<meta name="description" content="Účet" />
</svelte:head>
{#if !$page.data.session}
	NEVIM
{:else}
	<Account session={$page.data.session} />
{/if}

