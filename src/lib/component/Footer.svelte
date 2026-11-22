<script lang="ts">
	import { page } from '$app/state';
	import Icon from '$lib/component/Icon.svelte';

	let {
		version = import.meta.env.PUBLIC_VERSION || '1.5',
		onEditCookies
	}: {
		version?: string;
		onEditCookies?: () => void;
	} = $props();

	let footerText = $derived(page.data.appearanceSettings?.footerText || '');
	let socialSettings = $derived(page.data.socialSettings || {});
	let hasSocial = $derived(Boolean(
		socialSettings.facebook ||
			socialSettings.instagram ||
			socialSettings.twitter ||
			socialSettings.linkedin ||
			socialSettings.youtube
	));
</script>

<footer class="bg-gradient-to-r from-gray-50 to-gray-100 shadow-inner md:pt-20">
	<div class="max-w-7xl mx-auto px-3 py-3 md:px-4 md:py-6">
		<div class="flex w-full flex-col items-center justify-center gap-2 md:flex-row md:gap-6">
			<div class="flex flex-row flex-wrap items-center justify-center gap-x-3 gap-y-1 md:gap-6">
				<a href="/obchodni-podminky" class="text-center text-xs font-medium text-gray-600 transition-colors duration-200 hover:text-green-700 hover:underline md:text-sm">
					Obchodní podmínky
				</a>
				<a href="/kontakt" class="text-center text-xs font-medium text-gray-600 transition-colors duration-200 hover:text-green-700 hover:underline md:text-sm">
					Kontakt
				</a>
				<a href="/gdpr" class="text-center text-xs font-medium text-gray-600 transition-colors duration-200 hover:text-green-700 hover:underline md:text-sm">
					GDRP
				</a>
			</div>

			{#if hasSocial}
				<div class="flex justify-center gap-4">
					{#if socialSettings.facebook}
						<a href="{socialSettings.facebook}" target="_blank" rel="noopener" aria-label="Facebook" class="text-gray-500 hover:text-green-700 text-2xl">
							<Icon name="facebook" />
						</a>
					{/if}
					{#if socialSettings.instagram}
						<a href="{socialSettings.instagram}" target="_blank" rel="noopener" aria-label="Instagram" class="text-gray-500 hover:text-green-700 text-2xl">
							<Icon name="instagram" />
						</a>
					{/if}
					{#if socialSettings.twitter}
						<a href="{socialSettings.twitter}" target="_blank" rel="noopener" aria-label="Twitter" class="text-gray-500 hover:text-green-700 text-2xl">
							<Icon name="twitter" />
						</a>
					{/if}
					{#if socialSettings.linkedin}
						<a href="{socialSettings.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn" class="text-gray-500 hover:text-green-700 text-2xl">
							<Icon name="linkedin" />
						</a>
					{/if}
					{#if socialSettings.youtube}
						<a href="{socialSettings.youtube}" target="_blank" rel="noopener" aria-label="YouTube" class="text-gray-500 hover:text-green-700 text-2xl">
							<Icon name="youtube" />
						</a>
					{/if}
				</div>
			{/if}

			{#if footerText}
				<div class="text-center text-xs text-gray-500 md:text-sm">
					<p>{footerText}</p>
				</div>
			{/if}
		</div>

		<div class="mt-2 border-t border-gray-200 pt-2 text-center text-[0.6875rem] leading-tight text-gray-400 md:mt-4 md:pt-4 md:text-xs md:leading-normal">
			<div class="flex items-center justify-center gap-1.5 md:gap-2">
				<span class="text-gray-500">Vytvořeno s</span>
				<a href="https://www.malyleo.cz/" target="_blank" class="flex items-center text-xs md:text-sm">
					<Icon name="hand-spock" class="mr-1" /> MalyLeo
				</a>
				<span class="text-gray-400">core{version}</span>
			</div>
			<p class="mt-1">Tento web používá cookies pro lepší uživatelský zážitek.</p>
			<p>
				<button
					type="button"
					class="bg-transparent p-0 text-[inherit] font-normal text-gray-400 hover:text-gray-600 hover:underline"
					onclick={() => onEditCookies?.()}
				>
					Upravit nastavení cookies.
				</button>
			</p>
		</div>
	</div>
</footer>