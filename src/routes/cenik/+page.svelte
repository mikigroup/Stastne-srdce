<script lang="ts">
  export let data;

  const { generalSettings } = data;
</script>

<svelte:head>
  <title>{generalSettings.shopName} - Ceník</title>
  <meta name="description" content="Ceník nabízených služeb" />
</svelte:head>

<main>
  <section class="max-w-screen-xl px-4 py-16 mx-auto mt-10 mb-10 rounded-lg bg-stone-100">
    <h1 class="mb-8 text-4xl font-extrabold tracking-tight text-center text-gray-900 md:text-5xl">
      Ceník
    </h1>

    <div class="max-w-6xl mx-auto mt-10 bg-white border-2 rounded-lg shadow-md overflow-hidden">
      <!-- Sekce: Vyšetření a poradenství -->
      <div class="p-4 font-semibold text-lg bg-green-800 text-white">
        VYŠETŘENÍ A PORADENSTVÍ
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="text-xs uppercase bg-gray-100">
            <tr>
              <th class="px-4 py-3 w-1/3">SLUŽBA</th>
              <th class="px-4 py-3 w-1/2">POPIS</th>
              <th class="px-4 py-3 text-right w-1/5">CENA (Kč)</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b hover:bg-gray-50">
              <td class="px-4 py-3 font-medium">Vyšetření na přístroji InBody</td>
              <td class="px-4 py-3">Detailní hodnocení tělesného složení člověka a konzultace výsledků, součást vstupního vyšetření při dlouhodobé péči</td>
              <td class="px-4 py-3 text-right">750</td>
            </tr>
            <tr class="border-b hover:bg-gray-50">
              <td class="px-4 py-3 font-medium">Vyšetření Max Pulse Medicore</td>
              <td class="px-4 py-3">Vyšetření stavu a průchodnosti cév a aktivity vegetativního nervového systému plus konzultace výsledků</td>
              <td class="px-4 py-3 text-right">750</td>
            </tr>
            <tr class="border-b hover:bg-gray-50">
              <td class="px-4 py-3 font-medium">Vyšetření InBody a Max Pulse</td>
              <td class="px-4 py-3">Provedení obou vyšetření a konzultace výsledků</td>
              <td class="px-4 py-3 text-right">1 400</td>
            </tr>
            <tr class="border-b hover:bg-gray-50">
              <td class="px-4 py-3 font-medium">Jednotlivá konzultace obecná</td>
              <td class="px-4 py-3">Jakékoliv téma z oblasti výživy bez měření na přístroji InBody a vyšetření Max Pulse</td>
              <td class="px-4 py-3 text-right">1 600</td>
            </tr>
            <tr class="border-b hover:bg-gray-50 bg-gray-50">
              <td class="px-4 py-3 font-medium pl-8">Sleva</td>
              <td class="px-4 py-3">Stálí klienti, důchodci, děti a studenti do 18 let, ZTP</td>
              <td class="px-4 py-3 text-right">1 400</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Sekce: Konzultační balíčky -->
      <div class="p-4 font-semibold text-lg bg-green-800 text-white mt-8">
        KONZULTAČNÍ BALÍČKY
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="text-xs uppercase bg-gray-100">
            <tr>
              <th class="px-4 py-3 w-1/3">SLUŽBA</th>
              <th class="px-4 py-3 w-1/2">POPIS</th>
              <th class="px-4 py-3 text-right">CENA (Kč)</th>
            </tr>
          </thead>
          <tbody>
            <!-- 5 konzultací s InBody -->
            <tr class="border-b hover:bg-gray-50">
              <td class="px-4 py-3 font-medium">5 konzultací, max. doba 3 měsíce s vyšetřením InBody</td>
              <td class="px-4 py-3">Snižování či zvyšování váhy, metabolická onemocnění, součástí je 3x měření na přístroji InBody</td>
              <td class="px-4 py-3 text-right">7 500</td>
            </tr>
            <tr class="border-b hover:bg-gray-50 bg-gray-50">
              <td class="px-4 py-3 font-medium pl-8">Sleva</td>
              <td class="px-4 py-3">Stálí klienti, důchodci, děti a studenti do 18 let, ZTP</td>
              <td class="px-4 py-3 text-right">7 200</td>
            </tr>

            <!-- 5 konzultací s InBody a Max Pulse -->
            <tr class="border-b hover:bg-gray-50">
              <td class="px-4 py-3 font-medium">5 konzultací, max. doba 3 měsíce s vyšetřeními InBody a Max Pulse</td>
              <td class="px-4 py-3">Snižování či zvyšování váhy, metabolická onemocnění, součástí je 3x měření na přístroji InBody a 3x na Max Pulse</td>
              <td class="px-4 py-3 text-right">9 500</td>
            </tr>
            <tr class="border-b hover:bg-gray-50 bg-gray-50">
              <td class="px-4 py-3 font-medium pl-8">Sleva</td>
              <td class="px-4 py-3">Stálí klienti, důchodci, děti a studenti do 18 let, ZTP</td>
              <td class="px-4 py-3 text-right">9 200</td>
            </tr>

            <!-- 10 konzultací s InBody -->
            <tr class="border-b hover:bg-gray-50">
              <td class="px-4 py-3 font-medium">10 konzultací, max. doba 8 měsíců s vyšetřením InBody</td>
              <td class="px-4 py-3">Snižování či zvyšování váhy, metabolická onemocnění, součástí je 8x měření na přístroji InBody</td>
              <td class="px-4 py-3 text-right">14 800</td>
            </tr>
            <tr class="border-b hover:bg-gray-50 bg-gray-50">
              <td class="px-4 py-3 font-medium pl-8">Sleva</td>
              <td class="px-4 py-3">Stálí klienti, důchodci, děti a studenti do 18 let, ZTP</td>
              <td class="px-4 py-3 text-right">14 400</td>
            </tr>

            <!-- 10 konzultací s InBody a Max Pulse -->
            <tr class="border-b hover:bg-gray-50">
              <td class="px-4 py-3 font-medium">10 konzultací, max. doba 8 měsíců s vyšetřením InBody a Max Pulse</td>
              <td class="px-4 py-3">Snižování či zvyšování váhy, metabolická onemocnění, součástí je 8x měření na přístroji InBody a 5x na Max Pulse</td>
              <td class="px-4 py-3 text-right">18 200</td>
            </tr>
            <tr class="border-b hover:bg-gray-50 bg-gray-50">
              <td class="px-4 py-3 font-medium pl-8">Sleva</td>
              <td class="px-4 py-3">Stálí klienti, důchodci, děti a studenti do 18 let, ZTP</td>
              <td class="px-4 py-3 text-right">17 800</td>
            </tr>

            <!-- 20 konzultací s InBody -->
            <tr class="border-b hover:bg-gray-50">
              <td class="px-4 py-3 font-medium">20 konzultací, max. doba 12 měsíců s vyšetřením InBody</td>
              <td class="px-4 py-3">Snižování či zvyšování váhy, metabolická onemocnění, součástí je 18x měření na přístroji InBody</td>
              <td class="px-4 py-3 text-right">28 500</td>
            </tr>
            <tr class="border-b hover:bg-gray-50 bg-gray-50">
              <td class="px-4 py-3 font-medium pl-8">Sleva</td>
              <td class="px-4 py-3">Stálí klienti, důchodci, děti a studenti do 18 let, ZTP</td>
              <td class="px-4 py-3 text-right">28 000</td>
            </tr>

            <!-- 20 konzultací s InBody a Max Pulse -->
            <tr class="border-b hover:bg-gray-50">
              <td class="px-4 py-3 font-medium">20 konzultací, max. doba 12 měsíců s vyšetřením InBody a Max Pulse</td>
              <td class="px-4 py-3">Snižování či zvyšování váhy, metabolická onemocnění, součástí je 18x měření na přístroji InBody a 10x na Max Pulse</td>
              <td class="px-4 py-3 text-right">35 500</td>
            </tr>
            <tr class="border-b hover:bg-gray-50 bg-gray-50">
              <td class="px-4 py-3 font-medium pl-8">Sleva</td>
              <td class="px-4 py-3">Stálí klienti, důchodci, děti a studenti do 18 let, ZTP</td>
              <td class="px-4 py-3 text-right">35 000</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Sekce: Bemer a jídelníčky -->
      <div class="p-4 font-semibold text-lg bg-green-800 text-white mt-8">
        OSTATNÍ SLUŽBY
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="text-xs uppercase bg-gray-100">
            <tr>
              <th class="px-4 py-3 w-1/3">SLUŽBA</th>
              <th class="px-4 py-3 w-1/2">POPIS</th>
              <th class="px-4 py-3 text-right">CENA (Kč)</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b hover:bg-gray-50">
              <td class="px-4 py-3 font-medium">Bemer</td>
              <td class="px-4 py-3">Aplikace 30 minut</td>
              <td class="px-4 py-3 text-right">600</td>
            </tr>
            <tr class="border-b hover:bg-gray-50">
              <td class="px-4 py-3 font-medium"></td>
              <td class="px-4 py-3">Aplikace 60 minut</td>
              <td class="px-4 py-3 text-right">800</td>
            </tr>
            <tr class="border-b hover:bg-gray-50">
              <td class="px-4 py-3 font-medium">Vytvoření jídelníčku</td>
              <td class="px-4 py-3">Na týden</td>
              <td class="px-4 py-3 text-right">4 500</td>
            </tr>
            <tr class="border-b hover:bg-gray-50">
              <td class="px-4 py-3 font-medium"></td>
              <td class="px-4 py-3">Na 14 dnů</td>
              <td class="px-4 py-3 text-right">8 000</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Poznámka pod ceníkem -->
      <!-- Podmínky -->
      <div class="p-6 bg-gray-50 border-t">
        <h3 class="font-bold text-lg mb-3 text-gray-800">Důležité podmínky</h3>
        <ul class="space-y-2 text-sm">
          <li class="flex items-start">
            <span class="text-red-500 mr-2">•</span>
            <p><strong>Neomluvená návštěva</strong> (telefonem či emailem) je brána jako proběhlá konzultace!</p>
          </li>
          <li class="flex items-start">
            <span class="text-red-500 mr-2">•</span>
            <p><strong>Omluva</strong> je akceptována nejpozději 4 hodiny před začátkem konzultace telefonem a nejpozději den dopředu emailem.</p>
          </li>
          <li class="flex items-start">
            <span class="text-red-500 mr-2">•</span>
            <p><strong>Záloha či celá úhrada</strong> vybraného počtu konzultací je nevratná, stejně i v případě vypršení maximální doby návštěv.</p>
          </li>
          <li class="flex items-start">
            <span class="text-red-500 mr-2">•</span>
            <p><strong>Délka konzultace</strong> není zcela omezena časem. Délku konzultace určuje terapeut.</p>
          </li>
        </ul>
      </div>

      <div class="p-4 bg-gray-50 border-t italic text-sm">
        <p>Ceny jsou uvedeny v Kč a jsou platné od 1.3.2025. Změna cen vyhrazena.</p>
      </div>
    </div>

    <!-- CTA sekce -->
    <div class="mt-12 text-center">
      <p class="mb-6 text-lg">Máte otázky ohledně našich služeb nebo ceníku?</p>
      <a
        href="/kontakt"
        class="px-6 py-3 text-center text-white bg-green-800 rounded-lg shadow-md hover:bg-green-900 transition-colors inline-block">
        Kontaktujte nás
      </a>
    </div>
  </section>
</main>

<style>
  /* Optimalizované styly pro konzistentní tabulku */
  table {
    table-layout: fixed;
    width: 100%;
  }

  th, td {
    white-space: normal;
    overflow-wrap: break-word;
    word-wrap: break-word;
    vertical-align: top;
  }

  /* První sloupec - služba */
  th:first-child,
  td:first-child {
    width: 35%;
  }

  /* Druhý sloupec - popis */
  th:nth-child(2),
  td:nth-child(2) {
    width: 45%;
  }

  /* Třetí sloupec - cena */
  th:last-child,
  td:last-child {
    width: 20%;
  }

  /* Pro mobilní zařízení jiné rozložení */
  @media (max-width: 640px) {
    table {
      font-size: 0.75rem;
      table-layout: auto;
    }

    th, td {
      padding: 0.5rem 0.25rem;
    }
  }
</style>