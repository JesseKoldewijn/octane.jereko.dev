import { fireEvent, render } from '@octanejs/testing-library';
import { describe, expect, it } from 'vitest';

import { MobileNavDialog } from '@/components/layout/navbar/mobile/MobileNavDialog.tsrx';
import { testIds } from '@/testids';
import { byTestId } from '@tests/setup/test-utils';

describe('MobileNavDialog', () => {
	it('renders primary mobile navigation links by test id', () => {
		render(MobileNavDialog, { props: { socials: null } });

		expect(byTestId(testIds.nav.mobileLink('home')).getAttribute('href')).toBe('/');
		expect(byTestId(testIds.nav.mobileLink('projects')).getAttribute('href')).toBe('/projects');
		expect(byTestId(testIds.nav.mobileLink('about-me')).getAttribute('href')).toBe('/about-me');
	});

	it('closes when clicking the dialog backdrop area', () => {
		render(MobileNavDialog, { props: { socials: null } });

		const dialog = byTestId(testIds.nav.mobileDialog) as HTMLDialogElement;
		dialog.showModal();
		expect(dialog.open).toBe(true);

		fireEvent.click(dialog);
		expect(dialog.open).toBe(false);
	});
});
