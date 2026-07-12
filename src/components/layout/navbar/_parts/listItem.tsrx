import { cn } from '@/lib/utils';

export function ListItem(props) @{
	const { class: classProp, className, title, children, ref, ...rest } = props;

	<li class="list-none">
		<a
			ref={ref}
			class={cn(
				'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block space-y-1 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none',
				className,
				classProp,
			)}
			{...rest}
		>
			<div class="text-sm leading-none font-medium">{title}</div>
			<p class="text-muted-foreground line-clamp-2 text-sm leading-snug">
				{children}
			</p>
		</a>
	</li>
}
