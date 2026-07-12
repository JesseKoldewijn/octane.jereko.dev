import type { ReactElement, ReactNode } from 'react';
import type { CommonSvgAttributes } from './common';

type LucideIcon = (props: CommonSvgAttributes) => ReactElement;

export const buildLucideIcon = (name: string, svgContent: ReactNode) => {
	const component = (props: CommonSvgAttributes) => {
		const defaults = {
			width: '24',
			height: '24',
			viewBox: '0 0 24 24',
			fill: 'none',
			stroke: 'currentColor',
			strokeWidth: '2',
			strokeLinecap: 'round',
			strokeLinejoin: 'round',
		} as const;

		const merged = { ...defaults, ...props };

		return <svg {...merged}>{svgContent}</svg>;
	};

	return component as LucideIcon;
};
