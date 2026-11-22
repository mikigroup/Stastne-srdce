const FONT = "Arial,Helvetica,sans-serif";

export function escapeEmailHtml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;");
}

export function emailTextRow(html: string, padding = "16px 32px 0"): string {
	return `<tr>
		<td style="padding:${padding};font-family:${FONT};font-size:16px;line-height:1.5;color:#334155;">${html}</td>
	</tr>`;
}

export function emailNoticeRow(html: string): string {
	return `<tr>
		<td style="padding:20px 32px 0;">
			<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fef3c7;border:1px solid #f59e0b;">
				<tr>
					<td style="padding:16px;font-family:${FONT};font-size:15px;line-height:1.5;color:#334155;">${html}</td>
				</tr>
			</table>
		</td>
	</tr>`;
}

export function renderCustomerEmail(options: {
	title: string;
	introHtml: string;
	beforeButtonHtml?: string;
	buttonLabel: string;
	buttonHref: string;
	afterButtonHtml?: string;
}): string {
	const title = escapeEmailHtml(options.title);
	const href = escapeEmailHtml(options.buttonHref);
	const label = escapeEmailHtml(options.buttonLabel);

	return `<!DOCTYPE html>
<html lang="cs">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f4;">
	<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f4;">
		<tr>
			<td align="center" style="padding:24px 12px;">
				<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#ffffff;border:1px solid #e7e5e4;">
					<tr>
						<td style="padding:28px 32px 0;font-family:${FONT};font-size:20px;font-weight:bold;color:#166534;">Šťastné srdce</td>
					</tr>
					<tr>
						<td style="padding:16px 32px 0;font-family:${FONT};font-size:22px;line-height:1.3;font-weight:bold;color:#1c1917;">${title}</td>
					</tr>
					${emailTextRow(options.introHtml)}
					${options.beforeButtonHtml ?? ""}
					<tr>
						<td style="padding:24px 32px 0;">
							<table role="presentation" cellpadding="0" cellspacing="0">
								<tr>
									<td style="background:#166534;border-radius:6px;">
										<a href="${href}" style="display:inline-block;padding:14px 24px;font-family:${FONT};font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none;">${label}</a>
									</td>
								</tr>
							</table>
						</td>
					</tr>
					<tr>
						<td style="padding:16px 32px 0;font-family:${FONT};font-size:13px;line-height:1.5;color:#78716c;">
							Když tlačítko nefunguje, zkopírujte odkaz do prohlížeče:<br>
							<a href="${href}" style="color:#166534;word-break:break-all;">${href}</a>
						</td>
					</tr>
					${options.afterButtonHtml ?? ""}
					<tr>
						<td style="padding:28px 32px;border-top:1px solid #e7e5e4;font-family:${FONT};font-size:13px;line-height:1.5;color:#78716c;">
							info@stastnesrdce.cz<br>
							<a href="https://www.stastnesrdce.cz" style="color:#78716c;text-decoration:none;">www.stastnesrdce.cz</a><br>
							Tento e-mail byl odeslán automaticky.
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>`;
}
