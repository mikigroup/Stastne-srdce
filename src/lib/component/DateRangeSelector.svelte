<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { formatDateRange } from "$lib/utils/formatting";

  // Definice typů datových rozsahů
  type DateRangeType = 'day' | 'week' | 'month' | 'year' | 'custom';
  type PresetType = 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'lastQuarter' | 'thisYear' | 'lastYear' | 'custom';

  // Props
  export let initialRange: PresetType = 'thisMonth';

  // Stav
  let selectedRange: DateRangeType = 'month';
  let selectedPreset: PresetType = initialRange;
  let startDate: string;
  let endDate: string;
  let customStartDate: string;
  let customEndDate: string;
  let isCalendarOpen = false;

  // Formátovaný rozsah pro zobrazení
  let formattedRange = '';

  // Event dispatcher
  const dispatch = createEventDispatcher();

  // Nastavení výchozích dat pro vlastní výběr
  onMount(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    customStartDate = firstDayOfMonth.toISOString().substring(0, 10);
    customEndDate = today.toISOString().substring(0, 10);

    // Inicializuj výběr podle initialRange
    setPreset(initialRange);
  });

  // Nastavení předdefinovaného rozsahu
  function setPreset(preset: PresetType) {
    selectedPreset = preset;
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (preset) {
      case 'today':
        selectedRange = 'day';
        start = new Date(now.setHours(0, 0, 0, 0));
        end = new Date();
        end.setHours(23, 59, 59, 999);
        break;

      case 'yesterday':
        selectedRange = 'day';
        start = new Date(now);
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setHours(23, 59, 59, 999);
        break;

      case 'thisWeek':
        selectedRange = 'week';
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // úprava pro neděli
        start = new Date(now);
        start.setDate(diff);
        start.setHours(0, 0, 0, 0);
        end = new Date();
        end.setHours(23, 59, 59, 999);
        break;

      case 'lastWeek':
        selectedRange = 'week';
        const lastWeekDay = now.getDay();
        const lastWeekDiff = now.getDate() - lastWeekDay - 6 + (lastWeekDay === 0 ? -6 : 1);
        start = new Date(now);
        start.setDate(lastWeekDiff);
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;

      case 'thisMonth':
        selectedRange = 'month';
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date();
        end.setHours(23, 59, 59, 999);
        break;

      case 'lastMonth':
        selectedRange = 'month';
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        end.setHours(23, 59, 59, 999);
        break;

      case 'lastQuarter':
        selectedRange = 'custom';
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const lastQuarterStartMonth = (currentQuarter - 1 + 4) % 4 * 3; // Zajistí správné wraparound pro předchozí kvartál
        const lastQuarterYear = currentQuarter === 0 ? now.getFullYear() - 1 : now.getFullYear();
        start = new Date(lastQuarterYear, lastQuarterStartMonth, 1);
        end = new Date(lastQuarterYear, lastQuarterStartMonth + 3, 0);
        end.setHours(23, 59, 59, 999);
        break;

      case 'thisYear':
        selectedRange = 'year';
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date();
        end.setHours(23, 59, 59, 999);
        break;

      case 'lastYear':
        selectedRange = 'year';
        start = new Date(now.getFullYear() - 1, 0, 1);
        end = new Date(now.getFullYear() - 1, 11, 31);
        end.setHours(23, 59, 59, 999);
        break;

      case 'custom':
        selectedRange = 'custom';
        start = new Date(customStartDate);
        start.setHours(0, 0, 0, 0);
        end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);
        break;

      default:
        selectedRange = 'month';
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date();
        end.setHours(23, 59, 59, 999);
    }

    // Formátování dat
    startDate = start.toISOString();
    endDate = end.toISOString();

    // Aktualizace zobrazovaného rozsahu
    formattedRange = formatDateRange(start, end);

    // Odeslání události s novým datovým rozsahem
    dispatch('rangeChange', {
      rangeType: selectedRange,
      preset: selectedPreset,
      startDate,
      endDate,
      formattedRange
    });
  }

  // Aktualizace vlastního rozsahu
  function updateCustomRange() {
    selectedPreset = 'custom';

    const start = new Date(customStartDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(customEndDate);
    end.setHours(23, 59, 59, 999);

    // Formátování dat
    startDate = start.toISOString();
    endDate = end.toISOString();

    // Aktualizace zobrazovaného rozsahu
    formattedRange = formatDateRange(start, end);

    // Odeslání události s novým datovým rozsahem
    dispatch('rangeChange', {
      rangeType: 'custom',
      preset: 'custom',
      startDate,
      endDate,
      formattedRange
    });

    isCalendarOpen = false;
  }



  // Kontrola, zda je koncové datum po počátečním datu
  $: isValidDateRange = customStartDate && customEndDate &&
      new Date(customStartDate) <= new Date(customEndDate);
</script>

<div class="flex flex-col sm:flex-row gap-2 mb-8">
  <div class="card bg-base-100 shadow-lg border w-full border-gray-300">
    <div class="card-body p-4">
      <div class="flex flex-col sm:flex-row justify-between items-center gap-3">
        <div class="flex flex-col gap-1">
          <h3 class="card-title text-lg">Statistiky za období</h3>
          <p class="text-sm text-gray-600">{formattedRange}</p>
        </div>

        <div class="flex flex-wrap gap-2">
          <!-- Rychlý výběr -->
          <div class="dropdown dropdown-hover dropdown-bottom dropdown-end">
            <label tabindex="0" class="btn btn-sm ">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-1">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              {selectedPreset === 'custom' ? 'Vlastní období' : formattedRange}
            </label>
            <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-52">
              <li class="menu-title">Rychlý výběr</li>
              <li><a class:active={selectedPreset === 'today'} on:click={() => setPreset('today')}>Dnes</a></li>
              <li><a class:active={selectedPreset === 'yesterday'} on:click={() => setPreset('yesterday')}>Včera</a></li>
              <li><a class:active={selectedPreset === 'thisWeek'} on:click={() => setPreset('thisWeek')}>Tento týden</a></li>
              <li><a class:active={selectedPreset === 'lastWeek'} on:click={() => setPreset('lastWeek')}>Minulý týden</a></li>
              <li><a class:active={selectedPreset === 'thisMonth'} on:click={() => setPreset('thisMonth')}>Tento měsíc</a></li>
              <li><a class:active={selectedPreset === 'lastMonth'} on:click={() => setPreset('lastMonth')}>Minulý měsíc</a></li>
              <li><a class:active={selectedPreset === 'lastQuarter'} on:click={() => setPreset('lastQuarter')}>Poslední čtvrtletí</a></li>
              <li><a class:active={selectedPreset === 'thisYear'} on:click={() => setPreset('thisYear')}>Tento rok</a></li>
              <li><a class:active={selectedPreset === 'lastYear'} on:click={() => setPreset('lastYear')}>Minulý rok</a></li>
              <li><a class:active={selectedPreset === 'custom'} on:click={() => isCalendarOpen = true}>Vybrat období...</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Modální okno pro vlastní datum -->
{#if isCalendarOpen}
<div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" on:click|self={() => isCalendarOpen = false}>
  <div class="bg-white rounded-lg shadow-xl p-5 w-96 max-w-full">
    <h3 class="text-lg font-bold mb-4">Vyberte vlastní období</h3>

    <div class="form-control w-full mb-4">
      <label class="label">
        <span class="label-text">Od</span>
      </label>
      <input
        type="date"
        bind:value={customStartDate}
        class="input input-bordered w-full"
      />
    </div>

    <div class="form-control w-full mb-6">
      <label class="label">
        <span class="label-text">Do</span>
      </label>
      <input
        type="date"
        bind:value={customEndDate}
        class="input input-bordered w-full"
        min={customStartDate}
      />
    </div>

    <div class="flex justify-end gap-2">
      <button class="btn btn-outline" on:click={() => isCalendarOpen = false}>Zrušit</button>
      <button
        class="btn btn-outline"
        on:click={updateCustomRange}
        disabled={!isValidDateRange}
      >
        Potvrdit
      </button>
    </div>
  </div>
</div>
{/if}