import { cubicOut } from "svelte/easing";
import { slide, type TransitionConfig } from "svelte/transition";

export function menuEnter(
	node: Element,
	{ delay = 0, duration = 0 }: { delay?: number; duration?: number } = {}
): TransitionConfig {
	if (!duration) return { duration: 0 };

	const style = getComputedStyle(node);
	const opacity = Number(style.opacity);
	const transform = style.transform === "none" ? "" : style.transform;

	return {
		delay,
		duration,
		easing: cubicOut,
		css: (t, u) =>
			`transform-origin: top center; opacity: ${opacity * t}; transform: ${transform} translateY(${u * 28}px) scale(${1 - u * 0.045});`
	};
}

export function menuSlide(
	node: Element,
	{ duration = 0 }: { duration?: number } = {}
): TransitionConfig {
	if (!duration) return { duration: 0 };
	return slide(node, { duration, easing: cubicOut });
}
