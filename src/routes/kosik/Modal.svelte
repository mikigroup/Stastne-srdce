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
	class="w-full max-w-2xl p-0 relative backdrop:bg-black/50 backdrop:backdrop-blur-sm"
	bind:this={dialog}
	on:close={() => dispatch('close')}
	on:click|self={() => close()}>
	
	<!-- Modern modal design -->
	<div class="bg-white/90 backdrop-blur-lg rounded-3xl border border-white/30 shadow-2xl overflow-hidden">
		<!-- Header -->
		<div class="bg-gradient-to-r from-emerald-500 to-blue-500 p-6 text-white relative">
			<button
				class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 flex items-center justify-center group"
				type="button"
				on:click={() => close()}>
				<svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
			
			<div class="flex items-center gap-3">
				<div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<div>
					<h3 class="text-2xl font-bold">Potvrzení objednávky</h3>
					<p class="text-emerald-100">Zkontrolujte své údaje a dokončete objednávku</p>
				</div>
			</div>
		</div>

		<!-- Content -->
		<div class="p-8" on:click|stopPropagation>
			<slot />
			
			<!-- Action buttons -->
			<div class="flex gap-4 mt-8">
				<button
					class="flex-1 px-6 py-4 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl font-semibold transition-all duration-200 hover:-translate-y-0.5"
					type="button"
					on:click={() => close()}>
					Zrušit
				</button>
				<button
					class="flex-1 px-6 py-4 text-white bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
					type="button"
					on:click={() => dispatch('confirm')}>
					Potvrdit objednávku
				</button>
			</div>
		</div>
	</div>
</dialog>

<style>
    dialog {
        border-radius: 1.5rem;
        border: none;
        padding: 0;
        margin: auto;
        max-height: 90vh;
        max-width: 90vw;
        overflow-y: auto;
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        background: transparent;
    }
    
    dialog::backdrop {
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
    }
    
    dialog[open] {
        animation: modalAppear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    @keyframes modalAppear {
        from {
            transform: translate(-50%, -50%) scale(0.9);
            opacity: 0;
        }
        to {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
    }
    
    dialog[open]::backdrop {
        animation: backdropFade 0.2s ease-out;
    }
    
    @keyframes backdropFade {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
</style>