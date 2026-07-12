import { cn } from '@/lib/utils';

export function Card(props) @{
	const { class: classProp, ref, children } = props;
	<div
		ref={ref}
		class={cn('bg-card text-card-foreground rounded-lg border shadow-xs', classProp)}
	>
		{children}
	</div>
}

export function CardHeader(props) @{
	const { class: classProp, ref, children } = props;
	<div ref={ref} class={cn('flex flex-col space-y-1.5 p-6', classProp)}>
		{children}
	</div>
}

export function CardTitle(props) @{
	const { class: classProp, ref, children } = props;
	<h3
		ref={ref}
		class={cn('text-2xl leading-none font-semibold tracking-tight', classProp)}
		suppressHydrationWarning
	>
		{children}
	</h3>
}

export function CardDescription(props) @{
	const { class: classProp, ref, children } = props;
	<p ref={ref} class={cn('text-muted-foreground text-sm', classProp)} suppressHydrationWarning>
		{children}
	</p>
}

export function CardContent(props) @{
	const { class: classProp, ref, children } = props;
	<div ref={ref} class={cn('p-6 pt-0', classProp)} suppressHydrationWarning>
		{children}
	</div>
}

export function CardFooter(props) @{
	const { class: classProp, ref, children } = props;
	<div ref={ref} class={cn('flex items-center p-6 pt-0', classProp)}>
		{children}
	</div>
}
