<script lang="ts">
  import { onMount } from 'svelte';
  import { getLoyaltySettings, saveLoyaltySettings, type LoyaltySettings, type LoyaltyTier } from '$lib/services/loyaltyService';
  import type { TypedSupabaseClient } from '$lib/supabase';
  import AdminPageLayout from '$lib/component/AdminPageLayout.svelte';

  export let data: any;
  
  let supabase: TypedSupabaseClient = data.supabase;
  let session = data.session;
  let loading = false;
  let saving = false;
  let error: string | null = null;
  let success = false;

  let settings: LoyaltySettings | null = null;
  let originalSettings: LoyaltySettings | null = null;

  onMount(async () => {
    await loadSettings();
  });

  async function loadSettings() {
    try {
      loading = true;
      error = null;
      
      settings = await getLoyaltySettings(supabase);
      originalSettings = JSON.parse(JSON.stringify(settings)); // Deep copy
    } catch (err) {
      console.error('Error loading loyalty settings:', err);
      error = 'Chyba při načítání nastavení';
    } finally {
      loading = false;
    }
  }

  async function saveSettings() {
    if (!settings || !session?.user?.id) return;

    try {
      saving = true;
      error = null;
      success = false;

      const saveResult = await saveLoyaltySettings(supabase, settings, session.user.id);
      
      if (saveResult) {
        originalSettings = JSON.parse(JSON.stringify(settings));
        success = true;
        setTimeout(() => success = false, 3000);
      } else {
        error = 'Chyba při ukládání nastavení';
      }
    } catch (err) {
      console.error('Error saving loyalty settings:', err);
      error = 'Chyba při ukládání nastavení';
    } finally {
      saving = false;
    }
  }

  function addTier() {
    if (!settings) return;
    
    const newTier: LoyaltyTier = {
      name: 'NEW_TIER',
      label: 'Nová úroveň',
      minOrders: 0,
      discount: 5,
      bonus: 0,
      color: '#6B7280',
      icon: '🆕',
      description: 'Popis nové úrovně'
    };
    
    settings.tiers = [...settings.tiers, newTier];
  }

  function removeTier(index: number) {
    if (!settings || settings.tiers.length <= 1) return;
    settings.tiers = settings.tiers.filter((_, i) => i !== index);
  }

  function moveTier(index: number, direction: 'up' | 'down') {
    if (!settings) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= settings.tiers.length) return;
    
    const tiers = [...settings.tiers];
    [tiers[index], tiers[newIndex]] = [tiers[newIndex], tiers[index]];
    settings.tiers = tiers;
  }

  function hasChanges(): boolean {
    if (!settings || !originalSettings) return false;
    return JSON.stringify(settings) !== JSON.stringify(originalSettings);
  }

  function resetChanges() {
    if (originalSettings) {
      settings = JSON.parse(JSON.stringify(originalSettings));
    }
  }

  const actions = [
    {
      label: saving ? 'Ukládá se...' : 'Uložit změny',
      onClick: saveSettings,
      variant: 'primary' as const,
      loading: saving,
      disabled: saving || !hasChanges()
    },
    {
      label: 'Obnovit změny',
      onClick: resetChanges,
      variant: 'secondary' as const,
      disabled: !hasChanges()
    }
  ];
</script>

<svelte:head>
  <title>LEO - Nastavení věrnostního systému</title>
</svelte:head>

<AdminPageLayout
  title="Nastavení věrnostního systému"
  subtitle="Konfigurace bodů, úrovní a výhod pro zákazníky"
  backUrl="/admin/settings"
  {actions}>

  {#if error}
    <div class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-800">{error}</p>
        </div>
      </div>
    </div>
  {/if}

  {#if success}
    <div class="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-green-800">Nastavení bylo úspěšně uloženo!</p>
        </div>
      </div>
    </div>
  {/if}

  {#if loading}
    <div class="flex items-center justify-center p-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-2 text-gray-600">Načítání nastavení...</span>
    </div>
  {:else if settings}
    <div class="space-y-6">
      <!-- Základní nastavení -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Základní nastavení</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="flex items-center">
              <input 
                type="checkbox" 
                bind:checked={settings.enabled}
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              >
              <span class="ml-2 text-sm font-medium text-gray-700">Povolit věrnostní systém</span>
            </label>
            <p class="mt-1 text-xs text-gray-500">Zapne nebo vypne celý věrnostní systém</p>
          </div>

          <div>
            <label class="flex items-center">
              <input 
                type="checkbox" 
                bind:checked={settings.enableTiers}
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              >
              <span class="ml-2 text-sm font-medium text-gray-700">Povolit úrovně věrnosti</span>
            </label>
            <p class="mt-1 text-xs text-gray-500">Zapne systém úrovní s různými výhodami</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Body za 1 Kč
            </label>
            <input 
              type="number" 
              bind:value={settings.pointsPerCzk}
              min="0" 
              step="0.1"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
            <p class="mt-1 text-xs text-gray-500">Kolik bodů získá zákazník za 1 Kč</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Hodnota 1 bodu (Kč)
            </label>
            <input 
              type="number" 
              bind:value={settings.pointsValue}
              min="0" 
              step="0.01"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
            <p class="mt-1 text-xs text-gray-500">Kolik Kč stojí 1 bod při použití</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Maximální body/objednávka
            </label>
            <input 
              type="number" 
              bind:value={settings.maxPointsPerOrder}
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
            <p class="mt-1 text-xs text-gray-500">Omezení bodů za jednu objednávku</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Uvítací bonus (body)
            </label>
            <input 
              type="number" 
              bind:value={settings.welcomeBonus}
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
            <p class="mt-1 text-xs text-gray-500">Body pro nové zákazníky</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Narozeninový bonus (body)
            </label>
            <input 
              type="number" 
              bind:value={settings.birthdayBonus}
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
            <p class="mt-1 text-xs text-gray-500">Body k narozeninám</p>
          </div>
        </div>
      </div>

      <!-- Úrovně věrnosti -->
      {#if settings.enableTiers}
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Úrovně věrnosti</h3>
            <button 
              on:click={addTier}
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Přidat úroveň
            </button>
          </div>

          <div class="space-y-4">
            {#each settings.tiers as tier, index}
              <div class="border border-gray-200 rounded-lg p-4">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Název</label>
                    <input 
                      type="text" 
                      bind:value={tier.name}
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Popisek</label>
                    <input 
                      type="text" 
                      bind:value={tier.label}
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Min. objednávek</label>
                    <input 
                      type="number" 
                      bind:value={tier.minOrders}
                      min="0"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Ikona</label>
                    <input 
                      type="text" 
                      bind:value={tier.icon}
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Sleva (%)</label>
                    <input 
                      type="number" 
                      bind:value={tier.discount}
                      min="0" 
                      max="100"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Bonus bodů (%)</label>
                    <input 
                      type="number" 
                      bind:value={tier.bonus}
                      min="0" 
                      max="100"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Barva</label>
                    <input 
                      type="color" 
                      bind:value={tier.color}
                      class="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                  </div>

                  <div class="flex items-end space-x-2">
                    <button 
                      on:click={() => moveTier(index, 'up')}
                      disabled={index === 0}
                      class="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
                    >
                      ↑
                    </button>
                    <button 
                      on:click={() => moveTier(index, 'down')}
                      disabled={index === settings.tiers.length - 1}
                      class="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
                    >
                      ↓
                    </button>
                    <button 
                      on:click={() => removeTier(index)}
                      disabled={settings.tiers.length <= 1}
                      class="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                    >
                      Smazat
                    </button>
                  </div>
                </div>

                <div class="mt-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Popis</label>
                  <textarea 
                    bind:value={tier.description}
                    rows="2"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Pokročilá nastavení -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Pokročilá nastavení</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Prah neaktivity (dny)
            </label>
            <input 
              type="number" 
              bind:value={settings.inactivityThreshold}
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
            <p class="mt-1 text-xs text-gray-500">Po kolika dnech je zákazník neaktivní</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Expirace bodů (měsíce)
            </label>
            <input 
              type="number" 
              bind:value={settings.pointsExpiryMonths}
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
            <p class="mt-1 text-xs text-gray-500">Po kolika měsících body expirují</p>
          </div>
        </div>

        <div class="mt-6 space-y-4">
          <div class="flex items-center">
            <input 
              type="checkbox" 
              bind:checked={settings.enableAutoTierUpgrade}
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            >
            <span class="ml-2 text-sm font-medium text-gray-700">Automatické povýšení úrovně</span>
          </div>

          <div class="flex items-center">
            <input 
              type="checkbox" 
              bind:checked={settings.enableTierDowngrade}
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            >
            <span class="ml-2 text-sm font-medium text-gray-700">Automatické snížení úrovně</span>
          </div>
        </div>
      </div>
    </div>
  {/if}
</AdminPageLayout> 