<script lang="ts">
	import { enhance } from "$app/forms";
	import type { SubmitFunction } from "@sveltejs/kit";
	import type { ActionData, PageData } from "./$types";	
	import { onMount } from "svelte";

	export let data: PageData;
	export let form: ActionData;

	// Bezpečné načtení dat s výchozími hodnotami
	let { texts = [], pages = [], occupiedPositions = [] } = data;
	$: ({ texts = [], pages = [], occupiedPositions = [] } = data);

	// Inicializace proměnných
	let html = "";
	let loading = false;
	let title = "";
	let selectedTextId = 0;
	let selectedPage = "hlavni";
	let position = "";
	let editorDiv: HTMLElement;
	let editorInitialized = false;

	// Formátovací akce pro editor
	const formatActions = [
		{ cmd: 'bold', icon: '<i class="fas fa-bold"></i>', title: 'Tučně' },
		{ cmd: 'italic', icon: '<i class="fas fa-italic"></i>', title: 'Kurzíva' },
		{ cmd: 'underline', icon: '<i class="fas fa-underline"></i>', title: 'Podtržení' },
		{ cmd: 'strikeThrough', icon: '<i class="fas fa-strikethrough"></i>', title: 'Přeškrtnutí' },
		{ cmd: 'insertUnorderedList', icon: '<i class="fas fa-list-ul"></i>', title: 'Odrážkový seznam' },
		{ cmd: 'insertOrderedList', icon: '<i class="fas fa-list-ol"></i>', title: 'Číslovaný seznam' },
		{ cmd: 'justifyLeft', icon: '<i class="fas fa-align-left"></i>', title: 'Zarovnat vlevo' },
		{ cmd: 'justifyCenter', icon: '<i class="fas fa-align-center"></i>', title: 'Zarovnat na střed' },
		{ cmd: 'justifyRight', icon: '<i class="fas fa-align-right"></i>', title: 'Zarovnat vpravo' },
		{ cmd: 'insertHorizontalRule', icon: '<i class="fas fa-ruler-horizontal"></i>', title: 'Horizontální čára' },
		{ cmd: 'removeFormat', icon: '<i class="fas fa-eraser"></i>', title: 'Odstranit formátování' },
		{
			cmd: 'code',
			icon: '<i class="fas fa-code"></i>',
			title: 'Zdrojový kód',
			result: () => {
				// Uložení aktuální pozice kurzoru
				const selection = window.getSelection();
				const range = selection.getRangeAt(0);

				// Vytvoření pre a code elementů
				const pre = document.createElement('pre');
				const code = document.createElement('code');

				// Získání vybraného textu nebo vložení prázdného řádku pro kód
				let content = '';
				if (selection.toString().length > 0) {
					content = selection.toString();
				} else {
					content = 'Sem vložte kód';
				}

				// Nastavení obsahu a vložení elementů
				code.textContent = content;
				pre.appendChild(code);
				pre.style.backgroundColor = '#f6f8fa';
				pre.style.padding = '16px';
				pre.style.borderRadius = '6px';
				pre.style.overflow = 'auto';
				code.style.fontFamily = 'monospace';

				// Vložení do dokumentu
				range.deleteContents();
				range.insertNode(pre);

				// Aktualizace HTML
				updateHtmlFromEditor();
			}
		}
	];

	// Headings a speciální formátování
	const headingActions = [
		{ cmd: 'formatBlock', value: 'h1', title: 'Nadpis 1', text: 'H1' },
		{ cmd: 'formatBlock', value: 'h2', title: 'Nadpis 2', text: 'H2' },
		{ cmd: 'formatBlock', value: 'h3', title: 'Nadpis 3', text: 'H3' },
		{ cmd: 'formatBlock', value: 'p', title: 'Odstavec', text: 'P' },
		{ cmd: 'formatBlock', value: 'blockquote', title: 'Citace', text: 'Citace' }
	];

	// Pokud stránka "hlavni" není v seznamu pages, přidáme ji jako výchozí
	$: availablePages = pages.includes("hlavni") ? pages : ["hlavni", ...pages];

	// Filtrace textů podle vybrané stránky
	$: filteredTexts = texts?.filter((text) => text.page === selectedPage) || [];

	// Funkce pro vykonání formátovacího příkazu
	function execCommand(cmd: string, value: string = '') {
		document.execCommand(cmd, false, value);
		updateHtmlFromEditor();
	}

	// Aktualizovat HTML proměnnou z obsahu contenteditable divu
	function updateHtmlFromEditor() {
		if (editorDiv) {
			html = editorDiv.innerHTML;
		}
	}

	// Nastavit obsah editoru - vylepšená verze
	function setEditorContent(content: string) {
		if (editorDiv) {
			// Zabránění nekonečné smyčce aktualizací při nastavování obsahu
			const temp = editorDiv.onblur;
			editorDiv.onblur = null;

			editorDiv.innerHTML = content;

			// Obnovení event listeneru
			setTimeout(() => {
				editorDiv.onblur = temp;
				updateHtmlFromEditor();
			}, 0);
		}
	}

	// Funkce pro načtení textu - rozšířená verze
	function loadText(textId: number) {
		if (!texts) return;

		if (textId === 0) {
			// Nový text
			selectedTextId = 0;
			title = "";
			html = "";
			setEditorContent("");
			position = "";
			return;
		}

		const text = texts.find((t) => t.id === textId);
		if (text) {
			selectedTextId = text.id;
			title = text.title || "";
			selectedPage = text.page || "hlavni";
			position = text.position || "";
			html = text.text || "";

			// Nastavíme obsah editoru, pokud je již inicializován
			if (editorInitialized) {
				setEditorContent(text.text || "");
			}

			console.log("Načtený text ID:", selectedTextId, "Titulek:", title);
		}
	}

	// Reset formuláře
	function resetForm() {
		selectedTextId = 0;
		title = "";
		html = "";
		setEditorContent("");
		position = "";
	}

	// Změna vybrané stránky
	function handlePageChange() {
		selectedTextId = 0;
		html = "";
		title = "";
		position = "";

		// Automaticky vybere existující text pro tuto stránku, pokud existuje
		if (texts) {
			const existingText = texts.find(text => text.page === selectedPage);
			if (existingText) {
				loadText(existingText.id);
			}
		}
	}

	const handleSubmit: SubmitFunction = ({ formData }) => {
		updateHtmlFromEditor(); // Aktualizujeme html proměnnou před odesláním

		const submittedTitle = formData.get("title") as string;
		const submittedPage = formData.get("page") as string;

		// Aktualizujeme text hodnotu ve formData
		formData.set("text", html);

		if (!html) {
			alert("Text je povinný");
			return;
		}

		if (!submittedPage) {
			alert("Stránka je povinná");
			return;
		}

		loading = true;
		return async ({ update, result }) => {
			await update();
			loading = false;

			if (result.type === "success") {
				console.log("Text uložen úspěšně");
				// Obnovit stránku pro načtení aktuálních dat
				setTimeout(() => window.location.reload(), 1000);
			} else {
				console.error("Chyba při ukládání:", result.error);
				alert("Chyba při ukládání: " + (result.error?.message || "Neznámá chyba"));
			}
		};
	};

	// Kontrola kolize pozic
	function checkPosition(selectedPosition: string) {
		if (!occupiedPositions) return;

		// Hledáme pouze pozice obsazené jinými texty, ne aktuálním
		const occupiedPosition = occupiedPositions.find(
			(p) => p.position === selectedPosition && p.id !== selectedTextId
		);

		if (occupiedPosition) {
			const confirmed = confirm(
				`Pozice '${selectedPosition}' je již obsazena textem ID ${occupiedPosition.id}. Chcete přepsat existující text?`
			);
			if (confirmed) {
				loadText(occupiedPosition.id);
			} else {
				position = "";
			}
		}
	}

	// Inicializace editoru a nastavení sledování změn
	function initializeEditor() {
		if (!editorDiv) return;

		// Přidáme event listenery pro sledování změn
		editorDiv.addEventListener('input', updateHtmlFromEditor);
		editorDiv.addEventListener('blur', updateHtmlFromEditor);

		// Označíme editor jako inicializovaný
		editorInitialized = true;

		// Pokud máme již vybraný text, nastavíme jeho obsah
		if (selectedTextId > 0) {
			const text = texts.find(t => t.id === selectedTextId);
			if (text && text.text) {
				setEditorContent(text.text);
			}
		}
	}

	// Reaktivní aktualizace obsahu editoru při změně html
	$: if (editorInitialized && editorDiv && html !== editorDiv.innerHTML) {
		setEditorContent(html);
	}

	// Inicializace - načtení prvního textu po vykreslení komponenty
	onMount(() => {
		// Inicializace editoru
		initializeEditor();

		// Pokud existují texty pro vybranou stránku, načteme první
		if (texts && texts.length > 0) {
			const firstText = texts.find(text => text.page === selectedPage);
			if (firstText) {
				loadText(firstText.id);
			}
		}
	});
</script>

<svelte:head>
	<title>Editor textů</title>
	<meta name="description" content="Editor textů pro různé stránky" />
	<!-- Font Awesome pro ikony v editoru -->
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
</svelte:head>

<section class="flex justify-center container mx-auto p-4">
	<div class="w-full max-w-4xl bg-white p-6 rounded-lg shadow-md">
		<form method="POST" action="?/update" use:enhance={handleSubmit} class="">
			<div class="">
				<h1 class="text-3xl font-bold mb-6">Editor textů</h1>

				<!-- Výběr stránky -->
				<div class="mb-6">
					<label for="page-select" class="block text-sm font-medium text-gray-700 mb-2">
						Stránka
					</label>
					<select
						id="page-select"
						name="page"
						class="min-w-32 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						bind:value={selectedPage}
						on:change={handlePageChange}
						required>
						{#each availablePages as page}
							<option value={page}>{page}</option>
						{/each}
					</select>
				</div>

				<!-- Umístění (pouze pro stránku "hlavni") -->
				{#if selectedPage === "hlavni"}
					<div class="mb-6">
						<label class="block text-sm font-medium text-gray-700 mb-2">Umístění</label>
						<div class="flex gap-6">
							{#each ["left", "center", "right"] as pos}
								<div class="flex items-center">
									<input
										type="radio"
										id={`position-${pos}`}
										name="position"
										value={pos}
										class="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
										bind:group={position}
										on:change={() => checkPosition(pos)} />
									<label for={`position-${pos}`} class="ml-2 text-sm text-gray-700">
										{pos === "left" ? "Levý" : pos === "center" ? "Střed" : "Pravý"}
									</label>
								</div>
							{/each}
						</div>
					</div>
				{:else}
					<input type="hidden" name="position" value="" />
				{/if}

				<!-- Nadpis (není povinný pro stránku "jidelnicek" nebo "obedy") -->
				{#if selectedPage === "hlavni"}
				<div class="mb-6">
					<label for="title" class="block text-sm font-medium text-gray-700 mb-2">
						Nadpis {selectedPage === "hlavni" ? "(není povinný pro obědy)" : ""}
					</label>
					<input
						class="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						id="title"
						name="title"
						type="text"
						bind:value={title}
						 />
				</div>
				{/if}

				<!-- Skrytý input pro odeslání obsahu -->
				<input type="hidden" name="text" value={html} />

				<!-- Editor toolbar -->
				<div class="mb-2 border border-gray-300 rounded-t-lg bg-gray-100 p-2 flex flex-wrap gap-1">
					<!-- Formátovací akce -->
					{#each formatActions as action}
						<button
							type="button"
							title={action.title}
							class="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200"
							on:click={() => action.result ? action.result() : execCommand(action.cmd)}>
							{@html action.icon}
						</button>
					{/each}

					<!-- Oddělovač -->
					<div class="border-r border-gray-300 mx-1 h-8"></div>

					<!-- Heading akce -->
					{#each headingActions as action}
						<button
							type="button"
							title={action.title}
							class="px-2 h-8 flex items-center justify-center rounded hover:bg-gray-200 font-bold"
							on:click={() => execCommand(action.cmd, action.value)}>
							{action.text}
						</button>
					{/each}
				</div>

				<!-- Editor -->
				<div class="mb-6">
					<div
						bind:this={editorDiv}
						contenteditable="true"
						class="border border-gray-300 rounded-b-lg p-4 min-h-[250px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 editor-content"
					></div>
				</div>

				<!-- HTML editor pro pokročilé uživatele -->
				<div class="mt-4 mb-6">
					<details>
						<summary class="cursor-pointer text-blue-600 hover:text-blue-800 mb-2">
							Zobrazit/skrýt HTML kód (pro pokročilé úpravy)
						</summary>
						<textarea
							class="w-full p-2 border border-gray-300 rounded-md font-mono text-sm"
							rows="6"
							bind:value={html}
							on:input={() => setEditorContent(html)}
							placeholder="HTML kód textu"
						></textarea>
					</details>
				</div>
			</div>

			<!-- Tlačítka a zpětná vazba -->
			<div class="mt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<button
					type="submit"
					class="px-6 py-2 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
					{loading ? "Ukládá se..." : "Uložit text"}
				</button>

				{#if form?.message}
					<div class="p-3 rounded-lg {form.message.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}">
						<p class="{form.message.success ? 'text-green-700' : 'text-red-700'} font-medium">
							{form.message.display}
						</p>
					</div>
				{/if}
			</div>
		</form>
	</div>
</section>

<style>
    /* Styly pro editor content */
    .editor-content {
        line-height: 1.5;
        font-family: sans-serif;
    }

    .editor-content h1 {
        font-size: 1.8em;
        font-weight: bold;
        margin: 0.5em 0;
    }

    .editor-content h2 {
        font-size: 1.5em;
        font-weight: bold;
        margin: 0.5em 0;
    }

    .editor-content h3 {
        font-size: 1.3em;
        font-weight: bold;
        margin: 0.5em 0;
    }

    .editor-content p {
        margin: 0.5em 0;
    }

    .editor-content blockquote {
        border-left: 3px solid #ddd;
        margin-left: 0;
        padding-left: 1em;
        color: #666;
    }

    .editor-content ul, .editor-content ol {
        margin: 0.5em 0;
        padding-left: 2em;
    }
</style>