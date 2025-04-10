<script lang="ts">
	import { fly } from "svelte/transition";
	export let data;

	const { generalSettings } = data;
</script>

<svelte:head>
	<title>{generalSettings.shopName} - Obchodní podmínky</title>
	<meta name="description" content="Obchodní podmínky Šťastné srdce s.r.o. upravující vztahy mezi prodávajícím a kupujícím při prodeji a dovozu obědů." />
</svelte:head>

<section>
	<div class="max-w-screen-lg py-16 mx-auto mt-20 mb-10 rounded-lg px-4 md:px-8 bg-stone-100">
		<h1 class="mb-10 text-4xl md:text-5xl font-extrabold tracking-tight text-center text-gray-900">
			Obchodní podmínky
		</h1>

		<div class="max-w-4xl p-8 mx-auto bg-white rounded-lg shadow-md border border-gray-300">
			<div in:fly={{ y: 50, duration: 500 }} class="prose prose-lg max-w-none">
				<section class="mb-8">
					<h2 class="text-2xl font-bold text-gray-800 mb-4">1. Obecná ustanovení</h2>
					<p>Všeobecné obchodní podmínky upravují vztahy mezi prodávajícím (Šťastné srdce s.r.o.) a kupujícím při prodeji a dovozu obědů.</p>
					<p>Kupující je povinen se s obchodními podmínkami seznámit před odesláním objednávky. Objednáním jídel potvrzuje kupující souhlas s níže uvedenými obchodními podmínkami.</p>
				</section>

				<section class="mb-8">
					<h2 class="text-2xl font-bold text-gray-800 mb-4">2. Kontakty na prodávajícího</h2>
					<p>Šťastné srdce s.r.o. <br>
						Potoční 16, 790 84<br>
						Mikulovice<br>
						IČO: 21300674, DIČ: CZ21300674<br /><br>
						+420 724 448 377<br />
						stastnesrdcekk@seznam.cz<br />
						www.stastnesrdce.cz</p>
				</section>

				<section class="mb-8">
					<h2 class="text-2xl font-bold text-gray-800 mb-4">3. Objednávky</h2>
					<p>Objednávky lze provádět přes objednávkový systém našich internetových stránek (www.stastnesrdce.cz), emailem (stastnesrdcekk@seznam.cz), telefonicky (+420 724 448 377) nebo objednávkou přes papírový jídelníček.</p>

					<h3 class="text-xl font-bold text-gray-700 mt-6 mb-3">3.1 Objednávka přes internetové stránky</h3>
					<p>Při první objednávce přes objednávkový systém našich internetových stránek budete nejdříve vyzváni k registraci, při které vyplníte veškeré potřebné kontaktní údaje (pozor, dochází ke zpracování osobních údajů viz. <a href="/gdpr" class="text-green-700 hover:text-green-900">ochrana osobních údajů</a>) a vyčkáte na telefonické potvrzení registrace a objednávky (jen při první objednávce), abyste si mohli být jisti, že jsme schopni vám oběd opravdu zavést.</p>
					<p>Díky registraci již nemusíte v budoucnu znovu vaše údaje vyplňovat. Objednávku pak můžete realizovat přes internetové stránky opakovaně. Je třeba provést ji v minimálním počtu 3ks obědů a vyčkat na potvrzení, které Vám přijde na uvedený email, kde si lze objednávku překontrolovat a případně upravit. Objednávku je třeba provést nejpozději den předem do 17.00. V případě nefunkčnosti stránek, nebo při problému s připojením k internetu je možné objednávku provést rovněž telefonicky nebo emailem.</p>

					<h3 class="text-xl font-bold text-gray-700 mt-6 mb-3">3.2 Objednávka přes email</h3>
					<p>Při kontaktování nás přes email budete vyzváni k vyplnění kontaktních údajů (popis potřebných kontaktních údajů viz. 3.6) a vyčkáte na potvrzení (emailem či telefonicky), že jsme schopni vám oběd opravdu zavést. Následně vám zašleme na email jídelníček, ze kterého si vyberete obědy na požadované dny a zašlete nám objednávku. Objednávku je třeba provést v minimálním počtu 3ks obědů nejpozději den předem do 17.00 a vyčkat na potvrzení, které Vám přijde na uvedený email.</p>

					<h3 class="text-xl font-bold text-gray-700 mt-6 mb-3">3.3 Objednávka telefonicky</h3>
					<p>Telefonickou objednávku akceptujeme až u druhé a dalších objednávek, kdy již máme v systému zadané veškeré vaše kontaktní údaje. Objednávku je možné řešit po telefonu osobně i prostřednictvím zaslané SMS zprávy o počtu a volbě obědů z nabídky pro dané období. Objednávku je třeba provést v minimálním počtu 3ks obědů nejpozději den předem do 17.00 a vyčkat na potvrzení SMS zprávou o přijetí vaší objednávky.</p>

					<h3 class="text-xl font-bold text-gray-700 mt-6 mb-3">3.4 Objednávka přes papírový jídelníček</h3>
					<p>Objednávku přes papírový jídelníček akceptujeme až u druhé a dalších objednávek, kdy již máme v systému zadané veškeré vaše kontaktní údaje. Papírovou objednávku obědů je možné provést přes obdržený jídelníček, který vám zavezeme při rozvážce obědů (předá vám ji řidič). Do jídelníčku zvýrazníte, které obědy chcete na další období objednat a nejpozději den před začátkem nového období (zpravidla měsíce) nám jídelníček se zvýrazněnými obědy předáte osobně (řidiči) nebo ho pošlete scanem na náš email (stastnesrdcekk@seznam.cz) a vyčkáte na potvrzení přijetí objednávky.</p>
					<p>Vyplněním objednávky – papírového jídelníčku se zákazník zavazuje doručený oběd(y) uhradit způsobem uvedeným na dodacím listu v platebních podmínkách.</p>

					<h3 class="text-xl font-bold text-gray-700 mt-6 mb-3">3.5 Zrušení objednávky</h3>
					<p>Kupující má právo zrušit objednávku den předem do 17 hodiny. Nejlépe přes odkaz případně emailem, nebo telefonicky na uvedených číslech. Po tomto termínu je objednávka považována za závaznou a její pozdější zrušení nebude akceptováno.</p>

					<h3 class="text-xl font-bold text-gray-700 mt-6 mb-3">3.6 Objednávka-kontaktní údaje</h3>
					<p>U obědů, které objednáte poprvé přes email nebo telefonicky je nutné uvést následující kontaktní údaje: jméno a příjmení objednatele, fakturační adresu, adresu dodání (je-li odlišná od adresy fakturační), kontaktní telefon, email a u podnikatelských subjektů navíc obchodní jméno, sídlo firmy, jméno a příjmení objednávající osoby, IČO a DIČ, je-li plátcem DPH.</p>
					<p>Pozor, dochází ke zpracování osobních údajů viz. <a href="/gdpr" class="text-green-700 hover:text-green-900">ochrana osobních údajů</a>.</p>
				</section>

				<section class="mb-8">
					<h2 class="text-2xl font-bold text-gray-800 mb-4">4. Ceny</h2>
					<p>Veškeré ceny jsou uvedeny na našich internetových stránkách (www.stastnesrdce.cz) včetně DPH. Kupní cena obědu je stanovena ceníkem platným ke dni objednávky. Součástí oběda je polévka a hlavní jídlo. Pokud si strávník objedná jen hlavní jídlo, cena oběda se tím neponíží a zůstává stejná. Stejně to platí i v opačném případě, kdy by si objednal pouze polévku.</p>

					<p>Obědy jsou strávníkům dodávány do vlastních nosičů, jednorázových menu boxů či tzv. REkrabičky. Rozvoz obědů probíhá ve všech formách nosičů zdarma. Za dodávku obědů ve vlastním nosiči se nic nepřiplácí. Pokud ale dojde k ukončení stravování s firmou Šťastné srdce s.r.o. a strávník si nevyzvedne všechny své nosiče osobně zpět a bude požadovat jejich dovoz domů, platí si manipulační poplatek za dovozné dle platného ceníku.</p>

					<h3 class="text-xl font-bold text-gray-700 mt-6 mb-3">4.1 Cena jednorázového menu boxu</h3>
					<p>V případě dodávky obědu do jednorázového menu boxu se o něj cena oběda navyšuje dle platného ceníku.</p>

					<h3 class="text-xl font-bold text-gray-700 mt-6 mb-3">4.2 Cena REkrabičky</h3>
					<p>V případě domluvy dodávek obědů do REkrabičky strávník skládá vratnou kauci za krabičku(y) dle platného ceníku. V případě ukončení stravování s firmou Šťastné srdce s.r.o, kdy nedojde při posledním obědu k vrácení REkrabičky(ek), si účtujeme manipulační poplatek za vyzvednutí REkrabičky(ek) dle platného ceníku a zároveň vracíme vratnou zálohu za REkrabičky na účet klienta.</p>
				</section>

				<section class="mb-8">
					<h2 class="text-2xl font-bold text-gray-800 mb-4">5. Platební podmínky</h2>
					<p>Zákazník je povinen uhradit zboží odebrané od firmy Šťastné srdce s.r.o., Potoční 16, 790 84 MIKULOVICE, IČO: 21300674, DIČ: CZ21300674. Objednané zboží je možné zaplatit následujícím způsobem:</p>

					<div class="my-4 pl-4 border-l-4 border-green-600">
						<p class="font-semibold">a) Platba bankovním převodem na fakturu:</p>
						<p>Pro bankovní převod použijte č. účtu: 273177960/0600, variabilní symbol bude uveden na vystavené faktuře, kterou obdržíte na váš email či osobně. V případě vystavené faktury je splatnost 3 dny.</p>
					</div>

					<div class="my-4 pl-4 border-l-4 border-green-600">
						<p class="font-semibold">b) Platba bankovním převodem bez faktury:</p>
						<p>Platba probíhá okamžitě po vytvoření objednávky na účet č. 273177960/0600 (nemáme platební bránu), variabilní symbol je číslo objednávky.</p>
					</div>

					<div class="my-4 pl-4 border-l-4 border-green-600">
						<p class="font-semibold">c) Platba hotově:</p>
						<p>Při hotové platbě je třeba zaplatit řidiči, který dovezl oběd, ihned na místě při odběru oběda.</p>
					</div>
				</section>

				<section class="mb-8">
					<h2 class="text-2xl font-bold text-gray-800 mb-4">6. Dodací podmínky</h2>
					<p>Objednané zboží je dovezeno na adresu objednatele naším řidičem v pracovní dny mezi 9:00 až 13:30. Doba dovozu se může změnit v případě špatné dopravní situace nebo špatného počasí, defektu či havárie. Trasy jsou plánovány dle otvírací doby firem, nebo na základě dohody.</p>
					<p>Dodání oběda je také vázáno na zřetelně označení vlastního nosiče svým jménem, v případě nemožnosti zjistit správného vlastníka špatně popsaného nosiče si vyhrazujeme právo dodat požadovaný oběd do jednorázového menu boxu.</p>
				</section>

				<section class="mb-8">
					<h2 class="text-2xl font-bold text-gray-800 mb-4">7. Záruční podmínky</h2>
					<p>Obědy jsou určené k okamžité spotřebě do 14 hodiny daného dne.</p>
					<p>Záruka se nevztahuje na závady způsobené: neoprávněným zásahem, nevhodným skladováním, neodbornou manipulací v důsledku použití zboží k jiným než určeným účelům vlivem živelní pohromy nebo zásahem vyšší moci.</p>
				</section>

				<section class="mb-8">
					<h2 class="text-2xl font-bold text-gray-800 mb-4">8. Reklamace</h2>
					<p>Při převzetí oběda je kupující povinen zkontrolovat, zda nevykazuje vady způsobené přepravou. Pokud ano, je kupující povinen zboží nepřevzít. O této skutečnosti neprodleně informovat prodávajícího. Při převzetí oběda bez zbytečného prodlení provést kontrolu množství a druhu dodaného oběda. O zjištěných závadách neprodleně informovat prodávajícího. Na pozdější reklamace nebude brán zřetel.</p>
					<p>Obědy jsou určené k okamžité spotřebě. Vady vzniklé nevhodnou manipulací nebo skladováním nelze reklamovat. Oprávněné reklamace budou řešeny okamžitě, případně vrácením kupní ceny (dle dohody). Pro úspěšné řešení reklamace je nezbytné kontaktovat prodávajícího okamžitě, telefonicky či emailem.</p>
				</section>

				<section class="mb-8">
					<h2 class="text-2xl font-bold text-gray-800 mb-4">9. Zpracování osobních údajů</h2>
					<div class="pl-4 border-l-4 border-green-600 my-4">
						<p class="mb-2">9.1 Prodávající zpracovává osobní údaje kupujícího pro účely uzavření a správy smlouvy a realizaci dodávky, pro plnění svých právních povinností nebo se souhlasem kupujícího za účelem vylepšování služeb a nabídky prodávajícího, pro marketingové účely vč. zasílání obchodních sdělení a personalizace reklamy, příp. jiným účelem, ke kterému udělil kupující souhlas.</p>
					</div>

					<div class="pl-4 border-l-4 border-green-600 my-4">
						<p class="mb-2">9.2 Zpracování osobních údajů probíhá v souladu s nařízením Evropského parlamentu a Rady (EU) č. 2016/679 ze dne 27. dubna 2016 o ochraně fyzických osob v souvislosti se zpracováním osobních údajů a o volném pohybu těchto údajů a o zrušení směrnice 95/46/ES (obecné nařízení o ochraně osobních údajů) a souvisejících českých právních předpisů a v souladu se <a href="/gdpr" class="text-green-700 hover:text-green-900">Zásadami pro nakládání s osobními údaji</a> prodávajícího, ve kterých je uvedeno, jakým způsobem prodávající nakládá s osobními údaji kupujícího, jaké informace o kupujícím ukládá, jak dané informace využívá a komu je případně předává.</p>
						<p>Zásady pro nakládání s osobními údaji taktéž obsahují výčet veškerých práv kupujícího v souvislosti se zpracováním osobních údajů, zejm. pak právo na informace, opravu, vymazání či právo souhlas se zpracováním osobních údajů kdykoli odvolat.</p>
					</div>

					<div class="pl-4 border-l-4 border-green-600 my-4">
						<p class="mb-2">9.3 V souvislosti se zpracováním osobních údajů prodávající prohlašuje, že (I.) zpracovává osobní údaje v souladu s požadavky stanovenými právními předpisy; (II.) zajistil, aby se osoby oprávněné zpracovávat osobní údaje zavázaly k mlčenlivosti nebo aby se na ně vztahovala zákonná povinnost mlčenlivosti; (III.) přijal vhodná technická a organizační opatření, aby zajistil nezbytnou úroveň zabezpečení osobních údajů; a (IV.) v případě porušení zabezpečení osobních údajů s rizikem pro práva a svobody fyzických osob informuje dozorový orgán, příp. subjekty údajů.</p>
					</div>
				</section>

				<section>
					<h2 class="text-2xl font-bold text-gray-800 mb-4">10. Závěrečná ustanovení</h2>
					<p>Výše uvedené obchodní podmínky platí ve znění uvedeném na internetových stránkách www.stastnesrdce.cz v den odeslání objednávky kupujícím a stejně tak i v případě jakékoli jiné formy objednávky (viz. čl. 3)</p>
					<p>Prodávající si vyhrazuje právo změnit obchodní podmínky bez předchozího upozornění. Účastníci se výslovně ve smyslu ust. § 262 odst. 1 Obchodního zákoníku dohodli, že není-li podmínkami výslovně stanoveno jinak, řídí se jejich práva a povinnosti Obchodním zákoníkem, zejména jeho ustanovením § 409 a následující.</p>
					<p class="mt-8 font-semibold">Tyto všeobecné podmínky jsou platné od 1.2. 2025 do odvolání nebo jejich změny.</p>
				</section>
			</div>
		</div>
	</div>
</section>

<style>
    /* Dodatečné styly pro vylepšení vzhledu obchodních podmínek */
    :global(.prose) {
        color: #333;
        line-height: 1.7;
    }

    :global(.prose h2) {
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #e5e7eb;
    }

    :global(.prose a) {
        text-decoration: underline;
    }

    :global(.prose p) {
        margin-bottom: 1rem;
    }
</style>