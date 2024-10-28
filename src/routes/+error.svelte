<script>
	import { page } from "$app/stores";
</script>

<section class="bg-white">
	<div class="max-w-screen-xl px-4 py-8 mx-auto lg:py-16 lg:px-6">
		<div class="max-w-screen-sm mx-auto text-center">
			<h1
				class="mb-4 font-extrabold tracking-tight text-7xl lg:text-9xl text-primary-600">
				{$page.status}: {$page.error.message}
			</h1>
			<p
				class="mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
				Něco se porouchalo
			</p>
			<p class="mb-4 text-lg font-light text-gray-500">
				Omlouváme se, stránku se nepodařilo najít.
			</p>
			<a
				href="/"
				class="inline-flex bg-primary-600 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center my-4"
				>Zpátky na začátek</a>
		</div>
	</div>
</section>
