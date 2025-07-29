<script lang="ts">
	import { writable } from 'svelte/store';
	import { page } from '$app/stores';

	export let version = import.meta.env.PUBLIC_VERSION || '1.1.0-dev';

	$: footerText = $page.data.appearanceSettings?.footerText || '';
    $: socialSettings = $page.data.socialSettings || {};
</script>

<footer class="bg-gradient-to-r from-gray-50 to-gray-100 shadow-inner pt-20">
	<div class="max-w-7xl mx-auto px-4 py-6">
		<div class="flex flex-col md:flex-row justify-between items-center gap-4">
			<div class="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6 md:pb-0">
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

            <!-- Sociální sítě -->
            <div class="flex justify-center gap-4 mt-4">
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

			<div class="text-gray-500 text-xs md:text-sm mt-5 md:mt-0 text-center">
				{#if footerText}
					<p>{footerText}</p>
				{/if}
			</div>
		</div>

		<div class="mt-4 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
			<div class="flex items-center justify-center space-x-2">
				<span class="text-gray-500 text-xs">Vytvořeno s</span>
				<a href="https://www.malyleo.cz/" target="_blank" class="text-sm flex items-center">
					<i class="fa fa-regular fa-hand-spock mr-1"></i> MalyLeo™
				</a>
				<span class="text-gray-400 text-xs">core{version}</span>
			</div>
			<p>Tento web používá cookies pro lepší uživatelský zážitek.</p>
		</div>
	</div>
</footer>