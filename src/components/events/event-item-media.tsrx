import { YoutubePlayer } from '@/lib/video/player.tsrx';

export function EventItemMedia(props) @{
	const { event, origin } = props;

	@if ('url' in event && event.url && event.url_type === 'video') {
		<YoutubePlayer url={event.url} origin={origin} />
	} @else if ('url' in event && event.url) {
		<a
			href={event.url}
			target="_blank"
			rel="noopener noreferrer"
			class="text-muted-foreground my-auto flex h-full min-h-[182px] w-full max-w-[322px] items-center justify-center text-sm underline"
		>
			{'View link'}
		</a>
	} @else {
		<span class="text-muted-foreground my-auto flex h-full min-h-[182px] w-full max-w-[322px] items-center justify-center text-sm">
			{'No preview available'}
		</span>
	}
}
