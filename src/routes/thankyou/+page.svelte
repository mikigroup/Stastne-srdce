<svelte:head>
	<title>Šťastné srdce - Děkujeme za objednávku</title>
	<meta name="description" content="Děkujeme za objednávku" />
</svelte:head>

<div
	class="max-w-screen-lg px-4 py-8 py-16 mx-auto mt-20 rounded-lg bg-orange-50">
	<div class="flex justify-center pt-5">
		<p class="text-xl md:text-2xl">Děkujeme za objednávku, ať jídlo chutná !</p>
	</div>
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
