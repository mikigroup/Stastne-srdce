<script>
	import { onMount } from "svelte";
	import { gsap } from "gsap";

	let grassElement;
	let grassBlades = [];

	onMount(() => {
		grassBlades = grassElement.querySelectorAll(".grass-blade");
		gsap.set(grassBlades, {
			transformOrigin: "bottom"
		});

		grassBlades.forEach((blade, index) => {
			gsap.set(blade, {
				x: gsap.utils.random(-10, 10),
				y: gsap.utils.random(-20, 0),
				z: index * -1
			});

			gsap.to(blade, {
				duration: 2,
				rotateZ: gsap.utils.random(-10, 10),
				repeat: -1,
				yoyo: true,
				ease: "power1.inOut",
				delay: gsap.utils.random(0, 1)
			});
		});
	});
</script>

<div class="grass" bind:this={grassElement}>
	{#each Array(30) as _, i}
		<div class="grass-blade"></div>
	{/each}
</div>

<style>
	.grass {
		position: relative;
		width: 100%;
		height: 10em;
		overflow: hidden;
		display: flex;
		justify-content: center;
	}

	.grass-blade {
		position: absolute;
		bottom: 0;
		width: 0.3em;
		height: 4em;
		background-color: forestgreen;
		transform-origin: bottom;
		border-width: 0.1em;
		border-color: #444444;
	}
</style>
