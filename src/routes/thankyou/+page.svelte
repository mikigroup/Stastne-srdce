<script lang="ts">
	import { onMount } from 'svelte';
	import { CartItemsStore } from "$lib/stores/store";
	import { page } from "$app/stores";

	export let data;
	const { order, profileValidation } = data;

	// Funkce pro formátování data
	function formatDate(dateString: string) {
		if (!dateString) return '';
		const date = new Date(dateString);
		return date.toLocaleDateString('cs-CZ', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	onMount(() => {
		// Vyčištění košíku po úspěšném zobrazení souhrnu
		setTimeout(() => {
			CartItemsStore.clear();
			console.log("Košík byl vyčištěn po zobrazení souhrnu objednávky");
		}, 1500);
	});

	const { generalSettings } = data;
</script>

<svelte:head>
	<title>{generalSettings.shopName} - Děkujeme za objednávku</title>
	<meta name="description" content="Děkujeme za objednávku" />
</svelte:head>

<div class="max-w-screen-lg px-4 py-8 py-16 mx-auto mt-20 rounded-lg bg-orange-50">
	<div class="letter-container">
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
		</div>
	</div>

	<div class="flex flex-col items-center pt-5 mb-8">
		<h1 class="text-3xl md:text-4xl font-bold text-green-800 mb-2">Děkujeme za objednávku!</h1>
		<p class="text-xl md:text-2xl">Vaše jídlo bylo úspěšně objednáno</p>
		{#if order.order_number}
			<p class="mt-2 text-lg">Číslo objednávky: <strong>{order.order_number}</strong></p>
		{/if}
		<p class="text-sm mt-2">Potvrzení bylo zasláno na Váš e-mail</p>
	</div>

	<!-- Odkaz zpět do jídelníčku -->
	<div class="flex justify-center mt-8">
		<a href="/obedy" class="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors shadow-md">
			Zpět na obědy
		</a>
	</div>
</div>

<style>
	.letter-container {
		position: relative;
		width: 100%;
		height: 200px;
		margin-bottom: 20px;
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
		transform-origin: 50% 0%;
		transition: transform 0.4s 0.4s, z-index 0.2s 0.4s;
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

	.letter-image:hover .animated-mail {
		transform: translateY(50px);
	}

	.letter-image:hover .animated-mail .top-fold {
		transition: transform 0.4s, z-index 0.2s;
		transform: rotateX(180deg);
		z-index: 0;
	}

	.letter-image:hover .animated-mail .letter {
		height: 180px;
	}

	.letter-border {
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

	.letter-title {
		margin-top: 10px;
		margin-left: 5px;
		height: 10px;
		width: 40%;
		background: #cb5a5e;
	}

	.letter-context {
		margin-top: 10px;
		margin-left: 5px;
		height: 10px;
		width: 20%;
		background: #cb5a5e;
	}

	.letter-stamp {
		margin-top: 30px;
		margin-left: 120px;
		border-radius: 100%;
		height: 30px;
		width: 30px;
		background: #cb5a5e;
		opacity: 0.3;
	}
</style>