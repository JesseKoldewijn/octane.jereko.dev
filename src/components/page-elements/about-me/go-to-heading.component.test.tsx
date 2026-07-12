import { fireEvent, render } from '@octanejs/testing-library';
import { describe, expect, it, vi } from 'vitest';

import { GoToHeading } from '@/components/page-elements/about-me/go-to-heading.tsrx';
import { testIds } from '@/testids';
import { byTestId } from '@tests/setup/test-utils';

describe('GoToHeading', () => {
	it('scrolls to the about-me navigation section when clicked', () => {
		const scrollTo = vi.fn();
		vi.stubGlobal('scrollTo', scrollTo);

		const navigation = document.createElement('div');
		navigation.id = testIds.aboutMe.navigation;
		Object.defineProperty(navigation, 'offsetTop', { value: 500 });
		document.body.append(navigation);

		render(GoToHeading, { props: { children: 'Jump to nav' } });
		fireEvent.click(byTestId(testIds.aboutMe.goToHeadingButton));

		expect(scrollTo).toHaveBeenCalledWith({ top: 250, behavior: 'smooth' });

		navigation.remove();
		vi.unstubAllGlobals();
	});
});
