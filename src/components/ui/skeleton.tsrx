import { cn } from '@/lib/utils';
import type { ClassNameSlotProps } from '@/lib/tsrx-props';

export function Skeleton(props: ClassNameSlotProps) @{
	const { className, ...rest } = props;
	<div
		className={cn('bg-muted animate-pulse rounded-md', className)}
		{...rest}
	/>
}
