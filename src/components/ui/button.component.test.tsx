import { fireEvent, render } from '@octanejs/testing-library';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './button';
import { byTestId } from '@tests/setup/test-utils';

const buttonTestId = 'demo-button';

describe('Button', () => {
	it('renders children and handles clicks', () => {
		const onClick = vi.fn();

		render(Button, {
			props: {
				'data-testid': buttonTestId,
				children: 'Click me',
				onClick,
			},
		});

		fireEvent.click(byTestId(buttonTestId));

		expect(onClick).toHaveBeenCalledOnce();
	});

	it('applies variant classes', () => {
		render(Button, {
			props: {
				'data-testid': buttonTestId,
				variant: 'outline',
				children: 'Outline',
			},
		});

		expect(byTestId(buttonTestId).className).toContain('border');
	});
});
