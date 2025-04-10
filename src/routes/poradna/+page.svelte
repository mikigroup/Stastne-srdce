<script lang="ts">
	export let data;

	const { generalSettings } = data;
</script>

<svelte:head>
	<title>{generalSettings.shopName} - Dietologická poradna</title>
	<meta name="description" content="Dietologická poradna vedená odborníky s dlouholetou praxí, zaměřená na změnu stravovacích návyků a řešení zdravotních problémů souvisejících s výživou." />
</svelte:head>

<main>
	<section class="max-w-screen-xl px-4 py-16 mx-auto mt-10 mb-10 rounded-lg bg-stone-100">
		<h1 class="mb-8 text-4xl font-extrabold tracking-tight text-center text-gray-900 md:text-5xl">
			Dietologická poradna
		</h1>

		<div class="max-w-4xl mx-auto">
			<div class="bg-white border rounded-lg shadow-md p-8 border-gray-400">
				<div class="prose prose-lg max-w-none">
					<p class="mb-6 text-lg font-medium text-gray-700">
						Po pár letech opět obnovujeme činnost naší dietologické poradny. Přiměla nás k tomu
						opakovaná poptávka a zájem klientů o naši poradenskou činnost zde na Jesenicku. <span class="font-semibold">Pokud
            hledáte skutečné odborníky, kteří mají dlouholetou praxi, jste tu správně.</span>
					</p>

					<p class="mb-6">
						Je jedno, zda potřebujete snížit či zvýšit váhu nebo se trápíte s nějakým onemocněním, které
						vyžaduje změnu stravy. Pro každého z vás jde o náročnou etapu v životě a my jsme si díky
						dlouholeté praxi vědomi, že změnit stravu ze dne na den, není pro většinu lidí možné. Proto
						vám nabízíme pomoc v provedení vás touto náročnou cestou, která může trvat z hlediska
						procesu učení týdny, měsíce, ale pro někoho i roky.
					</p>

					<p class="mb-6">
						Vašim cílem by totiž nemělo být jen stravovat se teď po nějakou dobu lépe, ale nastavit si způsob stravování tak, aby byl
						udržitelný dlouhodobě, a přitom vedl k dosažení požadovaných změn a k udržení toho, co
						dosáhnete. Pak to má celé smysl, budete dlouhodobě spokojeni a nebudete opakovaně čelit
						nepříjemným jo-jo efektům. Proto jsme si pro vás připravili možnost využít i dlouhodobé
						balíčky návštěv.
					</p>

					<div class="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-6">
						<p class="font-medium">
							Také vás naučíme, jak být ve volbě a utváření svého každodenního jídla svobodní, ať jste
							doma, v práci nebo na dovolené, a nebýt závislí na nějakém vytvořeném jídelníčku nebo
							předražených surovinách od nějaké firmy.
						</p>
					</div>

					<h2 class="text-2xl font-bold text-gray-800 mt-10 mb-4">Náš přístup</h2>

					<p class="mb-6">
						Většina lidí se bojí, že jim bude zakázáno jíst jídla, která mají rádi. U nás z toho strach mít
						nemusíte. Víme, že pro každé jídlo je možné najít během dne vhodnou dobu a domluvit se na
						jeho množství. Pokud však díky onemocnění musíte skutečně některé potraviny vyřadit ze
						svého jídelníčku, protože je to životně důležité, pomůžeme vám najít spoustu vhodných a
						chutných alternativ, poradíme vám, jak co uvařit a můžete vyzkoušet i naše obědy.
					</p>

					<p class="mb-6">
						Pokud chcete měnit něco na své váze, mějte na paměti, že to nejdůležitější je vaše zdraví, a
						proto i naše poradenství bude tuto zásadu vždy a za všech okolností ctít a nebudeme vám
						nabízet ani zázračné diety ani potraviny. Vždy mějte na paměti, jak dlouho jste šli tou
						„špatnou cestou", a že není možné razantně vše změnit v krátkém čase bez toho, že by to
						negativně ovlivnilo vaše zdraví.
					</p>

					<h2 class="text-2xl font-bold text-gray-800 mt-10 mb-4">Komplexní péče</h2>

					<p class="mb-6">
						Součástí naší práce je nejen poradenství v oblasti výživy, ale také v oblasti pohybu, režimu
						spánku, psychologický přístup a pomoc, jak zvládat stresovou zátěž a také komunikace o
						prostředí, ve kterém žijete, protože vše je vzájemně propojeno.
					</p>

					<p class="mb-6">
						Poradenská činnost v rámci dietologie se vždy již od začátku opírá o správně odebranou
						anamnézu a o kvalitní a správně provedenou diagnostiku. Vše, co vás čeká, vám bude
						podrobně vysvětleno již při prvním osobním setkání v poradně.
					</p>

					<h2 class="text-2xl font-bold text-gray-800 mt-10 mb-4">Diagnostické metody</h2>

					<div class="grid md:grid-cols-2 gap-6 mb-8">
						<div class="bg-gray-50 p-5 rounded-lg border shadow-sm border-gray-400">
							<h3 class="text-xl font-semibold mb-3 text-gray-800">InBody analýza</h3>
							<p>
								Pro hodnocení složení těla a změny v tělesném složení využíváme přístroje InBody 230 a InBody
								S10 (přenosný přístroj pro možnost diagnostiky i mimo poradnu). Jedná se o bioimpedanční
								metody poskytující přesné výsledky o vašem tělesném složení.
							</p>
						</div>

						<div class="bg-gray-50 p-5 rounded-lg border shadow-sm border-gray-400">
							<h3 class="text-xl font-semibold mb-3 text-gray-800">Max Pulse diagnostika</h3>
							<p>
								Pro diagnostiku kardiovaskulárního systému, stresu a činnosti autonomního
								nervového systému používáme přístroj Max Pulse pracující na principu akcelerované
								photoplethysmografie.
							</p>
						</div>
					</div>

					<p class="mb-6">
						Dále nabízíme diagnostiku intolerancí, které mohou negativně
						ovlivňovat zdraví člověka. Způsobují často nejen zažívací potíže, ale i neschopnost přibrat na
						váze nebo naopak zhubnout a další jiné zdravotní problémy.
					</p>

					<p class="mb-6">
						Diagnostika InBody se provádí
						pravidelně při každé konzultaci, abychom měli vývoj změn tělesného složení stále k dispozici
						a mohli vysvětlit proběhlé změny a reagovat na ně během následného dalšího poradenství.
					</p>

					<h2 class="text-2xl font-bold text-gray-800 mt-10 mb-4">Bemer terapie</h2>

					<div class="flex flex-col md:flex-row gap-6 items-center mb-6 bg-gray-50 p-5 rounded-lg border border-gray-400">
						<div class="md:w-3/4">
							<p>
								Kromě diagnostických metod nabízíme i cévní fyzikální rehabilitační terapii prováděnou na
								přístroji Bemer, který podporuje mikrocirkulaci. Díky tomuto přístroji je možné podpořit
								léčbu celé řady onemocnění. Bližší informace získáte při osobním setkání v naší poradně.
							</p>
						</div>
					</div>
					<p class="mb-6">
						V poradně o vás budou pečovat <a href="/mgr-bc-kamila-kucerova" class="font-semibold !underline">Mgr. Bc. Kamila Kučerová</a> a <a href="/mgr-martin-forejt-phd" class="font-semibold !underline">Mgr. Martin Forejt, Ph.D.</a>
					</p>

					<div class="flex justify-center gap-6 my-10">
						<p>Ceny poradenství a jednotlivých diagnostik najdete v <a
							href="/cenik"
							class="!underline">
							ceníku</a>.</p>
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
            font-size: 1.5rem;
        }
    }
</style>