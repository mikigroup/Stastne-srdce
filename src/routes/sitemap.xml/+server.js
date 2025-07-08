import path from "path";

export async function GET() {
	const filePaths = Object.keys(await import.meta.glob("../**/*.{svelte,md}"));

	const urls = filePaths
		.map((filePath) => {
			const url = filePath
				.slice(3)
				.replace(path.extname(filePath), "")
				.replace(/\+page$/, "")
				// remove last slash
				.replace(/\/$/, "")
				// remove all instances of [...x] from string, where x is a number
				.replace(/\[\.\.\.\d+\]/g, "");

			// Určení priority podle typu stránky
			let priority = "0.7";
			let changefreq = "daily";

			if (url === "") {
				// Hlavní stránka
				priority = "1.0";
				changefreq = "daily";
			} else if (url === "obedy" || url === "cenik") {
				// Důležité obchodní stránky
				priority = "0.9";
				changefreq = "daily";
			} else if (url === "kontakt" || url === "poradna") {
				// Kontaktní a informační stránky
				priority = "0.8";
				changefreq = "weekly";
			} else if (url.startsWith("admin")) {
				// Admin stránky - nižší priorita
				priority = "0.3";
				changefreq = "monthly";
			} else if (url.includes("auth") || url.includes("login") || url.includes("signup")) {
				// Autentizační stránky - velmi nízká priorita
				priority = "0.2";
				changefreq = "monthly";
			}

			// Aktuální datum pro lastmod
			const lastmod = new Date().toISOString().split('T')[0];

			return `
			<url>
				<loc>/${url}</loc>
				<lastmod>${lastmod}</lastmod>
				<changefreq>${changefreq}</changefreq>
				<priority>${priority}</priority>
			</url>
		`;
		})
		.filter((url) => !url.includes("+layout") && !url.startsWith("admin"))
		.join("\n");

	return new Response(
		`
      <?xml version="1.0" encoding="UTF-8" ?>
      <urlset
        xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="https://www.w3.org/1999/xhtml"
        xmlns:mobile="https://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:news="https://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="https://www.google.com/schemas/sitemap-video/1.1"
      >
				${urls}
      </urlset>
    `.trim(),
		{
			headers: {
				"Cache-Control": "max-age=0, s-maxage=3600",
				"Content-Type": "application/xml"
			}
		}
	);
}
