import { fireEvent, render } from '@octanejs/testing-library';
import { describe, expect, it } from 'vitest';

import { NavDropdown } from '@/components/layout/navbar/_parts/NavDropdown.tsrx';
import { byTestId } from '@tests/setup/test-utils';

const triggerTestId = 'nav-dropdown-test-trigger';
const panelTestId = 'nav-dropdown-test-panel';

describe('NavDropdown', () => {
	it('opens and closes the panel when the trigger is clicked', () => {
		render(NavDropdown, {
			props: {
				trigger: 'Sections',
				triggerTestId,
				panelTestId,
				children: 'Dropdown panel content',
			},
		});

		const trigger = byTestId(triggerTestId);
		const panel = byTestId(panelTestId);

		expect(trigger.getAttribute('aria-expanded')).toBe('false');
		expect(panel.className).toContain('hidden');

		fireEvent.click(trigger);
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
		expect(panel.className).toContain('block');

		fireEvent.click(trigger);
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
		expect(panel.className).toContain('hidden');
	});
});
