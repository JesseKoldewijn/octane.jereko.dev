import { describe, expect, it } from 'vitest';

import { hrefToTestIdSlug, testIds } from './testids';

describe('hrefToTestIdSlug', () => {
	it('maps root to home', () => {
		expect(hrefToTestIdSlug('/')).toBe('home');
	});

	it('maps nested paths to kebab slugs', () => {
		expect(hrefToTestIdSlug('/about-me/hobbies')).toBe('about-me-hobbies');
	});

	it('builds stable nav link test ids', () => {
		expect(testIds.nav.mobileLink(hrefToTestIdSlug('/projects'))).toBe(
			'navbar-mobile-link-projects',
		);
	});
});
