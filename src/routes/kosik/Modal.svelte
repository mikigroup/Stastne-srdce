<script>
	export let showModal;

	let dialog;

	$: if (dialog && showModal) dialog.showModal();
</script>

<dialog
	class="w-full lg:w-1/2 xl:1/3"
	bind:this={dialog}
	on:close={() => (showModal = false)}
	on:click|self={() => dialog.close()}>
	<div on:click|stopPropagation>
		<div class="m-3 md:m-10">
			<h5 class="pb-10 text-2xl text-center md:text-2xl">
				Opravdu chcete potvrdit košík a odeslat ?
			</h5>
			<div class="grid grid-cols-2 gap-8">
				<slot />
				<div class="">
					<button
						class="w-full px-4 py-2 text-center text-white bg-green-800 border rounded-lg shadow-md hover:border-black"
						type="button"
						autofocus
						on:click={() => dialog.close()}>Zavřít</button>
				</div>
			</div>
		</div>
	</div>
</dialog>

<style>
	dialog {
		border-radius: 0.6em;
		border: none;
		padding: 0;
	}
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.3);
	}
	dialog > div {
		padding: 1em;
	}
	dialog[open] {
		animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes zoom {
		from {
			transform: scale(0.95);
		}
		to {
			transform: scale(1);
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
	button {
		display: block;
	}
</style>
