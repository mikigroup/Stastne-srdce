<script lang="ts">
	import { onMount } from 'svelte';
	import { CartItemsStore, totalPiecesStore } from "$lib/stores/store";
	import { page } from "$app/stores";

	// Proměnné pro souhrn objednávky
	let cartItems = [];
	let totalPrice = 0;
	let totalPieces = 0;
	let orderNumber = '';
	let isDataLoaded = false;

	onMount(() => {
		// Získání dat z URL nebo z form akce
		const urlParams = new URLSearchParams(window.location.search);
		const orderIdFromUrl = urlParams.get('order');

		// Pokud máme data z formuláře po zpracování objednávky
		if ($page.form?.success && $page.form?.orderId) {
			orderNumber = $page.form.orderId.toString();
		} else if (orderIdFromUrl) {
			orderNumber = orderIdFromUrl;
		} else {
			orderNumber = 'N/A';
		}

		// Načtení dat z košíku PŘED jeho vyčištěním
		cartItems = $CartItemsStore;
		totalPieces = $totalPiecesStore;

		// Výpočet celkové ceny z košíku
		totalPrice = cartItems.reduce((sum, item) => {
			if (!item?.variants?.length) return sum;
			return (
				sum +
				item.variants.reduce(
					(variantSum, variant) =>
						variantSum + (variant.price || 0) * (variant.quantity || 0),
					0
				)
			);
		}, 0);

		// Označíme, že data byla načtena
		isDataLoaded = true;

		// Vyčištění košíku POUZE po úspěšném zobrazení souhrnu
		// a s dostatečným zpožděním, aby se data stihla použít
		setTimeout(() => {
			CartItemsStore.clear();
			console.log("Košík byl vyčištěn po zobrazení souhrnu objednávky");
		}, 1500); // Delší zpoždění pro jistotu
	});

	// Funkce pro formátování data
	function formatDate(dateString) {
		if (!dateString) return '';
		const date = new Date(dateString);
		return date.toLocaleDateString('cs-CZ', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Šťastné srdce - Děkujeme za objednávku</title>
	<meta name="description" content="Děkujeme za objednávku" />
</svelte:head>

<div class="max-w-screen-lg px-4 py-8 py-16 mx-auto mt-20 rounded-lg bg-orange-50">
	<div class="flex flex-col items-center pt-5 mb-8">
		<h1 class="text-3xl md:text-4xl font-bold text-green-800 mb-2">Děkujeme za objednávku!</h1>
		<p class="text-xl md:text-2xl">Vaše jídlo bylo úspěšně objednáno</p>
		{#if orderNumber !== 'N/A'}
			<p class="mt-2 text-lg">Číslo objednávky: <strong>{orderNumber}</strong></p>
		{/if}
		<p class="text-sm mt-2">Potvrzení bylo zasláno na Váš e-mail</p>

		{#if $page.form?.message}
			<div class="mt-4 p-3 rounded-lg {$page.form.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
				{$page.form.message}
			</div>
		{/if}
	</div>

	<!-- Souhrn objednávky -->
	<div class="bg-white rounded-lg shadow-md p-6 mb-8 max-w-3xl mx-auto">
		<h2 class="text-xl font-semibold mb-4 text-green-700 border-b pb-2">Souhrn objednávky</h2>

		{#if cartItems.length === 0}
			<div class="py-4">
				{#if orderNumber !== 'N/A' && totalPieces > 0}
					<!-- Zobrazíme alespoň souhrnné informace, když nemáme detaily -->
					<div class="text-center mb-4">
						<p class="text-gray-600 mb-2">Děkujeme za Vaši objednávku!</p>
						<p class="text-gray-500 text-sm">Detaily objednávky byly zaslány na Váš e-mail</p>
					</div>

					<div class="bg-green-50 rounded-lg p-4 mt-6">
						<div class="flex justify-between font-bold text-lg text-green-800">
							<div>Celkem:</div>
							<div class="text-right">
								<div>{totalPieces} ks</div>
								<div>{totalPrice} Kč</div>
							</div>
						</div>
					</div>
				{:else}
					<p class="text-gray-600 text-center">Děkujeme za Vaši objednávku!</p>
				{/if}
			</div>
		{:else}
			<div class="space-y-4">
				{#each cartItems as item}
					<div class="border-b pb-4">
						<div class="font-medium text-gray-800">{formatDate(item.date)}</div>
						<div class="text-gray-600 pl-2 mb-2">Polévka: {item.soup}</div>

						{#each item.variants as variant}
							<div class="flex justify-between items-center pl-4 py-1">
								<div class="max-w-lg">
									<span class="text-gray-800">{variant.variant_number}.</span>
									<span class="text-gray-600">{variant.description}</span>
								</div>
								<div class="text-right flex-shrink-0">
									<div>{variant.quantity} ks</div>
									<div class="font-medium">{variant.price * variant.quantity} Kč</div>
								</div>
							</div>
						{/each}
					</div>
				{/each}

				<div class="flex justify-between pt-4 font-bold text-lg text-green-800">
					<div>Celkem:</div>
					<div class="text-right">
						<div>{totalPieces} ks</div>
						<div>{totalPrice} Kč</div>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Animace poděkování -->
	<div class="letter-container relative h-60 mb-8">
		<div class="letter-image">
			<div class="animated-mail">
				<div class="back-fold"></div>
				<div class="letter">
					<div class="letter-border"></div>
					<div class="letter-title"></div>
					<div class="letter-context"></div>
					<div class="letter-stamp">
						<div class="letter-stamp-inner"></div>
					</div>
				</div>
				<div class="top-fold"></div>
				<div class="body"></div>
				<div class="left-fold"></div>
			</div>
			<div class="shadow"></div>
		</div>
	</div>

	<!-- Odkaz zpět do jídelníčku -->
	<div class="flex justify-center mt-8">
		<a href="/obedy" class="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors shadow-md">
			Zpět na obědy
		</a>
	</div>

	<!-- Animované vlny na pozadí -->
	<svg
		xmlns="http://www.w3.org/2000/svg"
		xmlns:xlink="http://www.w3.org/1999/xlink"
		version="1.1"
		id="Calque_1"
		x="0px"
		y="0px"
		viewBox="0 0 1300 550"
		style="enable-background:new 0 0 1300 550;"
		xml:space="preserve">
		<path
			class="st1"
			d="M 0 250 C 600 450 650 100 1300 250 L 1300 550 L 0 550 L 0 250">
			<animate
				attributeName="d"
				dur="5s"
				begin="1s"
				values="M 0 250 C 600 450 650 100 1300 250 L 1300 550 L 0 550 L 0 250;
                M 0 250 C 600 100 650 450 1300 250 L 1300 550 L 0 550 L 0 250;
				M 0 250 C 600 450 650 100 1300 250 L 1300 550 L 0 550 L 0 250"
				repeatCount="indefinite" />
		</path>

		<path
			class="st1"
			d="M 0 250 C 600 100 650 450 1300 250 L 1300 550 L 0 550 L 0 250">
			<animate
				attributeName="d"
				dur="5s"
				values="M 0 250 C 600 100 650 450 1300 250 L 1300 550 L 0 550 L 0 250;
                M 0 250 C 600 450 650 100 1300 250 L 1300 550 L 0 550 L 0 250;
				M 0 250 C 600 100 650 450 1300 250 L 1300 550 L 0 550 L 0 250"
				repeatCount="indefinite" />
		</path>

		<path
			class="st1"
			d="M 0 250 C 950 350 950 150 1300 250 L 1300 550 L 0 550 L 0 250">
			<animate
				attributeName="d"
				dur="5s"
				begin="2s"
				values="M 0 250 C 950 350 950 150 1300 250 L 1300 550 L 0 550 L 0 250;
                M 0 250 C 350 150 350 350 1300 250 L 1300 550 L 0 550 L 0 250;
				M 0 250 C 950 350 950 150 1300 250 L 1300 550 L 0 550 L 0 250"
				repeatCount="indefinite" />
		</path>

		<path
			class="st1"
			d="M 0 250 C 350 150 350 350 1300 250 L 1300 550 L 0 550 L 0 250">
			<animate
				attributeName="d"
				dur="5s"
				values="M 0 250 C 350 150 350 350 1300 250 L 1300 550 L 0 550 L 0 250;
                M 0 250 C 950 350 950 150 1300 250 L 1300 550 L 0 550 L 0 250;
				M 0 250 C 350 150 350 350 1300 250 L 1300 550 L 0 550 L 0 250"
				repeatCount="indefinite" />
		</path>
	</svg>
</div>

<style>
    .st1 {
        opacity: 0.6;
        fill: rgb(22 101 52);
        enable-background: new;
    }

    .letter-container {
        position: relative;
        width: 100%;
    }

    .letter-image {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 200px;
        height: 200px;
        -webkit-transform: translate(-50%, -50%);
        -moz-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
        cursor: pointer;
    }

    .animated-mail {
        position: absolute;
        height: 150px;
        width: 200px;
        -webkit-transition: 0.4s;
        -moz-transition: 0.4s;
        transition: 0.4s;
    }
    .animated-mail .body {
        position: absolute;
        bottom: 0;
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 0 0 100px 200px;
        border-color: transparent transparent #e95f55 transparent;
        z-index: 2;
    }
    .animated-mail .top-fold {
        position: absolute;
        top: 50px;
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 50px 100px 0 100px;
        -webkit-transform-origin: 50% 0%;
        -webkit-transition:
                transform 0.4s 0.4s,
                z-index 0.2s 0.4s;
        -moz-transform-origin: 50% 0%;
        -moz-transition:
                transform 0.4s 0.4s,
                z-index 0.2s 0.4s;
        transform-origin: 50% 0%;
        transition:
                transform 0.4s 0.4s,
                z-index 0.2s 0.4s;
        border-color: #cf4a43 transparent transparent transparent;
        z-index: 2;
    }
    .animated-mail .back-fold {
        position: absolute;
        bottom: 0;
        width: 200px;
        height: 100px;
        background: #cf4a43;
        z-index: 0;
    }
    .animated-mail .left-fold {
        position: absolute;
        bottom: 0;
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 50px 0 50px 100px;
        border-color: transparent transparent transparent #e15349;
        z-index: 2;
    }
    .animated-mail .letter {
        left: 20px;
        bottom: 0px;
        position: absolute;
        width: 160px;
        height: 60px;
        background: white;
        z-index: 1;
        overflow: hidden;
        -webkit-transition: 0.4s 0.2s;
        -moz-transition: 0.4s 0.2s;
        transition: 0.4s 0.2s;
    }
    .animated-mail .letter .letter-border {
        height: 10px;
        width: 100%;
        background: repeating-linear-gradient(
                -45deg,
                #cb5a5e,
                #cb5a5e 8px,
                transparent 8px,
                transparent 18px
        );
    }
    .animated-mail .letter .letter-title {
        margin-top: 10px;
        margin-left: 5px;
        height: 10px;
        width: 40%;
        background: #cb5a5e;
    }
    .animated-mail .letter .letter-context {
        margin-top: 10px;
        margin-left: 5px;
        height: 10px;
        width: 20%;
        background: #cb5a5e;
    }
    .animated-mail .letter .letter-stamp {
        margin-top: 30px;
        margin-left: 120px;
        border-radius: 100%;
        height: 30px;
        width: 30px;
        background: #cb5a5e;
        opacity: 0.3;
    }

    .shadow {
        color: white;
        position: absolute;
        top: 200px;
        left: 50%;
        width: 400px;
        height: 30px;
        transition: 0.4s;
        transform: translateX(-50%);
        -webkit-transition: 0.4s;
        -webkit-transform: translateX(-50%);
        -moz-transition: 0.4s;
        -moz-transform: translateX(-50%);
        border-radius: 100%;
        background: radial-gradient(
                rgba(0, 0, 0, 0.5),
                rgba(0, 0, 0, 0),
                rgba(0, 0, 0, 0)
        );
    }

    .letter-image:hover .animated-mail {
        transform: translateY(50px);
        -webkit-transform: translateY(50px);
        -moz-transform: translateY(50px);
    }
    .letter-image:hover .animated-mail .top-fold {
        transition:
                transform 0.4s,
                z-index 0.2s;
        transform: rotateX(180deg);
        -webkit-transition:
                transform 0.4s,
                z-index 0.2s;
        -webkit-transform: rotateX(180deg);
        -moz-transition:
                transform 0.4s,
                z-index 0.2s;
        -moz-transform: rotateX(180deg);
        z-index: 0;
    }
    .letter-image:hover .animated-mail .letter {
        height: 180px;
    }
    .letter-image:hover .shadow {
        width: 250px;
    }
</style>