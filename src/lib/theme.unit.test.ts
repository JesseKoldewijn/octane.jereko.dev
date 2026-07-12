// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { toggleTheme } from './theme';
import { mockBodyAnimate } from '@tests/setup/test-utils';

describe('toggleTheme', () => {
	beforeEach(() => {
		document.documentElement.className = 'light';
		localStorage.clear();
		mockBodyAnimate();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('switches from light to dark', () => {
		toggleTheme();
		expect(document.documentElement.classList.contains('dark')).toBe(true);
		expect(localStorage.getItem('theme')).toBe('dark');
	});

	it('switches from dark to light', () => {
		document.documentElement.classList.replace('light', 'dark');
		toggleTheme();
		expect(document.documentElement.classList.contains('light')).toBe(true);
		expect(localStorage.getItem('theme')).toBe('light');
	});
});
