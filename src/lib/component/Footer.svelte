<script lang="ts">
	import { writable } from 'svelte/store';
	import { page } from '$app/stores';

	// Získáme nastavení z page data
	$: settings = $page.data.settings;
	$: footerText = settings?.appearance?.footerText || '© Šťastné srdce s.r.o. 2022 - 2025. Všechna práva vyhrazena.';
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

			<div class="text-gray-500 text-xs md:text-sm mt-5 md:mt-0">
				<p>{footerText}</p>
			</div>
		</div>

		<div class="mt-4 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
			<div class="flex items-center justify-center space-x-2">
				<span class="text-gray-500 text-xs">Vytvořeno s</span>
				<a href="https://www.malyleo.cz/" target="_blank" class="text-sm flex items-center">
					<i class="fa fa-regular fa-hand-spock mr-1"></i> MalyLeo™
				</a>
				<span class="text-gray-400 text-xs">core1.1b</span>
			</div>
			<p>Tento web používá cookies pro lepší uživatelský zážitek.</p>
		</div>
	</div>
</footer>