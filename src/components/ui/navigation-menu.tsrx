import { cva } from 'class-variance-authority';
import { NavigationMenu as NavigationMenuPrimitive } from '@octanejs/radix';
import { LuChevronDown } from '@/icons/lu/ChevronDown';
import { cn } from '@/lib/utils';
import type { ClassNameSlotProps } from '@/lib/tsrx-props';

export const navigationMenuTriggerStyle = cva(
	'group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50',
);

export function NavigationMenu(props: ClassNameSlotProps) @{
	const { className, ref, children, ...rest } = props;
	<NavigationMenuPrimitive.Root
		ref={ref}
		className={cn(
			'relative z-50 flex max-w-max flex-1 items-center justify-center overflow-visible',
			className,
		)}
		{...rest}
	>
		{children}
	</NavigationMenuPrimitive.Root>
}

export function NavigationMenuList(props: ClassNameSlotProps) @{
	const { className, ref, children, ...rest } = props;
	<NavigationMenuPrimitive.List
		ref={ref}
		className={cn(
			'group flex flex-1 list-none items-center justify-center space-x-1',
			className,
		)}
		{...rest}
	>
		{children}
	</NavigationMenuPrimitive.List>
}

export const NavigationMenuItem = NavigationMenuPrimitive.Item;

export function NavigationMenuTrigger(props: ClassNameSlotProps) @{
	const { className, ref, children, ...rest } = props;
	<NavigationMenuPrimitive.Trigger
		ref={ref}
		className={cn(navigationMenuTriggerStyle(), 'group', className)}
		{...rest}
	>
		{children}{' '}
		<LuChevronDown
			className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180"
			{...{ 'aria-hidden': 'true' }}
		/>
	</NavigationMenuPrimitive.Trigger>
}

export function NavigationMenuContent(props: ClassNameSlotProps) @{
	const { className, ref, children, ...rest } = props;
	<NavigationMenuPrimitive.Content
		ref={ref}
		className={cn(
			'data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 top-full left-0 z-50 w-full md:absolute md:w-auto',
			className,
		)}
		{...rest}
	>
		{children}
	</NavigationMenuPrimitive.Content>
}

export const NavigationMenuLink = NavigationMenuPrimitive.Link;

export function NavigationMenuViewport(props: ClassNameSlotProps) @{
	const { className, ref, ...rest } = props;
	<div className={cn('absolute top-full left-0 flex justify-center')}>
		<NavigationMenuPrimitive.Viewport
			className={cn(
				'origin-top-center bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border shadow-lg md:w-[var(--radix-navigation-menu-viewport-width)]',
				className,
			)}
			ref={ref}
			{...rest}
		/>
	</div>
}

export function NavigationMenuIndicator(props: ClassNameSlotProps) @{
	const { className, ref, children, ...rest } = props;
	<NavigationMenuPrimitive.Indicator
		ref={ref}
		className={cn(
			'data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden',
			className,
		)}
		{...rest}
	>
		<div className="bg-border relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm shadow-md" />
	</NavigationMenuPrimitive.Indicator>
}
