<script lang="ts">
    import { getAuthUrl } from '$lib/fakturoidAuth';
    import { supabase } from '$lib/supabaseClient';
    import { onMount } from 'svelte';

    let loading = false;
    let error: string | null = null;
    let isConnected = false;

    async function handleConnect() {
        try {
            loading = true;
            error = null;
            
            const session = await supabase.auth.getSession();
            if (!session.data.session?.user) {
                throw new Error('Nejste přihlášen/a');
            }

            const authUrl = await getAuthUrl(supabase, session.data.session.user.id);
            window.location.href = authUrl;
        } catch (err) {
            error = err instanceof Error ? err.message : 'Nepodařilo se připojit k Fakturoidu';
        } finally {
            loading = false;
        }
    }

    onMount(async () => {
        const session = await supabase.auth.getSession();
        if (session.data.session?.user) {
            const { data } = await supabase
                .from('fakturoid_tokens')
                .select('id')
                .eq('customer_id', session.data.session.user.id)
                .single();
            
            isConnected = !!data;
        }
    });
</script>

<div class="flex flex-col gap-4">
    {#if error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
            <p>{error}</p>
        </div>
    {/if}

    <button
        on:click={handleConnect}
        disabled={loading || isConnected}
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
    >
        {#if loading}
            Připojování...
        {:else if isConnected}
            Připojeno k Fakturoidu
        {:else}
            Připojit k Fakturoidu
        {/if}
    </button>
</div> 