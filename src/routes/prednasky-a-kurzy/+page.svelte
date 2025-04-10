<script lang="ts">
	export let data;

	const { generalSettings } = data;
</script>

<svelte:head>
	<title>{generalSettings.shopName} - Přednášky a kurzy</title>
	<meta name="description" content="Nabízíme odborné přednášky o výživě a zdravém životním stylu pro školy, zájmové skupiny a firmy, a také workshopy pro školní kuchyně." />
</svelte:head>

<main>
	<section class="max-w-screen-xl px-4 py-16 mx-auto mt-10 mb-10 rounded-lg bg-stone-100">
		<h1 class="mb-8 text-4xl font-extrabold tracking-tight text-center text-gray-900 md:text-5xl">
			Přednášky a školení
		</h1>

		<div class="max-w-4xl mx-auto">
			<!-- Sekce Přednášky -->
			<div class="bg-white border rounded-lg shadow-md p-8 mb-8 border-gray-400">
				<h2 class="text-3xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200">
					Přednášky
				</h2>

				<div class="prose prose-lg max-w-none">
					<p class="mb-6">
						Nabízíme dlouholeté zkušenosti s přednáškovou činností. Přednášky je možné realizovat pro
						školy, různé věkové, zájmové a sportovní skupiny obyvatel i pro zaměstnance firem.
					</p>

					<div class="bg-green-50 p-6 rounded-lg border-l-4 border-green-500 mb-6">
						<p>
							Pro dosažení nejvyšší kvality a efektivity předchází samotné přednášce schůzka, kde se
							dojednává téma, způsob provedení, prostory, technické zázemí apod.
						</p>
					</div>

					<p class="mb-6">
						Výživa a životní styl je velmi široké téma, proto si konkrétnější zaměření přednášky můžete
						zvolit dle individuálních požadavků.
					</p>

					<div class="flex flex-col md:flex-row gap-6 my-8">
						<div class="md:w-1/2 bg-gray-50 p-5 rounded-lg border shadow-sm border-gray-400">
							<h3 class="text-xl font-semibold mb-3 text-gray-800">Dodatečné služby</h3>
							<p>
								Na přednášku může volně navázat provádění analýzy tělesného složení na přístroji InBody
								S10 nebo analýza kardiovaskulárního systému a stresu přístrojem Max Pulse.
							</p>
						</div>

						<div class="md:w-1/2 bg-gray-50 p-5 rounded-lg border border-gray-400 shadow-sm">
							<h3 class="text-xl font-semibold mb-3 text-gray-800">Cena</h3>
							<p>
								Cena přednášky se stanovuje dohodou a zahrnuje i cestovné.
							</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Sekce Školení -->
			<div class="bg-white border border-gray-400 rounded-lg shadow-md p-8 border-gray-400">
				<h2 class="text-3xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200">
					Školení
				</h2>

				<div class="prose prose-lg max-w-none">
					<p class="mb-6">
						Nabízíme možnost workshopů pro školní kuchyně při zavádění bezlepkové stravy nebo pro
						vaření s netradičními surovinami.
					</p>

					<div class="bg-gray-50 p-5 rounded-lg border border-gray-400 shadow-sm">
						<h3 class="text-xl font-semibold mb-3 text-gray-800">Cena</h3>
						<p>
							Cena školení se stanovuje dohodou a zahrnuje i cestovné.
						</p>
					</div>
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
            font-size: 1.75rem;
        }
    }
</style>