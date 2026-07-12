import { useRef, useState } from 'octane';
import { LuChevronDown } from '@/icons/lu/ChevronDown';
import { cn } from '@/lib/utils';
import { navigationMenuTriggerStyle } from '@/components/ui/navigation-menu.tsrx';

const HOVER_OPEN_DELAY_MS = 200;

export function NavDropdown(props) @{
	const {
		trigger,
		children,
		class: classProp,
		className,
		panelClassName,
		triggerTestId,
		panelTestId,
	} = props;
	const [open, setOpen] = useState(false);
	const closeTimerRef = useRef(null);
	const openTimerRef = useRef(null);

	const clearCloseTimer = () => {
		if (closeTimerRef.current != null) {
			clearTimeout(closeTimerRef.current);
			closeTimerRef.current = null;
		}
	};

	const clearOpenTimer = () => {
		if (openTimerRef.current != null) {
			clearTimeout(openTimerRef.current);
			openTimerRef.current = null;
		}
	};

	const scheduleClose = () => {
		clearCloseTimer();
		closeTimerRef.current = setTimeout(() => setOpen(false), 150);
	};

	const scheduleOpen = () => {
		clearOpenTimer();
		clearCloseTimer();
		openTimerRef.current = setTimeout(() => setOpen(true), HOVER_OPEN_DELAY_MS);
	};

	return (
		<li class={cn('relative list-none', className, classProp)}>
			<div
				class="relative"
				onPointerEnter={scheduleOpen}
				onPointerLeave={() => {
					clearOpenTimer();
					scheduleClose();
				}}
			>
				<button
					type="button"
					data-testid={triggerTestId}
					class={cn(navigationMenuTriggerStyle(), 'group')}
					aria-expanded={open}
					onClick={() => {
						clearOpenTimer();
						clearCloseTimer();
						setOpen((value) => !value);
					}}
				>
					{trigger}
					<LuChevronDown
						class={cn(
							'relative top-[1px] ml-1 h-3 w-3 transition duration-200',
							open && 'rotate-180',
						)}
						aria-hidden="true"
					/>
				</button>
				<div
					data-testid={panelTestId}
					class={cn(
						'absolute top-full left-0 z-50 mt-1.5 rounded-md border bg-popover text-popover-foreground shadow-lg',
						open ? 'block' : 'hidden',
						panelClassName,
					)}
				>
					{children}
				</div>
			</div>
		</li>
	);
}
