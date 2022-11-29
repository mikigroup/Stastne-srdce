<script>
	import '@beyonk/gdpr-cookie-consent-banner/dist/style.css'; // optional, you can also define your own styles
	import GdprBanner from '@beyonk/gdpr-cookie-consent-banner';

	function initAnalytics() {
		// do something with segment.io or google analytics etc
	}

	const options = {
		cookieName: 'stastnesrdce_gdpr',

		cookieConfig: {
			domain: 'http://127.0.0.1/',
			path: '/'
		},

		heading: 'GDPR Souhlas',
		description:
			'TEST use cookies to offer a better browsing experience, analyze site traffic, personalize content, and serve targeted advertisements. Please review our <a href="/privacy-policy">privacy policy page</a>. By clicking accept, you consent to our privacy policy & use of cookies.',

		acceptLabel: 'Confirm all',
		settingsLabel: 'Preferences',
		closeLabel: 'Close window',

		/**
		 * These are the default opt-ins and their descriptions.
		 * When value is set to true, the option will automatically be checked on load.
		 *
		 * If you want to hide a category, simply set it to false, e.g. 'marketing: false'
		 **/
		choices: {
			necessary: {
				label: 'Necessary cookies',
				description: "Used for cookie control. Can't be turned off.",
				value: true
			},
			tracking: {
				label: 'Tracking cookies',
				description: 'Used for advertising purposes.',
				value: true
			},
			analytics: {
				label: 'Analytics cookies',
				description:
					'Used to control Google Analytics, a 3rd party tool offered by Google to track user behavior.',
				value: true
			},
			marketing: {
				label: 'Marketing cookies',
				description: 'Used for marketing data.',
				value: true
			}
		},

		/**
		 * Show an icon to edit cookies later, when banner is closed.
		 **/
		showEditIcon: true,

		/**
		 * These are the functions which are run if a user opts-in to that category.
		 * You should drop your cookies here (or set a variable to control the later dropping of cookies.
		 *
		 * If you are using svelte, you can use events instead - see the Svelte section below.
		 **/
		categories: {
			analytics: function () {
				console.log('No analytics cookies specified');
			},
			tracking: function () {
				console.log('No tracking cookies specified');
			},
			marketing: function () {
				console.log('No marketing cookies specified');
			},
			necessary: function () {
				console.log('No necessary cookies specified');
			}
		}
	};
	/* GdprConsent.attachBanner(document.body, options) */
</script>

<style>
	.floating-img {
		transform: translateY(-10%);
		animation: floater-y 30s infinite;
		transition: ease 0.5s;
	}
	.floating-img2 {
		transform: translateX(-10%);
		animation: floater-x 30s infinite;
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

<svelte:head>
	<title>Šťastné srdce - Úvod</title>
	<meta name="description" content="Úvod" />
</svelte:head>

<main>
	<!-- <GdprBanner {...options} on:analytics={initAnalytics} /> -->
	<h1 class="">Šťastné srdce</h1>
	<section>
		<div
			class="max-w-screen-xl p-4 bg-white dark:bg-gray-800 mx-auto px-4 sm:px-6 lg:px-8 py-26
			lg:mt-10">
			<div class="">
				<div class="mt-20 lg:grid lg:grid-flow-row-dense lg:grid-cols-2 lg:gap-8 lg:items-center">
					<div
						class="mt-20 py-10 px-10 bg-white shadow-lg rounded-md dark:bg-gray-800 lg:col-start-2
						lg:max-w-2xl ml-auto">
						<h4
							class="mt-2 leading-8 font-extrabold text-slate-700 dark:text-white text-2xl
							lg:text-3xl sm:leading-9">
							Vítejte na stránkách Šťastného srdce
						</h4>
						<p class="text-md leading-6 text-gray-500 dark:text-gray-300">Vaříme zdravé jídlo</p>
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
									<span class="ml-4 text-base leading-6 text-gray-600 dark:text-gray-200">
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
										Do krabičky nebo ešusu
									</span>
								</div>
							</li>
						</ul>
					</div>
					<div class="mt-10 lg:-mx-4 relative relative-20 lg:mt-0 lg:col-start-1">
						<div class="relative space-y-4">
							<div class="flex items-end justify-center lg:justify-start space-x-4">
								<img
									class="rounded-lg shadow-lg w-32 md:w-56 floating-img"
									width="200"
									src="meal_01.jpg"
									alt="1" />
								<img
									class="rounded-lg shadow-lg w-40 md:w-64 floating-img2"
									width="260"
									src="meal_02.jpg"
									alt="2" />
							</div>
							<div class="flex items-start justify-center lg:justify-start space-x-4 ml-12">
								<img
									class="rounded-lg shadow-lg w-24 md:w-40 floating-img2"
									width="170"
									src="meal_03.jpg"
									alt="3" />
								<img
									class="rounded-lg shadow-lg w-32 md:w-56 floating-img"
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

	<div class="mx-10 mt-10 pt-10">
		<hr />
	</div>

	<section>
		<div class="">
			<div class="mt-20">
				<h2
					class="mb-10 mb-4 text-4xl tracking-tight font-extrabold text-center text-gray-900
					dark:text-white">
					Info koutek
				</h2>

			</div>
			<div class="md:container md:mx-auto justify-center items-center gap-8 sm:flex flex-wrap">
				<div
					class="w-full sm:w-1/2 md:w-1/2 lg:w-1/4 px-4 bg-white shadow-lg rounded-lg
					dark:bg-gray-800">
					<h3 class="text-2xl sm:text-xl text-gray-700 font-semibold dark:text-white pt-4">
						Info na Prosinec 2022
					</h3>
					<hr />
					<p class="text-md text-gray-500 dark:text-gray-300 py-4 text-justify">
						Rok 2022 končí a my musíme vybrat ještě nějakou tu dovolenou, řádně oslavit svátky a
						trochu se zklidnit . 23.12., 30.12. dovolená. 26.12. Vánoční svátek. A 27.12., 28.12.,
						29.12. vaříme jen jedno jídlo.
					</p>
				</div>
				<div
					class="w-full sm:w-1/2 md:w-1/2 lg:w-1/4 px-4 py-4 bg-white mt-6 shadow-lg rounded-lg
					dark:bg-gray-800">
					<h3 class="text-2xl sm:text-xl text-gray-700 font-semibold dark:text-white pt-4">
						2023 a kudy kam
					</h3>
					<hr />
					<p class="text-md text-gray-500 dark:text-gray-300 py-4 text-justify">
						Kam si to v tom Šťastném srdci směřujeme? Vize "Kudy kam" pro další roky máme. Zda je
						naplníme, je teď ve hvězdách. Nicméně trpělivě a krok po kroku k naplnění míříme. A tak
						pro tento rok, chceme rozšířit záhony s bylinami a zeleninou, pokračovat v uvědomělém
						kompostování celé hory slupek zeleniny a ovoce, pravidelně vytvářet picles
						(rychlokvašenou zeleninu) a zkusit používat na některé vařiče bioplynku.
					</p>
				</div>
				<div
					class="w-full sm:w-1/2 md:w-1/2 lg:w-1/4 px-4 py-4 mt-6 sm:mt-16 md:mt-20 lg:mt-24
					bg-white shadow-lg rounded-lg dark:bg-gray-800">
					<h3 class="text-2xl sm:text-xl text-gray-700 font-semibold dark:text-white pt-4">
						Pro vegetariány a vegany!
					</h3>
					<hr />
					<p class="text-md text-gray-500 dark:text-gray-300 py-4 text-justify">
						Naše "bezmasé trojky", potřebují posunout na vyšší level. Strávníků, kteří nechtějí jíst
						každý den maso přibývá. A my máme radost, že se trojky svým množstvím vyrovnají masitým
						meníčkům. Jenomže k nám nepřichází veganská (vegetariánská) inspirace a tak vyzýváme
						milovníky zvířat, napište email, co byste rádi na jídelníčku.
					</p>
				</div>				
			</div>
		</div>
	</section>

</main>
