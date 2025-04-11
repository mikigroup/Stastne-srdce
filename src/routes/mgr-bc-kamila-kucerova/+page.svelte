<script lang="ts">
	import { page } from "$app/stores";
	export let data;

	const { generalSettings } = data;
</script>

<svelte:head>
	<title>{generalSettings.shopName} - Mgr. Bc. Kamila Kučerová</title>
	<meta name="description" content="Mgr. Bc. Kamila Kučerová - dietoložka, zakladatelka Šťastného srdce a specialistka na zdravou výživu s 15 letou praxí." />
</svelte:head>

<main>
	<section class="max-w-screen-xl px-4 py-8 mx-auto mt-6 mb-6 rounded-lg bg-stone-100">
		<div class="max-w-3xl mx-auto">
			<div class="bg-white border rounded-lg p-6">
				<h1 class="text-3xl font-bold text-gray-900 border-b pb-3 mb-4">Mgr. Bc. Kamila Kučerová</h1>

				<div class="prose max-w-none">
					<p>
						Kamilka vymýšlí a vaří všechna ta báječná jídla, pro která řada strávníků jí se Šťastným
						srdcem již 15 let. Potkáte se s ní osobně při předávání obědů a v naší poradně pro výživu.
						Poznávací znamení je neustálý, krásný úsměv na tváři.
					</p>

					<h2 class="text-xl font-bold mt-4 mb-2">Vzdělání</h2>
					<p>
						Vystudovala obory Výživa člověka a Zdravotní vědy na Lékařské fakultě Masarykovy
						univerzity.
					</p>

					<h2 class="text-xl font-bold mt-4 mb-2">Profesní kariéra</h2>
					<p>
						<strong>2001-2005:</strong> Založila a vedla dietologickou poradnu v nemocnici Bruntál.
						Současně pracovala v nemocniční jídelně při plánování dietních pokrmů a organizaci dietní kuchyně.
					</p>

					<p>
						<strong>2006-2009:</strong> Pracovala v Lázních Dolní Lipová jako dietolog a v lázeňské
						kuchyni plánovala dietní stravu.
					</p>

					<p>
						<strong>Od 2010:</strong> Věnuje se vytváření systému HACCP pro gastroprovozy.
					</p>

					<p>
						<strong>2008:</strong> Otevřela v Jeseníku poradnu pro výživu a zdravý životní styl.
					</p>

					<p>
						<strong>2010-současnost:</strong> Založila kuchyň, kde začala připravovat pro své klienty
						první obědy s přihlédnutím k jejich zdravotním potřebám. Postupně se během 15 let kuchyň
						rozvinula tak, že vaří pro celé Jesenicko.
					</p>

					<p>
						Záměrem vzniku kuchyně bylo umožnit co největší skupině lidí seznámit se s potravinami
						a hotovými jídly, která jim budou pomáhat nejen udržet, ale i podpořit zdraví.
					</p>

					<p>
						<strong>2012:</strong> Přednášela v rámci rekvalifikačního studia Výživový poradce na
						Masérské a trenérské škole v Brně.
					</p>

					<h2 class="text-xl font-bold mt-4 mb-2">Aktuální činnost</h2>
					<p>
						Díky náročnému provozu kuchyně činnost v poradně na pár let přerušila, ale nyní svou
						poradenskou činnost opět obnovuje.
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