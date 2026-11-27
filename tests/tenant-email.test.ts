import assert from "node:assert/strict";
import { describe, it } from "node:test";
// @ts-expect-error Node test runner vyžaduje příponu .ts, SvelteKit ji v typechecku zakazuje.
import {
	LEGACY_FROM,
	LEGACY_HOST,
	decideSmtp,
	readTemplateField,
	readThroughCache,
	renderEmailSubject,
	renderEmailTemplate,
	selectTemplateHtml,
	smtpLogFields
} from "../src/lib/email/customerEmailCore.ts";

const fallbackHtml = "<p>dnesni-html token-zustava</p>";

describe("decideSmtp", () => {
	it("vypnuté SMTP vrací Seznam a odesílatele info@stastnesrdce.cz", () => {
		const decision = decideSmtp(
			{
				smtpEnabled: false,
				smtpHost: "smtp.example.cz",
				smtpUsername: "user@example.cz",
				smtpPassword: "tajne"
			},
			"legacy-secret"
		);
		assert.equal(decision.source, "legacy");
		assert.equal(decision.host, LEGACY_HOST);
		assert.equal(decision.from, LEGACY_FROM);
		assert.equal(decision.from.includes("info@stastnesrdce.cz"), true);
	});

	it("chybějící heslo vrací Seznam", () => {
		const decision = decideSmtp(
			{
				smtpEnabled: true,
				smtpHost: "smtp.example.cz",
				smtpUsername: "user@example.cz",
				smtpPassword: "  "
			},
			"legacy-secret"
		);
		assert.equal(decision.source, "legacy");
	});

	it("zapnuté a vyplněné SMTP vrací host, port a secure z nastavení", () => {
		const decision = decideSmtp(
			{
				smtpEnabled: true,
				smtpHost: " smtp.example.cz ",
				smtpPort: 465,
				smtpUsername: "user@example.cz",
				smtpPassword: "tajne-heslo",
				smtpFromEmail: "obchod@example.cz",
				smtpFromName: "Obchod"
			},
			"legacy-secret"
		);
		assert.equal(decision.source, "tenant");
		assert.equal(decision.host, "smtp.example.cz");
		assert.equal(decision.port, 465);
		assert.equal(decision.secure, true);
		assert.equal(decision.from, '"Obchod" <obchod@example.cz>');

		const starttls = decideSmtp(
			{
				smtpEnabled: true,
				smtpHost: "smtp.example.cz",
				smtpPort: 587,
				smtpUsername: "user@example.cz",
				smtpPassword: "tajne-heslo"
			},
			"legacy-secret"
		);
		assert.equal(starttls.port, 587);
		assert.equal(starttls.secure, false);
	});

	it("objekt k logu heslo neobsahuje", () => {
		const decision = decideSmtp(
			{
				smtpEnabled: true,
				smtpHost: "smtp.example.cz",
				smtpUsername: "user@example.cz",
				smtpPassword: "tajne-heslo"
			},
			"legacy-secret"
		);
		const log = smtpLogFields(decision);
		assert.equal("password" in log, false);
		assert.equal(JSON.stringify(log).includes("tajne-heslo"), false);
		assert.equal(JSON.stringify(log).includes("legacy-secret"), false);
	});
});

describe("šablony ze site settings", () => {
	it("šablona s confirmationLink se použije a odkaz v ní zůstane", () => {
		const picked = selectTemplateHtml(
			'<a href="{{confirmationLink}}">Potvrdit</a>',
			["confirmationLink"],
			fallbackHtml
		);
		assert.equal(picked.source, "settings");
		const rendered = renderEmailTemplate(picked.html, {
			confirmationLink: "https://web.cz/auth/callback?token_hash=abc&type=signup"
		});
		assert.equal(rendered.includes("token_hash=abc"), true);
		assert.equal(rendered.includes("type=signup"), true);
	});

	it("šablona registrace bez confirmationLink se zahodí", () => {
		const picked = selectTemplateHtml("<p>Jen vzhled, bez odkazu</p>", ["confirmationLink"], fallbackHtml);
		assert.equal(picked.source, "fallback");
		assert.equal(picked.html, fallbackHtml);
		assert.equal(picked.html.includes("token-zustava"), true);
	});

	it("nahradí orderNumber, schová prázdnou poznámku a escapuje text", () => {
		const html = renderEmailTemplate(
			"Objednávka {{orderNumber}} {{#if orderNote}}Poznámka {{orderNote}}{{/if}} {{orderItems}}",
			{
				orderNumber: 12,
				orderNote: "a < b",
				orderItems: "<b>polévka</b>"
			}
		);
		assert.equal(html.includes("12"), true);
		assert.equal(html.includes("a &lt; b"), true);
		assert.equal(html.includes("<b>polévka</b>"), true);

		const withoutNote = renderEmailTemplate("X{{#if orderNote}}Y{{/if}}Z", { orderNote: "  " });
		assert.equal(withoutNote, "XZ");
	});

	it("předmět nahradí proměnnou a odstraní zalomení řádku", () => {
		const subject = renderEmailSubject("{{shopName}} — objednávka {{orderNumber}}\n", {
			shopName: "Šťastné srdce",
			orderNumber: 12,
			orderNote: "a < b"
		});
		assert.equal(subject, "Šťastné srdce — objednávka 12");
		const withNote = renderEmailSubject("Poznámka {{orderNote}}", { orderNote: "a < b\nřádek" });
		assert.equal(withNote, "Poznámka a < b řádek");
	});

	it("prázdné pole vrací záložní HTML a starý název šablony se přečte", () => {
		const empty = selectTemplateHtml("  ", [], fallbackHtml);
		assert.equal(empty.source, "fallback");
		assert.equal(
			readTemplateField({ orderConfirmationTemplate: "<p>{{orderNumber}}</p>" }, "orderConfirmEmailTemplate"),
			"<p>{{orderNumber}}</p>"
		);
	});
});

describe("cache nastavení", () => {
	it("druhý dotaz v minutě znovu nevolá načtení", async () => {
		let calls = 0;
		const load = async () => {
			calls += 1;
			return { ok: true };
		};
		const first = await readThroughCache({ now: 0, cached: null, load, ttlMs: 60_000 });
		const second = await readThroughCache({ now: 1_000, cached: first.cached, load, ttlMs: 60_000 });
		assert.equal(calls, 1);
		assert.equal(second.fromCache, true);
		assert.deepEqual(second.value, { ok: true });
	});

	it("výjimka z načtení bez cache nevrátí nastavení", async () => {
		const result = await readThroughCache({
			now: 0,
			cached: null,
			load: async () => {
				throw new Error("db");
			}
		});
		assert.equal(result.failed, true);
		assert.equal(result.value, null);
	});

	it("výjimka při platné cache vrátí poslední nastavení", async () => {
		const result = await readThroughCache({
			now: 120_000,
			cached: { expires: 1_000, value: { email: "ulozene" } },
			load: async () => {
				throw new Error("db");
			},
			ttlMs: 60_000
		});
		assert.equal(result.failed, false);
		assert.deepEqual(result.value, { email: "ulozene" });
	});
});
