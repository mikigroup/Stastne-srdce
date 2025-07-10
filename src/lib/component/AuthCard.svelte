<script lang="ts">
	export let title: string;
	export let subtitle: string = "";
	export let showBorder: boolean = true;
</script>

<div class="bg-white rounded-lg shadow-md {showBorder ? 'border border-gray-300' : ''} p-8 min-h-[500px] flex flex-col">
	<div class="text-center mb-6">
		<h1 class="text-3xl font-light text-gray-800 sm:text-2xl mb-2">
			{title}
		</h1>
		{#if subtitle}
			<p class="text-sm text-gray-500">
				{@html subtitle}
			</p>
		{/if}
	</div>
	
	<div class="flex-1">
		<slot />
	</div>
</div> 