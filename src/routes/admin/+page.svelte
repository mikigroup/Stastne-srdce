<script lang="ts">
	import { Line } from 'svelte-chartjs'
</script>

<!--viz. https://github.com/SauravKanchan/svelte-chartjs  <Line data={...} />-->


<div class="flex justify-center">

	<div class="stats stats-vertical sm:stats-horizontal border rounded-xl shadow-2xl">
		<div class="stat">
			<div class="stat-desc">Počet objednávek za aktuální měsíc</div>
			<div class="stat-value">31K</div>
			<div class="stat-title">1.Led - 1.Únor</div>
		</div>

		<div class="stat">
			<div class="stat-desc">Nový uživatelé</div>
			<div class="stat-value">4,200</div>
			<div class="stat-title">↗︎ 400 (22%)</div>
		</div>

		<div class="stat">
			<div class="stat-desc">Chystá se</div>
			<div class="stat-value">.</div>
			<div class="stat-title">!</div>
		</div>
	</div>

	<div
		class="radial-progress"
		style="--value:70; --size:12rem; --thickness: 2px;"
		role="progressbar">
		70%
	</div>
	<div
		class="radial-progress"
		style="--value:70; --size:12rem; --thickness: 2rem;"
		role="progressbar">
		70%
	</div>

</div>