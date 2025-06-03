<script lang="ts">
	import { fly } from "svelte/transition";
	import { goto } from "$app/navigation";

	export let title: string;
	export let subtitle: string = "";
	export let backUrl: string;
	export let actions: Array<{
		label: string;
		onClick: () => void;
		loading?: boolean;
		variant?: 'primary' | 'secondary' | 'danger';
		disabled?: boolean;
	}> = [];
	export let successMessage: string = "";
	export let errorMessage: string = "";
	export let loading: boolean = false;

	async function handleBack() {
		await goto(backUrl);
	}

	function getButtonClasses(variant: string = 'secondary') {
		const baseClasses = "px-4 py-2 text-sm rounded transition-colors disabled:opacity-50";
		
		switch (variant) {
			case 'primary':
				return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700`;
			case 'danger':
				return `${baseClasses} bg-red-600 text-white hover:bg-red-700`;
			default:
				return `${baseClasses} border border-gray-300 hover:bg-gray-50`;
		}
	}
</script>

<div class="bg-white rounded-lg shadow-md p-6" in:fly={{ y: 50, duration: 500 }}>
	<!-- Header -->
	<div class="flex items-center justify-between mb-6">
		<div>
			<h2 class="text-xl font-semibold">
				{title}
				{#if subtitle}
					<span class="text-lg text-gray-600">{subtitle}</span>
				{/if}
			</h2>
		</div>
		<div class="flex gap-2">
			<button 
				on:click={handleBack} 
				class={getButtonClasses('secondary')}>
				Zpět
			</button>
			{#each actions as action}
				<button
					disabled={action.disabled || loading}
					on:click={action.onClick}
					class={getButtonClasses(action.variant)}>
					{action.loading ? 'Načítá se...' : action.label}
				</button>
			{/each}
		</div>
	</div>

	<!-- Success Message -->
	{#if successMessage}
		<div class="mb-4 p-3 bg-green-100 border border-green-200 text-green-800 rounded">
			{successMessage}
		</div>		
	{/if}
	<!-- Error Message -->
	{#if errorMessage}
		<div class="mb-4 p-3 bg-red-100 border border-red-200 text-red-800 rounded">
			{errorMessage}
		</div>
	{/if}

	<!-- Content -->
	<slot />
</div> 