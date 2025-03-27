<script lang="ts">
  export let data;

  const { generalSettings } = data;
</script>

<svelte:head>
  <title>{generalSettings.shopName} - Olga Bednářová</title>
  <meta name="description" content="Olga Bednářová - kuchařka Šťastného srdce, která od roku 2010 připravuje výživná a chutná jídla." />
</svelte:head>

<main>
  <section class="max-w-screen-xl px-4 py-8 mx-auto mt-6 mb-6 rounded-lg bg-stone-100">
    <div class="max-w-3xl mx-auto">
      <div class="bg-white border rounded-lg p-6">
        <h1 class="text-3xl font-bold text-gray-900 border-b pb-3 mb-4">Olga Bednářová</h1>

        <div class="prose max-w-none">
          <p>
            Olinka je sestra Kamilky. Již od roku 2010 pro vás připravuje obědy od prvotního oloupání a
            nakrájení surovin, až po uložení obědů do nosiče. I ji můžete potkat při rozvážení obědů.
          </p>

          <p>
            Kromě toho všeho, ale i báječně peče, a kdo ochutnal například její vánoční cukroví, nechce
            již jiné.
          </p>

          <h2 class="text-xl font-bold mt-4 mb-2">Pracovní náplň</h2>
          <ul class="list-disc pl-5">
            <li>Příprava surovin pro vaření</li>
            <li>Asistence při přípravě zdravých pokrmů</li>
            <li>Balení a distribuce obědů</li>
            <li>Pečení speciálních dezertů a cukroví</li>
          </ul>

          <h2 class="text-xl font-bold mt-4 mb-2">Součást týmu Šťastného srdce</h2>
          <p>
            Olga je nedílnou součástí týmu Šťastného srdce a spolu s Kamilou a Martinem se podílí na přípravě zdravých a chutných pokrmů, které pomáhají našim klientům udržovat zdravý životní styl.
          </p>
          <p>
            Díky pečlivé přípravě a pozornosti k detailu jsou naše pokrmy nejen zdravé, ale také vizuálně atraktivní a plné chuti.
          </p>
        </div>

        <div class="mt-6 text-center">
          <a
            href="/obedy"
            class="px-4 py-2 text-white bg-green-800 rounded hover:bg-green-900">
            Prohlédnout jídelníček
          </a>
        </div>
      </div>
    </div>
  </section>
</main>

<style>
  .prose {
    color: #374151;
    line-height: 1.6;
  }

  .prose p {
    margin-bottom: 0.75rem;
  }

  .prose ul {
    margin-bottom: 0.75rem;
  }
</style>