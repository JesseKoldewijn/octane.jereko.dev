import { cva } from 'class-variance-authority';
import { Popover } from '@octanejs/base-ui';
import { LuChevronDown } from '@/icons/lu/ChevronDown';
import { cn } from '@/lib/utils';
import type { ClassNameSlotProps } from '@/lib/tsrx-props';

export const navigationMenuTriggerStyle = cva(
	'group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50',
);

export function NavigationMenu(props: ClassNameSlotProps) @{
	const { className, ref, children, ...rest } = props;
	<nav
		ref={ref}
		className={cn(
			'relative z-50 flex max-w-max flex-1 items-center justify-center overflow-visible',
			className,
		)}
		{...rest}
	>
		{children}
	</nav>
}

export function NavigationMenuList(props: ClassNameSlotProps) @{
	const { className, ref, children, ...rest } = props;
	<ul
		ref={ref}
		className={cn(
			'group flex flex-1 list-none items-center justify-center space-x-1',
			className,
		)}
		{...rest}
	>
		{children}
	</ul>
}

export function NavigationMenuItem(props: ClassNameSlotProps) @{
	const { className, ref, children, ...rest } = props;
	<li ref={ref} className={cn('relative list-none', className)} {...rest}>
		<Popover.Root>{children}</Popover.Root>
	</li>
}

export function NavigationMenuTrigger(props: ClassNameSlotProps) @{
	const { className, ref, children, ...rest } = props;
	<Popover.Trigger
		ref={ref}
		className={cn(navigationMenuTriggerStyle(), 'group', className)}
		{...rest}
	>
		{children}{' '}
		<LuChevronDown
			className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180"
			{...{ 'aria-hidden': 'true' }}
		/>
	</Popover.Trigger>
}

export function NavigationMenuContent(props: ClassNameSlotProps) @{
	const { className, ref, children, ...rest } = props;
	<Popover.Portal>
		<Popover.Positioner side="bottom" align="start" sideOffset={6}>
			<Popover.Popup
				ref={ref}
				className={cn(
					'outline-none',
					'rounded-md border bg-popover text-popover-foreground shadow-lg',
					'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90',
					'w-full md:w-auto',
					className,
				)}
				{...rest}
			>
				{children}
			</Popover.Popup>
		</Popover.Positioner>
	</Popover.Portal>
}

export function NavigationMenuLink(
	props: ClassNameSlotProps & { href?: string; to?: string; onClick?: (event: MouseEvent) => void },
) @{
	const { className, ref, children, href, to, ...rest } = props;
	<a
		ref={ref}
		href={href ?? to}
		className={cn('block select-none rounded-sm px-3 py-2 text-sm leading-none', className)}
		{...rest}
	>
		{children}
	</a>
}

export function NavigationMenuViewport(props: ClassNameSlotProps) @{
	const { className, ref, ...rest } = props;
	<div
		ref={ref}
		className={cn(
			'origin-top-center relative mt-1.5 w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg md:w-auto',
			className,
		)}
		{...rest}
	/>
}

export function NavigationMenuIndicator(props: ClassNameSlotProps) @{
	const { className, ref, children, ...rest } = props;
	<div
		ref={ref}
		className={cn(
			'data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden',
			className,
		)}
		{...rest}
	>
		<div className="bg-border relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm shadow-md" />
		{children}
	</div>
}
