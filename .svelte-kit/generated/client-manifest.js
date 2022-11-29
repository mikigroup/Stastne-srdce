export { matchers } from './client-matchers.js';

export const components = [
	() => import("..\\..\\src\\routes\\__layout.svelte"),
	() => import("..\\..\\src\\routes\\__error.svelte"),
	() => import("..\\..\\src\\routes\\CartComponents\\Card.svelte"),
	() => import("..\\..\\src\\routes\\CartComponents\\CardWrapper.svelte"),
	() => import("..\\..\\src\\routes\\CartComponents\\Checkout.svelte"),
	() => import("..\\..\\src\\routes\\CartComponents\\CheckoutItem.svelte"),
	() => import("..\\..\\src\\routes\\CartComponents\\Modal.svelte"),
	() => import("..\\..\\src\\routes\\forgot.svelte"),
	() => import("..\\..\\src\\routes\\index.svelte"),
	() => import("..\\..\\src\\routes\\jidelnicek\\index.svelte"),
	() => import("..\\..\\src\\routes\\kontakt.svelte"),
	() => import("..\\..\\src\\routes\\kosik\\index.svelte"),
	() => import("..\\..\\src\\routes\\login.svelte"),
	() => import("..\\..\\src\\routes\\profile.svelte"),
	() => import("..\\..\\src\\routes\\reset.svelte"),
	() => import("..\\..\\src\\routes\\send.svelte"),
	() => import("..\\..\\src\\routes\\signup.svelte"),
	() => import("..\\..\\src\\routes\\thankyou.svelte")
];

export const dictionary = {
	"": [[0, 8], [1], 1],
	"forgot": [[0, 7], [1]],
	"jidelnicek": [[0, 9], [1], 1],
	"kontakt": [[0, 10], [1]],
	"kosik": [[0, 11], [1], 1],
	"login": [[0, 12], [1]],
	"profile": [[0, 13], [1]],
	"reset": [[0, 14], [1]],
	"send": [[0, 15], [1]],
	"signup": [[0, 16], [1]],
	"thankyou": [[0, 17], [1]],
	"CartComponents/Card": [[0, 2], [1]],
	"CartComponents/CardWrapper": [[0, 3], [1]],
	"CartComponents/Checkout": [[0, 4], [1]],
	"CartComponents/CheckoutItem": [[0, 5], [1]],
	"CartComponents/Modal": [[0, 6], [1]]
};