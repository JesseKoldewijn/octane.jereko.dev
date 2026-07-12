import { fireEvent, render } from '@octanejs/testing-library';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeToggle } from '@/components/ui/ThemeToggle.tsrx';
import { testIds } from '@/testids';
import { byTestId, mockBodyAnimate } from '@tests/setup/test-utils';

describe('ThemeToggle', () => {
	beforeEach(() => {
		document.documentElement.className = 'light';
		localStorage.clear();
		mockBodyAnimate();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('toggles the document theme when clicked', () => {
		render(ThemeToggle);

		fireEvent.click(byTestId(testIds.theme.toggle));

		expect(document.documentElement.classList.contains('dark')).toBe(true);
		expect(localStorage.getItem('theme')).toBe('dark');
	});
});
