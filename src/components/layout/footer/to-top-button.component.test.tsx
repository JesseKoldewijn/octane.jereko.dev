import { fireEvent, render } from '@octanejs/testing-library';
import { describe, expect, it, vi } from 'vitest';

import { ToTopButton } from '@/components/layout/footer/to-top-button.tsrx';
import { testIds } from '@/testids';
import { byTestId } from '@tests/setup/test-utils';

describe('ToTopButton', () => {
	it('scrolls to the top of the page when clicked', () => {
		const scrollTo = vi.fn();
		vi.stubGlobal('scrollTo', scrollTo);

		render(ToTopButton);
		fireEvent.click(byTestId(testIds.footer.toTopButton));

		expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });

		vi.unstubAllGlobals();
	});
});
