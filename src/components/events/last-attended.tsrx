import { mostRecentEvent } from '@/data/queries';
import { EventItem } from './event-item.tsrx';

export function LastAttendedEvent() @{
	const latestEvent = mostRecentEvent();

	@if (latestEvent) {
		<div class="mx-auto mt-8 w-full max-w-md px-4 md:px-0">
			<section
				id="last-event"
				class="my-4 flex flex-col gap-4 text-center"
			>
				<EventItem title="Latest Attended Event" event={latestEvent} />
			</section>
		</div>
	} @else {
		<p class="text-muted-foreground py-4">{'Nothing here for now, sorry'}</p>
	}
}
