<script lang="ts">
	import type { PageData } from "./$types";

	export let data: PageData;

	// Definice alergenů
	const allergens = [
		{
			id: 1,
			name: "Obiloviny",
			description: "Pšenice, žito, ječmen, oves, špalda, kamut nebo jejich hybridní odrůdy a výrobky z nich"
		},
		{
			id: 2,
			name: "Korýši",
			description: "a výrobky z nich"
		},
		{
			id: 3,
			name: "Vejce",
			description: "a výrobky z nich"
		},
		{
			id: 4,
			name: "Ryby",
			description: "a výrobky z nich"
		},
		{
			id: 5,
			name: "Podzemnice olejná (arašídy)",
			description: "a výrobky z ní"
		},
		{
			id: 6,
			name: "Sójové boby (sója)",
			description: "a výrobky z nich"
		},
		{
			id: 7,
			name: "Mléko",
			description: "a výrobky z něj"
		},
		{
			id: 8,
			name: "Skořápkové plody",
			description: "Mandle, lískové ořechy, vlašské ořechy, kešu ořechy, pekanové ořechy, para ořechy, pistácie, makadamie a výrobky z nich"
		},
		{
			id: 9,
			name: "Celer",
			description: "a výrobky z něj"
		},
		{
			id: 10,
			name: "Hořčice",
			description: "a výrobky z ní"
		},
		{
			id: 11,
			name: "Sezamová semena (sezam)",
			description: "a výrobky z nich"
		},
		{
			id: 12,
			name: "Oxid siřičitý a siřičitany",
			description: "v koncentracích vyšších než 10 mg, ml/kg, l, vyjádřeno SO2"
		},
		{
			id: 13,
			name: "Vlčí bob (lupina)",
			description: "a výrobky z něj"
		},
		{
			id: 14,
			name: "Měkkýši",
			description: "a výrobky z nich"
		}
	];

	// Funkce pro získání barvy alergenu - pro vizuální rozlišení
	function getAllergenColor(id: number): string {
		const colors = [
			"bg-amber-50 border-amber-200",
			"bg-blue-50 border-blue-200",
			"bg-green-50 border-green-200",
			"bg-purple-50 border-purple-200",
			"bg-orange-50 border-orange-200",
			"bg-teal-50 border-teal-200",
			"bg-red-50 border-red-200",
			"bg-lime-50 border-lime-200",
			"bg-indigo-50 border-indigo-200",
			"bg-pink-50 border-pink-200",
			"bg-cyan-50 border-cyan-200",
			"bg-yellow-50 border-yellow-200",
			"bg-emerald-50 border-emerald-200",
			"bg-violet-50 border-violet-200"
		];

		return colors[(id - 1) % colors.length];
	}

	// Funkce pro získání text barvy alergenu
	function getAllergenTextColor(id: number): string {
		const colors = [
			"text-amber-800",
			"text-blue-800",
			"text-green-800",
			"text-purple-800",
			"text-orange-800",
			"text-teal-800",
			"text-red-800",
			"text-lime-800",
			"text-indigo-800",
			"text-pink-800",
			"text-cyan-800",
			"text-yellow-800",
			"text-emerald-800",
			"text-violet-800"
		];

		return colors[(id - 1) % colors.length];
	}
</script>

<svelte:head>
	<title>Šťastné srdce - Alergeny</title>
	<meta name="description" content="Přehled všech alergenů" />
</svelte:head>

<main>
	<section class="max-w-screen-lg py-16 mx-auto mt-20 mb-10 rounded-lg md:px-4 bg-stone-100">
		<h1 class="mb-10 text-5xl font-extrabold tracking-tight text-center text-gray-900">
			Alergeny
		</h1>

		<div class="max-w-4xl p-5 md:p-10 mx-auto bg-white border border-gray-400 rounded-lg">
			<p class="mb-6 text-gray-700">
				V našich jídlech mohou být obsaženy následující alergeny. Podle evropské legislativy jsme povinni označit přítomnost těchto alergenů v našich pokrmech.
				Pokud máte jakékoliv dotazy ohledně alergenů v našich jídlech, neváhejte nás kontaktovat.
			</p>

			<div class="mt-10 border md:mx-10 md:p-5 bg-orange-50 border-gray-300">
				<div class="p-2 my-3 border rounded-lg bg-stone-100 border-gray-500">
					<div class="py-1 bg-green-800 rounded-lg shadow-md sm:py-3 mt-5">
						<p class="pl-3 text-2xl font-bold tracking-tight text-gray-200">
							Seznam alergenů
						</p>
					</div>

					<div class="my-3 border border-gray-400 rounded-lg shadow-md md:p-8">
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							{#each allergens as allergen (allergen.id)}
								<div class="border rounded-2xl p-5 mb-4 border-gray-400 {getAllergenColor(allergen.id)}">
									<div class="p-2 {getAllergenTextColor(allergen.id)}">
										<div class="flex items-center mb-2">
											<div class="w-8 h-8 rounded-full flex items-center justify-center bg-white border-2 border-current mr-3">
												<span class="font-bold">{allergen.id}</span>
											</div>
											<div class="font-bold text-lg">{allergen.name}</div>
										</div>
										<div class="pl-11 text-sm">
											{allergen.description}
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>

					<div class="my-6 p-5 border rounded-lg border-gray-400 bg-white">
						<h2 class="text-xl font-bold mb-3 text-green-800">Informace o alergenech</h2>
						<p class="mb-3">
							Pokud máte potravinovou alergii nebo intoleranci, informujte nás prosím před objednáním.
							Naši pracovníci vám rádi poskytnou informace o alergenech v pokrmech.
						</p>
						<p class="mb-3">
							Přestože věnujeme velkou pozornost prevenci křížové kontaminace,
							připravujeme jídlo v prostředí, kde se používají alergeny, proto nemůžeme zcela vyloučit stopová
							množství alergenů v našich pokrmech.
						</p>
						<p>
							Pro více informací o alergenech v našem jídelníčku nás kontaktujte na
							<a href="/kontakt" class="text-green-700 underline hover:text-green-900">kontaktní stránce</a>.
						</p>
					</div>
				</div>
			</div>
		</div>

		<div class="flex justify-end gap-4 pt-10 pr-5">
			<a
				href="/obedy"
				class="px-4 py-2 text-center text-white bg-green-800 rounded-lg shadow-md hover:bg-green-900">
				Zpět na jídelníček
			</a>
		</div>
	</section>
</main>