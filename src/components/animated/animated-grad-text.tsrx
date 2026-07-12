import { cn } from '@/lib/utils';
import { animatedGradient } from '@/utils/prog-classes';

type AnimatedGradientTextProps = {
	text: string;
	variant?: 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';
	className?: string;
	class?: string;
};

export function AnimatedGradientText(props: AnimatedGradientTextProps) @{
	const { text, variant = 'span', className, class: classProp } = props;
	const classes = cn(animatedGradient(), className ?? classProp);

	@if (variant === 'h1') {
		<h1 class={classes} suppressHydrationWarning>{text}</h1>
	} @else if (variant === 'h2') {
		<h2 class={classes} suppressHydrationWarning>{text}</h2>
	} @else if (variant === 'h3') {
		<h3 class={classes} suppressHydrationWarning>{text}</h3>
	} @else if (variant === 'h4') {
		<h4 class={classes} suppressHydrationWarning>{text}</h4>
	} @else if (variant === 'h5') {
		<h5 class={classes} suppressHydrationWarning>{text}</h5>
	} @else if (variant === 'h6') {
		<h6 class={classes} suppressHydrationWarning>{text}</h6>
	} @else if (variant === 'p') {
		<p class={classes} suppressHydrationWarning>{text}</p>
	} @else {
		<span class={classes} suppressHydrationWarning>{text}</span>
	}
}
