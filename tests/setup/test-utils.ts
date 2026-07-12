import { screen } from '@octanejs/testing-library';
import { vi } from 'vitest';

export function byTestId(testId: string) {
	return screen.getByTestId(testId);
}

export function queryByTestId(testId: string) {
	return screen.queryByTestId(testId);
}

/** Mock `Element.animate` so theme-toggle logic runs synchronously in tests. */
export function mockBodyAnimate() {
	const animate = vi.fn().mockImplementation(() => {
		const animation: { onfinish?: (() => void) | null } = {};

		Object.defineProperty(animation, 'onfinish', {
			configurable: true,
			set(callback: (() => void) | null) {
				callback?.();
			},
		});

		return animation as unknown as Animation;
	});

	document.body.animate = animate;

	return animate;
}
