<script lang="ts">
	import { page } from '$app/state';

	let { version = import.meta.env.PUBLIC_VERSION || '1.2' } = $props();

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
	<div class="max-w-7xl mx-auto px-4 py-6">
		<div class="flex w-full flex-col items-center justify-center gap-4 md:flex-row md:gap-6">
			<div class="flex flex-col items-center justify-center gap-2 md:flex-row md:gap-6">
				<a href="/obchodni-podminky" class="text-gray-600 hover:text-green-700 transition-colors duration-200 text-sm font-medium hover:underline text-center">
					Obchodní podmínky
				</a>
				<a href="/kontakt" class="text-gray-600 hover:text-green-700 transition-colors duration-200 text-sm font-medium hover:underline text-center">
					Kontakt
				</a>
				<a href="/gdpr" class="text-gray-600 hover:text-green-700 transition-colors duration-200 text-sm font-medium hover:underline text-center">
					GDRP
				</a>
			</div>

			{#if hasSocial}
				<div class="flex justify-center gap-4">
					{#if socialSettings.facebook}
						<a href="{socialSettings.facebook}" target="_blank" rel="noopener" aria-label="Facebook" class="text-gray-500 hover:text-green-700 text-2xl">
							<i class="fab fa-facebook"></i>
						</a>
					{/if}
					{#if socialSettings.instagram}
						<a href="{socialSettings.instagram}" target="_blank" rel="noopener" aria-label="Instagram" class="text-gray-500 hover:text-green-700 text-2xl">
							<i class="fab fa-instagram"></i>
						</a>
					{/if}
					{#if socialSettings.twitter}
						<a href="{socialSettings.twitter}" target="_blank" rel="noopener" aria-label="Twitter" class="text-gray-500 hover:text-green-700 text-2xl">
							<i class="fab fa-twitter"></i>
						</a>
					{/if}
					{#if socialSettings.linkedin}
						<a href="{socialSettings.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn" class="text-gray-500 hover:text-green-700 text-2xl">
							<i class="fab fa-linkedin"></i>
						</a>
					{/if}
					{#if socialSettings.youtube}
						<a href="{socialSettings.youtube}" target="_blank" rel="noopener" aria-label="YouTube" class="text-gray-500 hover:text-green-700 text-2xl">
							<i class="fab fa-youtube"></i>
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

		<div class="mt-4 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
			<div class="flex items-center justify-center space-x-2">
				<span class="text-gray-500 text-xs">Vytvořeno s</span>
				<a href="https://www.malyleo.cz/" target="_blank" class="text-sm flex items-center">
					<i class="fa fa-regular fa-hand-spock mr-1"></i> MalyLeo
				</a>
				<span class="text-gray-400 text-xs">core{version}</span>
			</div>
			<p>Tento web používá cookies pro lepší uživatelský zážitek.</p>
		</div>
	</div>
</footer>