import { emailTextRow, escapeEmailHtml, renderCustomerEmail } from "$lib/emailTemplates/layout";

type OrderEmailVariant = {
	variant_number?: string | number;
	description?: string;
	quantity?: number;
	price?: number;
};

type OrderEmailItem = {
	date?: string;
	soup?: string;
	variants?: OrderEmailVariant[];
};

function formatDay(value: string | undefined): string {
	if (!value) return "";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return escapeEmailHtml(value);
	return escapeEmailHtml(
		date.toLocaleDateString("cs-CZ", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
			timeZone: "Europe/Prague"
		})
	);
}

function lineTotal(quantity: number | undefined, price: number | undefined): number {
	const qty = Number(quantity);
	const unit = Number(price);
	if (!Number.isFinite(qty) || !Number.isFinite(unit)) return 0;
	return qty * unit;
}

export function buildOrderItemsEmailHtml(items: OrderEmailItem[]): string {
	return orderItemsHtml(items);
}

function orderItemsHtml(items: OrderEmailItem[]): string {
	const rows = items
		.map((item, index) => {
			const border = index === 0 ? "" : "border-top:1px solid #e7e5e4;";
			const variants = Array.isArray(item.variants) ? item.variants : [];
			const variantRows = variants
				.map((variant, variantIndex) => {
					const qty = Number(variant.quantity);
					const amount = lineTotal(variant.quantity, variant.price);
					const text = `${variant.variant_number ?? ""}. ${variant.description ?? ""} — ${Number.isFinite(qty) ? qty : 0} ks — ${amount} Kč`;
					const padding = variantIndex === variants.length - 1 ? "4px 16px 14px" : "4px 16px";
					return `<tr><td style="padding:${padding};font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#334155;">${escapeEmailHtml(text)}</td></tr>`;
				})
				.join("");

			return `<tr><td style="padding:14px 16px;background:#f5f5f4;${border}font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#1c1917;">${formatDay(item.date)}</td></tr>
				<tr><td style="padding:12px 16px 4px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#334155;">Polévka: ${escapeEmailHtml(item.soup ?? "")}</td></tr>
				${variantRows}`;
		})
		.join("");

	return `<tr>
		<td style="padding:20px 32px 0;">
			<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e7e5e4;">${rows}</table>
		</td>
	</tr>`;
}

export function createOrderConfirmationEmailTemplate(params: {
	orderId: string;
	items: OrderEmailItem[];
	totalPrice: number;
	totalPieces: number;
	note: string | null | undefined;
	shippingLabel: string;
	orderUrl: string;
}): string {
	const note = (params.note ?? "").trim();
	const summary = `<strong>Způsob dodání:</strong> ${escapeEmailHtml(params.shippingLabel)}<br>
		<strong>Celkový počet kusů:</strong> ${escapeEmailHtml(String(params.totalPieces))}<br>
		<strong>Celková cena:</strong> ${escapeEmailHtml(String(params.totalPrice))} Kč`;
	const noteRow = note
		? emailTextRow(`<strong>Poznámka k objednávce:</strong><br>${escapeEmailHtml(note).replaceAll("\n", "<br>")}`)
		: "";

	return renderCustomerEmail({
		title: `Objednávka ${params.orderId}`,
		introHtml: `Dobrý den,<br><br>děkujeme za objednávku. Níže je její souhrn.`,
		beforeButtonHtml: `${orderItemsHtml(params.items)}${emailTextRow(summary)}${noteRow}`,
		buttonLabel: "Zobrazit objednávku",
		buttonHref: params.orderUrl
	});
}
