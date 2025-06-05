<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	interface Dialog extends HTMLDialogElement {
		showModal: () => void;
		close: () => void;
	}

	let dialog: Dialog | null = null;

	export function show() {
		if (dialog) {
			dialog.showModal();
		}
	}

	export function close() {
		if (dialog) {
			dialog.close();
		}
	}
</script>

<dialog
	class="w-full max-w-2xl p-0 relative"
	bind:this={dialog}
	on:close={() => dispatch('close')}
	on:click|self={() => close()}>
	<button
		class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
		type="button"
		on:click={() => close()}>
		<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
		</svg>
	</button>
	<div class="p-8" on:click|stopPropagation>
		<slot />
		<div class="mt-8">
			<button
				class="w-full px-6 py-3 text-center text-white bg-green-800 border rounded-lg shadow-md hover:bg-green-700 text-lg font-semibold"
				type="button"
				on:click={() => dispatch('confirm')}>
				Potvrdit
			</button>
		</div>
	</div>
</dialog>

<style>
    dialog {
        border-radius: 0.6em;
        border: none;
        padding: 0;
        margin: 0;
        max-height: 90vh;
        overflow-y: auto;
        position: fixed;
        inset: 0;
        margin: auto;
        min-width: 320px;
        background: white;
    }
    dialog::backdrop {
        background: rgba(0, 0, 0, 0.3);
    }
    dialog[open] {
        animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes zoom {
        from {
            transform: scale(0.95);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }
    dialog[open]::backdrop {
        animation: fade 0.2s ease-out;
    }
    @keyframes fade {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
</style>