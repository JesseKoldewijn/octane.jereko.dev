/** Common Octane element props using `class` (not React `className`). */
export type SlotProps = {
	class?: string;
	ref?: unknown;
	children?: unknown;
};

/** Radix-style wrappers that use `className` and forward extra attributes. */
export type ClassNameSlotProps = {
	className?: string;
	ref?: unknown;
	children?: unknown;
	[key: string]: unknown;
};

export type ThemedImage = {
	src: string;
	width: number;
	height: number;
};

export type ThemedBannerImage = {
	dark: ThemedImage;
	light: ThemedImage;
};

export type HeroBannerContent = {
	title: string;
	description: string;
	ctas?: readonly { title: string; url: string }[];
};
