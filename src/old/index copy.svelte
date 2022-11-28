<script context="module">
	export const prerender = true; // static generate page
</script>


<style>

</style>

<svelte:head>
	<title>Šťastné srdce - Úvod</title>
</svelte:head>

<main>
	<section>

		<div
			class="max-w-screen-xl p-4 bg-white dark:bg-gray-800 mx-auto px-4 sm:px-6 lg:px-8 relative
			py-26 lg:mt-10">
			<div class="relative">
				<div class="lg:grid lg:grid-flow-row-dense lg:grid-cols-2 lg:gap-8 lg:items-center">
					<div
						class="py-10 px-10 bg-white shadow-lg rounded-md dark:bg-gray-800 lg:col-start-2
						lg:max-w-2xl ml-auto">
						<h4
							class="mt-2 text-2xl leading-8 font-extrabold text-slate-700 dark:text-white
							sm:text-3xl sm:leading-9">
							Vítejte na stránkách Šťastného srdce
						</h4>
						<p class="text-md leading-6 text-gray-500 dark:text-gray-300">
							Vaříme zdravé jídlo
						</p>
						<ul class="mt-8 md:grid md:grid-cols-2 md:gap-3 sm:gap-1">
							<li class="mt-6 lg:mt-0">
								<div class="flex">
									<span
										class="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full
										bg-green-100 text-green-800 dark:text-green-500 drark:bg-transparent">
										<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
											<path
												fill-rule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0
												011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clip-rule="evenodd" />
										</svg>
									</span>
									<span
										class="ml-4 text-base leading-6 text-gray-600 dark:text-gray-200">
										Vegetariánské jídlo
									</span>
								</div>
							</li>
							<li class="mt-6 lg:mt-0">
								<div class="flex">
									<span
										class="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full
										bg-green-100 text-green-800 dark:text-green-500 drark:bg-transparent">
										<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
											<path
												fill-rule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0
												011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clip-rule="evenodd" />
										</svg>
									</span>
									<span
										class="ml-4 text-base leading-6 font-medium text-gray-600 dark:text-gray-200">
										Rozvoz jídla
									</span>
								</div>
							</li>
							<li class="mt-6 lg:mt-0">
								<div class="flex">
									<span
										class="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full
										bg-green-100 text-green-800 dark:text-green-500 drark:bg-transparent">
										<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
											<path
												fill-rule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0
												011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clip-rule="evenodd" />
										</svg>
									</span>
									<span
										class="ml-4 text-base leading-6 font-medium text-gray-600 dark:text-gray-200">
										Cena 95,-
									</span>
								</div>
							</li>
							<li class="mt-6 lg:mt-0">
								<div class="flex">
									<span
										class="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full
										bg-green-100 text-green-800 dark:text-green-500 drark:bg-transparent">
										<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
											<path
												fill-rule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0
												011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clip-rule="evenodd" />
										</svg>
									</span>
									<span
										class="ml-4 text-base leading-6 font-medium text-gray-600 dark:text-gray-200">
										Do krabičky nebo do ešusu
									</span>
								</div>
							</li>
						</ul>
					</div>
					<div class="mt-10 lg:-mx-4 relative relative-20 lg:mt-0 lg:col-start-1">
						<div class="relative space-y-4">
							<div class="flex items-end justify-center lg:justify-start space-x-4">
								<img
									class="rounded-lg shadow-lg w-32 md:w-56"
									width="200"
									src="meal_01.jpg"
									alt="1" />
								<img
									class="rounded-lg shadow-lg w-40 md:w-64"
									width="260"
									src="meal_02.jpg"
									alt="2" />
							</div>
							<div class="flex items-start justify-center lg:justify-start space-x-4 ml-12">
								<img
									class="rounded-lg shadow-lg w-24 md:w-40"
									width="170"
									src="meal_03.jpg"
									alt="3" />
								<img
									class="rounded-lg shadow-lg w-32 md:w-56"
									width="200"
									src="meal_04.jpg"
									alt="4" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<div class="mt-10">
		<hr />
	</div>

	<section>

		<div class="sm:flex flex-wrap justify-center items-center text-center gap-8">
			<div
				class="w-full sm:w-1/2 md:w-1/2 lg:w-1/4 px-4 py-4 bg-white mt-6 shadow-lg rounded-lg
				dark:bg-gray-800">
				<div class="flex-shrink-0">
					<div
						class="flex items-center mx-auto justify-center h-12 w-12 rounded-md bg-green-100
						text-green-800 dark:text-green-500 drark:bg-transparent text-white">
						<svg
							width="20"
							height="20"
							fill="currentColor"
							class="h-6 w-6"
							viewBox="0 0 1792 1792"
							xmlns="http://www.w3.org/2000/svg">
							<path
								d="M491 1536l91-91-235-235-91 91v107h128v128h107zm523-928q0-22-22-22-10 0-17 7l-542
								542q-7 7-7 17 0 22 22 22 10 0 17-7l542-542q7-7 7-17zm-54-192l416 416-832
								832h-416v-416zm683 96q0 53-37 90l-166 166-416-416 166-165q36-38 90-38 53 0 91 38l235
								234q37 39 37 91z" />
						</svg>
					</div>
				</div>
				<h3 class="text-2xl sm:text-xl text-gray-700 font-semibold dark:text-white pt-4">
					Bez obalu 1
				</h3>
				<p class="text-md text-gray-500 dark:text-gray-300 py-4">
					Odpady sice v kuchyni poctivě třídíme, ale se surovinami, byť kvalitními, si do kuchyně
					přivážíme neskutečné množství obalů. A proto se pouštíme do nákupu bez obalu. Nyní tvoříme
					sklad pro luštěniny, obiloviny a výrobky z nich, jsou od českých pěstitelů a většina v bio
					kvalitě. Při plánování jsme si spočítali, že průměrná měsíční spotřeba luštěnin strávníků
					ze Šťastného srdce je úctyhodných 55kg:). Sklad začne fungovat od února 2021. A pak budeme
					pokračovat dál.
				</p>
			</div>
			<div
				class="w-full sm:w-1/2 md:w-1/2 lg:w-1/4 px-4 py-4 mt-6 sm:mt-16 md:mt-20 lg:mt-24 bg-white
				shadow-lg rounded-lg dark:bg-gray-800">
				<div class="flex-shrink-0">
					<div
						class="flex items-center mx-auto justify-center h-12 w-12 rounded-md bg-green-100
						text-green-800 dark:text-green-500 drark:bg-transparent text-white">
						<svg
							width="20"
							height="20"
							fill="currentColor"
							class="h-6 w-6"
							viewBox="0 0 1792 1792"
							xmlns="http://www.w3.org/2000/svg">
							<path
								d="M491 1536l91-91-235-235-91 91v107h128v128h107zm523-928q0-22-22-22-10 0-17 7l-542
								542q-7 7-7 17 0 22 22 22 10 0 17-7l542-542q7-7 7-17zm-54-192l416 416-832
								832h-416v-416zm683 96q0 53-37 90l-166 166-416-416 166-165q36-38 90-38 53 0 91 38l235
								234q37 39 37 91z" />
						</svg>
					</div>
				</div>
				<h3 class="text-2xl sm:text-xl text-gray-700 font-semibold dark:text-white pt-4">
					Změna v jídelníčku 24.6.a 25.6.
				</h3>
				<p class="text-md text-gray-500 dark:text-gray-300 py-4">
					24.6. a 25.6. se omlouváme za změnu. Máme Vám dodat bramborovou kaší, ale máme již
					nakoupeny nové brambory a z nich kaši neuděláme a to nás před měsícem při plánování
					nenapadlo. Omlouváme se a děkujeme za tolerování změny.
				</p>
			</div>
			<div
				class="w-full sm:w-1/2 md:w-1/2 lg:w-1/4 mt-6 px-4 py-4 bg-white shadow-lg rounded-lg
				dark:bg-gray-800">
				<div class="flex-shrink-0">
					<div
						class="flex items-center mx-auto justify-center h-12 w-12 rounded-md bg-green-100
						text-green-800 dark:text-green-500 drark:bg-transparent text-white">
						<svg
							width="20"
							height="20"
							fill="currentColor"
							class="h-6 w-6"
							viewBox="0 0 1792 1792"
							xmlns="http://www.w3.org/2000/svg">
							<path
								d="M491 1536l91-91-235-235-91 91v107h128v128h107zm523-928q0-22-22-22-10 0-17 7l-542
								542q-7 7-7 17 0 22 22 22 10 0 17-7l542-542q7-7 7-17zm-54-192l416 416-832
								832h-416v-416zm683 96q0 53-37 90l-166 166-416-416 166-165q36-38 90-38 53 0 91 38l235
								234q37 39 37 91z" />
						</svg>
					</div>
				</div>
				<h3 class="text-2xl sm:text-xl text-gray-700 font-semibold dark:text-white pt-4">
					Prázdniny 2020
				</h3>
				<p class="text-md text-gray-500 dark:text-gray-300 py-4">
					V červenci, v pondělí 6.7., slavíme státní svátek , vařit nebudeme a dovolenou si vybereme
					v srpnu od 21.8. do 31.8. Na začátku prázdnin nás bude v kuchyni o polovinu méně a tak
					prosíme o toleranci s případnými nedostatky. Všem našim věrným strávníkům a také těm nově
					příchozím vzkazujeme: Děkujeme za Vás!
				</p>
			</div>
		</div>
	</section>

</main>
