import { cn } from '@/lib/utils';

export function Skeleton(props) @{
	const { className, ...rest } = props;
	<div
		className={cn('bg-muted animate-pulse rounded-md', className)}
		{...rest}
	/>
}
