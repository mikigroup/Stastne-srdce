<script lang="ts">
  import { page } from "$app/stores";
  export let data;

  const { generalSettings } = data;
</script>

<svelte:head>
  <title>{generalSettings.shopName} - Mgr. Martin Forejt, Ph.D.</title>
  <meta name="description" content="Mgr. Martin Forejt, Ph.D. - odborný asistent Lékařské fakulty Masarykovy univerzity v Brně, výzkumník a specialista na výživu a preventivní lékařství." />
</svelte:head>

<main>
  <section class="max-w-screen-xl px-4 py-8 mx-auto mt-6 mb-6 rounded-lg bg-stone-100">
    <div class="max-w-3xl mx-auto">
      <div class="bg-white border rounded-lg p-6">
        <h1 class="text-3xl font-bold text-gray-900 border-b pb-3 mb-4">Mgr. Martin Forejt, Ph.D.</h1>

        <div class="prose max-w-none">
          <p>
            S Martinem se potkáte tváří v tvář nejen v poradně, ale třeba i když Vám bude předávat
            s úsměvem Váš oběd.
          </p>

          <h2 class="text-xl font-bold mt-4 mb-2">Vzdělání</h2>
          <p>
            Vystudoval obory Výživa člověka a Zdravotní vědy na Lékařské fakultě Masarykovy
            univerzity v Brně a následně i doktorské studium Hygiena, preventivní lékařství a
            epidemiologie.
          </p>

          <h2 class="text-xl font-bold mt-4 mb-2">Akademická činnost</h2>
          <p>
            Od roku 2004 až dosud je odborným asistentem na Lékařské fakultě Masarykovy
            univerzity v Brně na Ústavu veřejného zdraví.
          </p>
          <p>
            Věnuje se výživě dospělých a dětí, přednáší lékařským a nelékařským oborům a aktivně
            se zabývá výzkumnou činností v oblasti výživy a preventivního lékařství.
          </p>

          <h2 class="text-xl font-bold mt-4 mb-2">Výzkumné projekty</h2>
          <ul class="list-disc pl-5">
            <li>Obezita a její genetické pozadí (2004-2015)</li>
            <li>Hodnocení kardiovaskulárních charakteristik a funkce autonomního nervového systému u účastníků výpravy na Antarktidu (2019-2020)</li>
            <li>Bazální metabolismus a výživová spotřeba ve vztahu k nadváze a obezitě (2021)</li>
            <li>Hodnocení změn tělesného složení po konzumaci potravin a nápojů (2022)</li>
            <li>Studie vlivu přerušovaného hladovění (intermittent fasting) na tělesné složení člověka (2023)</li>
          </ul>

          <p>
            Účastní se vědeckých konferencí v České republice a v zahraničí a je autorem řady odborných českých i
            mezinárodních publikací.
          </p>

          <h2 class="text-xl font-bold mt-4 mb-2">Odborná praxe a spolupráce</h2>
          <ul class="list-disc pl-5">
            <li>Stálý odborný člen EFSA (European Food Safety Authority)</li>
            <li>Konzultant výživy a preventivního lékařství v médiích</li>
            <li>Školitel v oblasti výživy a zdravého životního stylu pro nadnárodní a české firmy</li>
            <li>Realizoval odborné studie pro firmy Danone, a.s. a Karlovarské minerální vody, a.s.</li>
          </ul>

          <h2 class="text-xl font-bold mt-4 mb-2">Poradenská činnost</h2>
          <p>
            Od roku 2003 až dosud vede soukromou poradnu pro výživu a preventivní lékařství
            v Brně. Předtím pracoval 2 roky v poradně pro výživu a odvykání kouření na Masarykově
            onkologickém ústavu v Brně.
          </p>
          <p>
            Velmi cenná pro budoucí poradenství v oblasti dětské výživy
            byla také jeho praxe na I. dětské interní klinice v Dětské nemocnici v Brně.
          </p>
        </div>

        <div class="mt-6 text-center">
          <a
            href="/kontakt"
            class="px-4 py-2 text-white bg-green-800 rounded hover:bg-green-900">
            Objednat konzultaci
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