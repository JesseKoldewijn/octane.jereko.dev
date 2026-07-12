import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton.tsrx';
import { EventItemMedia } from './event-item-media.tsrx';

const eventCardClass =
	'bg-card text-card-foreground flex min-h-[18rem] flex-col items-center justify-center rounded-lg border shadow-xs bg-neutral-100 dark:bg-neutral-900';

export function EventItem(props) @{
	const { title, event, isSkeleton } = props;
	const origin = typeof window === 'undefined' ? 'https://jereko.dev' : window.location.origin;
	const eventDate =
		event && event.year !== null && event.month !== null
			? ' - ' +
				new Date(parseInt(event.year), parseInt(event.month), 0).toLocaleDateString(
					'en-US',
					{ month: 'long', year: 'numeric' },
				)
			: null;

	@if (isSkeleton) {
		<div class={cn(eventCardClass, 'min-h-[18rem] !pb-8')}>
			<div class="my-3 mt-2 !mb-1 flex flex-col gap-6 !pt-3">
				<Skeleton class="bg-neutral-300 mx-auto my-auto h-4 w-4/6 dark:bg-neutral-700" />
				<Skeleton class="bg-neutral-300 relative mx-auto my-auto h-3 w-5/6 dark:bg-neutral-700" />
			</div>
			<div class="mt-4 !mb-2 flex flex-1 flex-col items-center p-6 pt-0 !pb-2">
				<Skeleton
					id="loading-skeleton"
					class="bg-neutral-300 absolute mx-auto my-auto h-full max-h-[182px] w-full max-w-[322px] dark:bg-neutral-700"
				/>
			</div>
		</div>
	} @else if (!event) {
		<div class="hidden" aria-hidden="true"></div>
	} @else if (title) {
		<div class={eventCardClass}>
			<h3 class="pt-4 text-2xl leading-none font-semibold tracking-tight" suppressHydrationWarning>{title}</h3>
			<p class="my-4 text-sm text-muted-foreground" suppressHydrationWarning>
				{`${event.name}${eventDate ?? ''}`}
			</p>
			<div class="flex flex-1 flex-col p-6 pt-0">
				<EventItemMedia event={event} origin={origin} />
			</div>
		</div>
	} @else {
		<div class={eventCardClass}>
			<h3 class="pt-4 text-2xl leading-none font-semibold tracking-tight" suppressHydrationWarning>{event.name}</h3>
			<div class="flex flex-1 flex-col p-6 pt-0">
				<EventItemMedia event={event} origin={origin} />
			</div>
		</div>
	}
}
