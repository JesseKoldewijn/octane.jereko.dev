import { render } from '@octanejs/testing-library';
import { describe, expect, it } from 'vitest';

import { NavLink } from '@/components/NavLink.tsrx';
import { testIds } from '@/testids';
import { byTestId } from '@tests/setup/test-utils';

describe('NavLink', () => {
	it('renders an anchor with the target href', () => {
		render(NavLink, {
			props: {
				to: '/projects',
				testId: testIds.nav.dropdown.pages.link('projects'),
				label: 'Projects',
			},
		});

		const link = byTestId(testIds.nav.dropdown.pages.link('projects'));
		expect(link.getAttribute('href')).toBe('/projects');
	});

	it('supports children instead of label', () => {
		render(NavLink, {
			props: {
				to: '/',
				testId: testIds.nav.logo,
				children: 'Go home',
			},
		});

		expect(byTestId(testIds.nav.logo).textContent).toBe('Go home');
	});

	it('forwards external link attributes', () => {
		render(NavLink, {
			props: {
				to: 'https://github.com/JesseKoldewijn',
				testId: testIds.nav.openSourceLink,
				label: 'GitHub',
				target: '_blank',
				rel: 'noopener noreferrer',
			},
		});

		const link = byTestId(testIds.nav.openSourceLink);
		expect(link.getAttribute('target')).toBe('_blank');
		expect(link.getAttribute('rel')).toBe('noopener noreferrer');
	});
});
