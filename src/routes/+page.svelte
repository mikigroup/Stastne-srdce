<script lang="ts">
	interface Props {
		data: any;
		params?: Record<string, string>; // Potlačení varování o neznámé prop
	}

	let { data, params = {} }: Props = $props();
	let texts = $derived((data.texts ?? []) as any[]);

	const { generalSettings } = data;

	let src = "/srdce.png";

	let appeal = $derived((texts || []).find(
		(text: any) =>
			text?.position === "center" && /pavlíkovi/i.test(text.title || "") && text.text
	));

	let appealOpen = $state(false);
	let appealExpanded = $state(false);

	function toggleAppeal(event: MouseEvent) {
		event.preventDefault();
		if (appealExpanded) {
			appealExpanded = false;
			return;
		}
		appealOpen = true;
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				appealExpanded = true;
			});
		});
	}

	function onAppealContentTransitionEnd(event: TransitionEvent) {
		if (event.propertyName !== "grid-template-rows") return;
		if (!appealExpanded) {
			appealOpen = false;
		}
	}

	function scrollToInfoKoutek(event: MouseEvent) {
		const target = document.getElementById("info-koutek");
		if (!target) return;
		event.preventDefault();
		const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
	}
</script>

<svelte:head>
	<title>Úvod - {generalSettings?.shopName}</title>
	<meta
		name="description"
		content="Šťastné srdce nabízí zdravé stravování a rozvoz jídla v Mikulovicích a Jeseníku. Dietologické poradenství od Kamily Kučerové pro vaše zdraví a spokojenost." />
		<link rel="canonical" href="https://www.stastnesrdce.cz/" />
</svelte:head>


<section class="max-w-screen-xl px-4 py-16 mx-auto mb-10">
	<div class="">
		<div
			class="lg:grid lg:grid-flow-row-dense lg:grid-cols-2 lg:gap-8 lg:items-center">
				<div
					class="p-5 md:p-10 ml-auto bg-white rounded-md shadow-lg lg:col-start-2 lg:max-w-2xl border border-gray-300">
					<!-- <div class="grid justify-center pb-5">
					<dotlottie-player src="https://lottie.host/d45caad6-2a0a-4326-8860-ac9153f4c0f5/QYAGZ8Vk6g.json" background="transparent" speed="1" style="width: 200px; height: 200px;" loop autoplay></dotlottie-player>
					</div> -->
					<div class="welcome-head">
						<h2
							class="text-3xl font-extrabold leading-8 text-slate-700 lg:text-4xl sm:leading-9 pb-5">
							Vítejte na stránkách Šťastného srdce
						</h2>
						{#if appeal}
							<details class="welcome-appeal" open={appealOpen}>
								<summary onclick={toggleAppeal}>❤️ Pomáháme Pavlíkovi. Každé dobré srdce se počítá.</summary>
								<div
									class="welcome-appeal-content"
									class:welcome-appeal--open={appealExpanded}
									ontransitionend={onAppealContentTransitionEnd}
								>
									<div class="welcome-appeal-body">
										{@html appeal.text}
									</div>
								</div>
							</details>
						{/if}
					</div>
					<div class="welcome-news">
						<h3>Co je nového?</h3>
						<p>
							Nahlédněte do našeho Info koutku, kde s vámi sdílíme novinky z naší kuchyně, fotografie, zajímavosti o surovinách, dění kolem nás i aktuální informace.
						</p>
						<a href="#info-koutek" class="welcome-news-link" onclick={scrollToInfoKoutek}>
							Nahlédnout do Info koutku&nbsp;→
						</a>
					</div>
					<p class="py-5">
						Náš tým odborníků:<br>
						<a href="/mgr-bc-kamila-forejtova" class="!underline">Mgr. Bc. Kamila Forejtová</a>, <a href="/mgr-martin-forejt-phd" class="!underline">Mgr. Martin Forejt Ph.D.</a>,
						<a href="/olga-bednarova" class="!underline">Olga Bednářová</a> Vám nabízí
					</p>
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
								src="meal_01.webp"
								alt="1" />
							<img
								class="w-40 rounded-lg shadow-lg md:w-64 floating-img2"
								width="260"
								src="meal_02.webp"
								alt="2" />
						</div>
						<div
							class="flex items-start justify-center ml-12 space-x-4 lg:justify-start">
							<img
								class="w-24 rounded-lg shadow-lg md:w-40 floating-img2"
								width="170"
								src="meal_03.webp"
								alt="3" />
							<img
								class="w-32 rounded-lg shadow-lg md:w-56 floating-img"
								width="200"
								src="meal_04.webp"
								alt="4" />
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
							id="info-koutek"
							class="info-koutek-heading mb-10 text-4xl font-extrabold tracking-tight text-center text-gray-900 lg:text-5xl">
							Info koutek
						</h2>
					</div>
					<!-- Grid: sloupce odpovídají výběru left / center / right v Malém Leovi -->
					<div
						class="grid grid-cols-1 md:grid-cols-3 items-start gap-6 mb-20">
						{#if texts.some((text) => text && (text.title || text.text))}
							{#each texts as text, index (text?.position ?? index)}
								{@const hasContent = !!(text && (text.title || text.text))}
								<div class="w-full min-h-0 {hasContent ? '' : 'hidden md:block'}">
									{#if hasContent}
										<div class="h-fit w-full px-4 rounded-lg shadow-lg bg-slate-50 border border-gray-300">
											{#if text.title}
												<h3
													class="px-5 pt-10 text-3xl font-semibold text-gray-700 sm:text-xl">
													{text.title}
												</h3>
												<hr class="mx-5" />
											{/if}
											{#if text.text}
												<div class="md:p-5 mb-5 text-gray-600 text-md [&_img]:max-w-full [&_img]:h-auto">
													{@html text.text}
												</div>
											{/if}
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
	.welcome-head {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 0.75rem;
		margin-top: 0.5rem;
	}
	.welcome-head > h2 {
		margin: 0;
	}
	.welcome-appeal {
		margin: 0;
		border: 1px solid #fecdd3;
		border-radius: 0.5rem;
		background-color: #fff1f2;
		padding: 0.25rem 0.75rem 0.35rem;
		transition: background-color 0.2s ease;
	}
	.welcome-appeal:hover {
		background-color: #ffe4e6;
	}
	.welcome-appeal > summary {
		cursor: pointer;
		list-style: none;
		text-align: center;
		font-weight: 700;
		color: #9f1239;
		padding: 0.45rem 0;
	}
	.welcome-appeal > summary::-webkit-details-marker,
	.welcome-appeal > summary::marker {
		display: none;
		content: none;
	}
	.welcome-appeal-content {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows 0.7s ease;
	}
	.welcome-appeal-content.welcome-appeal--open {
		grid-template-rows: 1fr;
	}
	.welcome-appeal-body {
		min-height: 0;
		overflow: hidden;
		padding: 0.25rem 0 0.5rem;
		color: #334155;
		font-size: 0.95rem;
		line-height: 1.5;
	}
	.welcome-appeal-body :global(p) {
		margin: 0.6em 0;
	}
	.welcome-news {
		margin-top: 1.25rem;
		border: 1px solid #bbf7d0;
		border-radius: 0.5rem;
		background-color: #f0fdf4;
		padding: 1rem 1rem 1.1rem;
	}
	.welcome-news h3 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 700;
		line-height: 1.3;
		color: #166534;
	}
	.welcome-news p {
		margin: 0.6rem 0 0.9rem;
		color: #334155;
		font-size: 0.95rem;
		line-height: 1.5;
	}
	.welcome-news-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		max-width: 100%;
		padding: 0.5rem 1.15rem;
		border: 1px solid #15803d;
		border-radius: 1.5rem;
		color: #166534;
		font-weight: 700;
		line-height: 1.35;
		text-align: center;
		text-decoration: none;
		transition: background-color 0.2s ease, color 0.2s ease;
	}
	.welcome-news-link:hover {
		background-color: #166534;
		color: #fff;
	}
	.info-koutek-heading {
		scroll-margin-top: 6rem;
	}
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
