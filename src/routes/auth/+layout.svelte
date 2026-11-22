<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>


<div class="min-h-screen flex items-start justify-center pt-4 px-4 sm:items-center sm:py-12 sm:px-6 lg:px-8 footer_fix">
	<div class="max-w-md w-full space-y-8">
		{@render children?.()}
	</div>
</div>
