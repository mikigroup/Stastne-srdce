<script>
	export let rezcalendar;
	function formatTime(timeString) {
		const [hours, minutes] = timeString.split(":");
		return `${hours}:${minutes}`;
	}
</script>

<div class="w-2/4">
	<div class="my-10">
		<h2
			class="text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white text-center">
			Rezervace
		</h2>
	</div>
	<div class="border rounded-xl p-5 flex flex-col gap-2">
		{#if rezcalendar}
			{#each rezcalendar as item, index (item.id)}
				<div class="border rounded-xl gap-2 p-5 hover:bg-slate-200">
					<div>{item.date}</div>
					<div class="text-lg font-bold">{formatTime(item.time)}</div>
					<div class="mt-2">Poznámka:<br />{item.note}</div>
				</div>
			{/each}
		{:else}
			<p>Žádné položky</p>
		{/if}
	</div>
</div>
