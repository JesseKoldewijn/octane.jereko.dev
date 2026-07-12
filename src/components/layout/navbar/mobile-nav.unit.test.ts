// @vitest-environment happy-dom

import { fireEvent } from '@octanejs/testing-library';
import { describe, expect, it } from 'vitest';

import { setupMobileDialog, setupMobileToggleButton } from '@/components/layout/navbar/mobile-nav';

describe('mobile navigation helpers', () => {
	it('binds toggle behavior once per button', () => {
		const dialog = document.createElement('dialog');
		document.body.append(dialog);

		const button = document.createElement('button');
		document.body.append(button);

		setupMobileDialog(dialog);
		expect(setupMobileDialog(dialog)).toBe(false);

		setupMobileToggleButton(button, () => dialog);
		expect(setupMobileToggleButton(button, () => dialog)).toBe(false);

		fireEvent.click(button);
		expect(dialog.open).toBe(true);

		dialog.remove();
		button.remove();
	});
});
