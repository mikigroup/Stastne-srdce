<script lang="ts">
  import { onMount } from 'svelte';
  import type { CustomerLoyaltyData, LoyaltySettings, LoyaltyTier } from '$lib/services/loyaltyService';
  import { calculateCustomerLoyalty, getLoyaltySettings, getLoyaltyTierInfo } from '$lib/services/loyaltyService';
  import type { TypedSupabaseClient } from '$lib/supabase';

  export let supabase: TypedSupabaseClient;
  export let customerId: string;
  export let expanded: boolean = false;

  let loyaltyData: CustomerLoyaltyData | null = null;
  let loyaltySettings: LoyaltySettings | null = null;
  let currentTierInfo: LoyaltyTier | null = null;
  let loading = true;
  let error: string | null = null;

  onMount(async () => {
    await loadLoyaltyData();
  });

  async function loadLoyaltyData() {
    try {
      loading = true;
      error = null;

      // Načtení nastavení a dat paralelně
      const [settings, data] = await Promise.all([
        getLoyaltySettings(supabase),
        calculateCustomerLoyalty(supabase, customerId)
      ]);

      loyaltySettings = settings;
      loyaltyData = data;
      currentTierInfo = getLoyaltyTierInfo(data.currentTier, settings.tiers);
    } catch (err) {
      console.error('Error loading loyalty data:', err);
      error = 'Chyba při načítání věrnostních dat';
    } finally {
      loading = false;
    }
  }

  function formatPoints(points: number): string {
    return points.toLocaleString('cs-CZ');
  }

  function formatCurrency(amount: number): string {
    return `${amount.toLocaleString('cs-CZ')} Kč`;
  }

  function formatDays(days: number): string {
    if (days === 0) return 'Dnes';
    if (days === 1) return 'Včera';
    if (days < 7) return `${days} dní`;
    if (days < 30) return `${Math.floor(days / 7)} týdnů`;
    if (days < 365) return `${Math.floor(days / 30)} měsíců`;
    return `${Math.floor(days / 365)} let`;
  }

  function getNextTierInfo(): LoyaltyTier | null {
    if (!loyaltySettings || !loyaltyData) return null;
    
    const currentIndex = loyaltySettings.tiers.findIndex(tier => tier.name === loyaltyData!.currentTier);
    if (currentIndex === -1 || currentIndex === loyaltySettings.tiers.length - 1) return null;
    
    return loyaltySettings.tiers[currentIndex + 1];
  }

  function getProgressToNextTier(): number {
    if (!loyaltyData || !loyaltySettings) return 0;
    
    const currentTier = loyaltySettings.tiers.find(tier => tier.name === loyaltyData!.currentTier);
    const nextTier = getNextTierInfo();
    
    if (!currentTier || !nextTier) return 100;
    
    const currentOrders = loyaltyData.customerSince > 0 ? Math.floor(loyaltyData.customerSince / 30) : 0; // Zjednodušeně
    const progress = ((currentOrders - currentTier.minOrders) / (nextTier.minOrders - currentTier.minOrders)) * 100;
    
    return Math.max(0, Math.min(100, progress));
  }
</script>

{#if loading}
  <div class="flex items-center justify-center p-4">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span class="ml-2 text-gray-600">Načítání věrnostního profilu...</span>
  </div>
{:else if error}
  <div class="bg-red-50 border border-red-200 rounded-lg p-4">
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
{:else if loyaltyData && loyaltySettings && currentTierInfo}
  <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
    <!-- Hlavička s úrovní věrnosti -->
    <div class="p-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 rounded-full flex items-center justify-center text-2xl" 
                 style="background-color: {currentTierInfo.color}20; color: {currentTierInfo.color}">
              {currentTierInfo.icon}
            </div>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">{currentTierInfo.label}</h3>
            <p class="text-sm text-gray-600">{currentTierInfo.description}</p>
          </div>
        </div>
        <div class="text-right">
          <div class="text-2xl font-bold text-gray-900">{formatPoints(loyaltyData.currentPoints)}</div>
          <div class="text-sm text-gray-600">bodů</div>
        </div>
      </div>
    </div>

    <!-- Rozbalitelný obsah -->
    {#if expanded}
      <div class="p-4 space-y-4">
        <!-- Statistiky -->
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-gray-50 rounded-lg p-3">
            <div class="text-sm text-gray-600">Celkem utraceno</div>
            <div class="text-lg font-semibold text-gray-900">
              {formatCurrency(loyaltyData.totalPointsEarned / loyaltySettings.pointsPerCzk)}
            </div>
          </div>
          <div class="bg-gray-50 rounded-lg p-3">
            <div class="text-sm text-gray-600">Celkem bodů</div>
            <div class="text-lg font-semibold text-gray-900">{formatPoints(loyaltyData.totalPointsEarned)}</div>
          </div>
        </div>

        <!-- Progress k další úrovni -->
        {#if getNextTierInfo()}
          {@const nextTier = getNextTierInfo()}
          {@const progress = getProgressToNextTier()}
          <div class="bg-blue-50 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-blue-900">Progress k {nextTier.label}</span>
              <span class="text-sm text-blue-700">{Math.round(progress)}%</span>
            </div>
            <div class="w-full bg-blue-200 rounded-full h-2">
              <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                   style="width: {progress}%"></div>
            </div>
            <p class="text-xs text-blue-700 mt-1">
              Zbývá {nextTier.minOrders - (loyaltyData.customerSince > 0 ? Math.floor(loyaltyData.customerSince / 30) : 0)} objednávek
            </p>
          </div>
        {/if}

        <!-- Výhody úrovně -->
        <div class="bg-green-50 rounded-lg p-4">
          <h4 class="text-sm font-medium text-green-900 mb-2">Výhody vaší úrovně</h4>
          <div class="space-y-2">
            <div class="flex items-center text-sm text-green-800">
              <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              Sleva {currentTierInfo.discount}% na všechny objednávky
            </div>
            <div class="flex items-center text-sm text-green-800">
              <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              Bonus {currentTierInfo.bonus}% bodů navíc
            </div>
          </div>
        </div>

        <!-- Aktivita -->
        <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="text-sm font-medium text-gray-900 mb-2">Aktivita</h4>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Zákazník od:</span>
              <span class="font-medium">{formatDays(loyaltyData.customerSince)}</span>
            </div>
            {#if loyaltyData.lastOrderDate}
              <div class="flex justify-between">
                <span class="text-gray-600">Poslední objednávka:</span>
                <span class="font-medium">{formatDays(loyaltyData.daysSinceLastOrder || 0)}</span>
              </div>
            {/if}
            <div class="flex justify-between">
              <span class="text-gray-600">Status:</span>
              <span class="font-medium {loyaltyData.isActive ? 'text-green-600' : 'text-orange-600'}">
                {loyaltyData.isActive ? 'Aktivní' : 'Neaktivní'}
              </span>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
{/if} 