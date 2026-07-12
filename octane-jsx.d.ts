import 'react';

// Octane uses `class` (not React's `className`) on DOM elements.
declare module 'react' {
	interface HTMLAttributes<T> {
		class?: string;
	}

	interface SVGAttributes<T> {
		class?: string;
	}
}

// Fallback for JSX checked against the global namespace (e.g. jsx: "preserve" without react-jsx).
declare global {
	namespace JSX {
		interface IntrinsicElements {
			[tag: string]: {
				class?: string;
				ref?: unknown;
				children?: unknown;
				suppressHydrationWarning?: boolean;
				[key: string]: unknown;
			};
		}
	}
}

export {};
