import { fireEvent, render } from '@octanejs/testing-library';
import { describe, expect, it } from 'vitest';

import { MobileNavDialog } from '@/components/layout/navbar/mobile/MobileNavDialog.tsrx';
import { Navbar } from '@/components/layout/navbar/Navbar.tsrx';
import { testIds } from '@/testids';
import { byTestId } from '@tests/setup/test-utils';

describe('Navbar mobile menu', () => {
	it('opens and closes the mobile navigation dialog', () => {
		render(Navbar);
		render(MobileNavDialog, { props: { socials: null } });

		const dialog = byTestId(testIds.nav.mobileDialog) as HTMLDialogElement;
		expect(dialog.open).toBe(false);

		fireEvent.click(byTestId(testIds.nav.mobileMenuToggle));
		expect(dialog.open).toBe(true);

		fireEvent.click(byTestId(testIds.nav.mobileMenuToggle));
		expect(dialog.open).toBe(false);
	});
});

describe('Navbar desktop menu', () => {
	it('reveals pages dropdown links when the trigger is clicked', () => {
		render(Navbar);

		const panel = byTestId(testIds.nav.dropdown.pages.panel);
		expect(panel.className).toContain('hidden');

		fireEvent.click(byTestId(testIds.nav.dropdown.pages.trigger));
		expect(panel.className).toContain('block');
		expect(byTestId(testIds.nav.dropdown.pages.link('projects')).getAttribute('href')).toBe(
			'/projects',
		);
	});
});
