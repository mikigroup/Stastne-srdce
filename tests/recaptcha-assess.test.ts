import assert from "node:assert/strict";
import { describe, it } from "node:test";
// @ts-expect-error Node test runner vyžaduje příponu .ts, SvelteKit ji v typechecku zakazuje.
import { assessRecaptchaVerification } from "../src/lib/recaptcha/assess.ts";

const valid = {
	secret: "secret",
	token: "token",
	httpOk: true,
	scoreThreshold: 0.5,
	expectedAction: "signup",
	expectedHostnames: ["localhost"],
	payload: {
		success: true,
		score: 0.9,
		action: "signup",
		hostname: "localhost"
	}
};

describe("assessRecaptchaVerification", () => {
	it("přijme platné skóre, akci a hostname", () => {
		const result = assessRecaptchaVerification(valid);
		assert.equal(result.success, true);
		assert.equal(result.score, 0.9);
	});

	it("zamítne skóre pod prahem", () => {
		const result = assessRecaptchaVerification({
			...valid,
			payload: { ...valid.payload, score: 0.4 }
		});
		assert.equal(result.success, false);
		assert.equal(result.score, 0.4);
	});

	it("zamítne jinou akci", () => {
		const result = assessRecaptchaVerification({
			...valid,
			payload: { ...valid.payload, action: "contact_form" }
		});
		assert.equal(result.success, false);
	});

	it("zamítne cizí hostname a přijme hostitele s portem", () => {
		const foreign = assessRecaptchaVerification({
			...valid,
			payload: { ...valid.payload, hostname: "evil.example" }
		});
		assert.equal(foreign.success, false);

		const withPort = assessRecaptchaVerification({
			...valid,
			expectedHostnames: ["localhost:5173"],
			payload: { ...valid.payload, hostname: "localhost" }
		});
		assert.equal(withPort.success, true);
	});

	it("zamítne chybějící secret", () => {
		const result = assessRecaptchaVerification({ ...valid, secret: "" });
		assert.equal(result.success, false);
		assert.match(result.error ?? "", /nakonfigurováno/);
	});

	it("zamítne Over free quota i při success true a skóre 0.9", () => {
		const result = assessRecaptchaVerification({
			...valid,
			payload: {
				...valid.payload,
				success: true,
				score: 0.9,
				"error-codes": ["Over free quota."]
			}
		});
		assert.equal(result.success, false);
		assert.match(result.error ?? "", /kvóta/);
	});
});
