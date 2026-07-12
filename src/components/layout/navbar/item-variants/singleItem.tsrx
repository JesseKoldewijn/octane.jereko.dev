import { navigationMenuTriggerStyle } from '@/components/ui/navigation-menu.tsrx';
import { cn } from '@/lib/utils';

export function SingleItemSection(props: {
	children: unknown;
	class?: string;
	className?: string;
	[key: string]: unknown;
}) @{
	const { children, class: classProp, className, ...rest } = props;

	<li class="list-none">
		<a
			class={cn(
				navigationMenuTriggerStyle(),
				'text-foreground no-underline transition-none [&_svg]:transition-none',
				className,
				classProp,
			)}
			{...rest}
		>
			{children}
		</a>
	</li>
}
