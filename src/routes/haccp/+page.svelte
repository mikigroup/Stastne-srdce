<script lang="ts">
  export let data;

  const { generalSettings } = data;
</script>

<svelte:head>
  <title>{generalSettings.shopName} - HACCP</title>
  <meta name="description" content="Služby v oblasti HACCP - vytvoření systému kontroly kritických bodů pro restaurace, vyvařovny, obchody a další gastronomické provozy." />
</svelte:head>

<main>
  <section class="max-w-screen-xl px-4 py-16 mx-auto mt-10 mb-10 rounded-lg bg-stone-100">
    <h1 class="mb-8 text-4xl font-extrabold tracking-tight text-center text-gray-900 md:text-5xl">
      HACCP
    </h1>

    <div class="max-w-4xl mx-auto">
      <div class="bg-white border rounded-lg shadow-md p-8 border-gray-400">
        <div class="prose prose-lg max-w-none">
          <div class="mb-8 text-lg font-medium text-center bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
            <p>
              Potřebujete vytvořit systém HACCP ve Vaší restauraci, vyvařovně, obchodu s potravinami,
              výrobně, bistru, kavárně?
            </p>
            <a
              href="/kontakt"
              class="mt-4 px-6 py-3 text-center text-white bg-green-800 rounded-lg shadow-md hover:bg-green-900 transition-colors inline-block !no-underline">
              Obraťte se na nás
            </a>
          </div>

          <h2 class="text-2xl font-bold text-gray-800 mt-10 mb-4">Jak postupujeme</h2>

          <p class="mb-6">
            Spolu vytvoříme systém kontroly kritických bodů tak, aby vyhovoval podmínkám a
            možnostem vaší provozovny a pomohl ji rozvíjet. Budeme hledat vždy to nejjednodušší
            řešení.
          </p>
          <p class="mb-6 font-semibold">
            Cenu za vytvoření a vedení HACCP si domluvíme při osobním setkání.
          </p>
          <p class="">
            Komu jsme již HACCP vytvořili?<br>
						Kuchyň Šťastné srdce Mikulovice, výrobna Šípkového vína Česká Ves, restaurace Mlýnice
						Jeseník, Obchůdek Zdravé výživy Jeseník, Bistro Hotel M Jeseník, Zdravá kavárna. Školní
						bufet Nábřežní Jeseník, Kino Jeseník a další.
          </p>
        </div>
      </div>
    </div>
  </section>
</main>

<style>
  /* Doplňkové styly pro lepší čitelnost a formátování textu */
  .prose p {
    line-height: 1.7;
    color: #374151;
  }

  .prose h2 {
    color: #1f2937;
    margin-top: 2rem;
    margin-bottom: 1rem;
  }

  @media (max-width: 640px) {
    .prose {
      font-size: 1rem;
    }

    h1 {
      font-size: 2rem;
    }

    h2 {
      font-size: 1.5rem;
    }
  }
</style>