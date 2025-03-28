<script lang="ts">

	export let data;
	let { texts } = data;
	$: ({ texts  } = data);

	const { generalSettings } = data;

	let src = "/srdce.png";
	// console.log(data);
</script>

<svelte:head>
	<title>{generalSettings.shopName} - Úvod</title>
	<meta
		name="description"
		content="Šťastné srdce nabízí zdravé stravování a rozvoz jídla v Mikulovicích a Jeseníku. Dietologické poradenství od Kamily Kučerové pro vaše zdraví a spokojenost." />
</svelte:head>


<section>
	<div class="max-w-screen-xl p-4 px-4 mx-auto sm:px-6 lg:px-8 py-26">
		<div class="">
			<div
				class="lg:grid lg:grid-flow-row-dense lg:grid-cols-2 lg:gap-8 lg:items-center">
				<div
					class="px-10 py-10 ml-auto bg-white rounded-md shadow-lg lg:col-start-2 lg:max-w-2xl border border-gray-300">
					<!-- <div class="grid justify-center pb-5">
					<dotlottie-player src="https://lottie.host/d45caad6-2a0a-4326-8860-ac9153f4c0f5/QYAGZ8Vk6g.json" background="transparent" speed="1" style="width: 200px; height: 200px;" loop autoplay></dotlottie-player>
					</div> -->
					<h2
						class="mt-2 text-3xl font-extrabold leading-8 text-slate-700 lg:text-4xl sm:leading-9">
						Vítejte na stránkách Šťastného srdce
					</h2>
					<p class="py-5">
						Náš tým odborníků <a href="/mgr-bc-kamila-kucerova" class="!underline">Mgr. Bc. Kamila Kučerová</a>, <a href="/mgr-martin-forejt-phd" class="!underline">Mgr. Martin Forejt Ph.D.</a>,
						<a href="/olga-bednarova" class="!underline">Olga Bednářová</a> Vám nabízí
					</p>
		<ul>
   <ul class="space-y-2">
  <li class="flex items-start gap-2">
    <img {src} alt="staste srdce" class="pt-1" width="22" height="22" />
    <div><a href="/obedy" class="hover:underline"><strong>kvalitní a zdravé obědy</strong></a> </div>
  </li>
		 <li class="flex items-start gap-2">
        <img {src} alt="staste srdce" class="pt-1" width="22" height="22" />
        <div><strong>odborné poradenství v oblasti výživy a preventivního lékařství</strong></div>
    </li>
 <li class="flex items-start gap-2">
        <img {src} alt="staste srdce" class="pt-1" width="22" height="22" />
        <div><strong>vytvoření systému HACCP pro všechny provozy pracující s potravinami</strong></div>
    </li>
		  <li class="flex items-start gap-2">
        <img {src} alt="staste srdce" class="pt-1" width="22" height="22" />
        <div><strong>realizace přednášek na různá témata z oblasti výživy</strong></div>
    </li>


</ul>


				</div>
				<div class="relative mt-10 lg:-mx-4 relative-20 lg:mt-0 lg:col-start-1">
					<div class="relative space-y-4">
						<div
							class="flex items-end justify-center space-x-4 lg:justify-start">
							<img
								class="w-32 rounded-lg shadow-lg md:w-56 floating-img"
								width="200"
								src="meal_01.jpg"
								alt="1" />
							<img
								class="w-40 rounded-lg shadow-lg md:w-64 floating-img2"
								width="260"
								src="meal_02.jpg"
								alt="2" />
						</div>
						<div
							class="flex items-start justify-center ml-12 space-x-4 lg:justify-start">
							<img
								class="w-24 rounded-lg shadow-lg md:w-40 floating-img2"
								width="170"
								src="meal_03.jpg"
								alt="3" />
							<img
								class="w-32 rounded-lg shadow-lg md:w-56 floating-img"
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

<div class="pt-10 mx-10 mt-10">
	<hr />
</div>

<section>
	<div class="">
		<div
			class="flex-wrap items-center justify-center gap-8 md:container md:mx-auto sm:flex">
			<section>
				<div class="max-w-screen-xl mx-auto px-4">
					<div class="mt-20">
						<h2
							class="mb-10 text-4xl font-extrabold tracking-tight text-center text-gray-900 lg:text-5xl">
							Info koutek
						</h2>
					</div>
					<!-- Grid container for texts -->
					<div
						class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
						{#if texts && texts.length > 0}
							{#each texts.filter(text => (text.title || text.text)) as text}
								<div class="w-full px-4 rounded-lg shadow-lg bg-slate-50 border border-gray-300">
									{#if text.title}
										<h3
											class="px-5 pt-10 text-3xl font-semibold text-gray-700 sm:text-xl">
											{text.title}
										</h3>
										<hr class="mx-5" />
									{/if}
									{#if text.text}
										<div class="p-5 mb-5 text-gray-600 text-md">
											{@html text.text}
										</div>
									{/if}
								</div>
							{/each}
						{:else}
							<div class="col-span-full text-center text-gray-500">
								Žádné texty k zobrazení
							</div>
						{/if}
					</div>
				</div>
			</section>
			<!--<div
				class="w-full px-4 rounded-lg shadow-lg sm:w-1/2 md:w-1/2 lg:w-1/4 bg-slate-50">
				<h3 class="px-5 pt-10 text-3xl font-semibold text-gray-700 sm:text-xl">
					Info na Prosinec 2022
				</h3>
				<hr class="mx-5" />
				<p class="p-5 mb-5 text-gray-600 text-md">
					Rok 2022 končí a my musíme vybrat ještě nějakou tu dovolenou, řádně
					oslavit svátky a trochu se zklidnit . 23.12., 30.12. dovolená. 26.12.
					Vánoční svátek. A 27.12., 28.12., 29.12. vaříme jen jedno jídlo.
				</p>
			</div>
			<div
				class="w-full px-4 rounded-lg shadow-lg sm:w-1/2 md:w-1/2 lg:w-1/4 bg-slate-50">
				<h3 class="px-5 pt-10 text-3xl font-semibold text-gray-700 sm:text-xl">
					2023 a kudy kam
				</h3>
				<hr class="mx-5" />
				<p class="p-5 mb-5 text-gray-600 text-md">
					Kam si to v tom Šťastném srdci směřujeme? Vize "Kudy kam" pro další
					roky máme. Zda je naplníme, je teď ve hvězdách. Nicméně trpělivě a
					krok po kroku k naplnění míříme. A tak pro tento rok, chceme rozšířit
					záhony s bylinami a zeleninou, pokračovat v uvědomělém kompostování
					celé hory slupek zeleniny a ovoce, pravidelně vytvářet picles
					(rychlokvašenou zeleninu) a zkusit používat na některé vařiče
					bioplynku.
				</p>
			</div>-->
			<!--<div
				class="w-full px-4 rounded-lg shadow-lg sm:w-1/2 md:w-1/2 lg:w-1/4 bg-slate-50">
				<h3 class="px-5 pt-10 text-3xl font-semibold text-gray-700 sm:text-xl">
					Pro vegetariány a vegany!
				</h3>
				<hr class="mx-5" />
				<p class="p-5 mb-5 text-gray-600 text-md">
					Naše "bezmasé trojky", potřebují posunout na vyšší level. Strávníků,
					kteří nechtějí jíst každý den maso přibývá. A my máme radost, že se
					trojky svým množstvím vyrovnají masitým meníčkům. Jenomže k nám
					nepřichází veganská (vegetariánská) inspirace a tak vyzýváme milovníky
					zvířat, napište email, co byste rádi na jídelníčku.
				</p>
			</div>-->
		</div>
	</div>
</section>

<style lang="postcss">
	.floating-img {
		transform: translateY(0%);
		/* animation: floater-y 30s infinite; */
		transition: ease 0.5s;
	}
	.floating-img2 {
		transform: translateX(0%);
		/* animation: floater-x 30s infinite; */
		transition: ease 0.5s;
	}
	@keyframes floater-y {
		0% {
			transform: translateY(-10%);
			transition: ease 0.5s;
		}
		50% {
			transform: translateY(10%);
			transition: ease 0.5s;
		}
	}
	@keyframes floater-x {
		0% {
			transform: translateX(-10%);
			transition: ease 0.5s;
		}
		50% {
			transform: translateX(10%);
			transition: ease 0.5s;
		}
	}
</style>
