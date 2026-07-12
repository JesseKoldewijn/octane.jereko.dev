import { useState } from 'octane';
import { LuPlay } from '@/icons/lu/Play';
import { cn } from '@/lib/utils';
import { Embed } from './_embed.tsrx';
import { getYoutubeVideoId } from './youtube-id';

const PLACEHOLDER_SRC = '/images/player-placeholder.webp';

export function YoutubePlayer(props: { url: string; origin: string; key?: string }) @{
	const { url, origin, key } = props;
	const [clicked, setClicked] = useState(false);

	const youtubeVideoID = getYoutubeVideoId(url);
	if (!youtubeVideoID) return null;

	const playerID = `youtube-player-[${youtubeVideoID}]${key !== undefined ? `-${key}` : ''}`;
	const srcUrl = `https://www.youtube.com/embed/${youtubeVideoID}?autoplay=1&mute=1&enablejsapi=0&controls=0&origin=${origin}`;
	const localThumbnailSrc = `/images/external/youtube/${youtubeVideoID}.jpg`;
	const remoteThumbnailSrc = `https://img.youtube.com/vi/${youtubeVideoID}/hqdefault.jpg`;

	<div key={playerID} class="mx-auto my-auto flex flex-1">
		<div
			class={cn(
				!clicked && 'relative',
				'xs:min-w-[350px] flex max-h-[182px] min-h-[182px] w-full max-w-[322px] min-w-[calc(100svw-6rem)] items-center',
			)}
		>
			@if (clicked) {
				<Embed
					playerID={playerID}
					youtubeVideoID={youtubeVideoID}
					srcUrl={srcUrl}
					class="mx-auto my-auto h-full max-h-[182px] w-full max-w-[322px]"
				/>
			} @else {
				<div class="relative mx-auto h-full w-full max-h-[182px] max-w-[322px]">
					<img
						class="mx-auto aspect-video h-full max-h-[182px] w-full max-w-[322px] object-cover"
						src={localThumbnailSrc}
						alt="video thumbnail"
						onError={(e) => {
							const el = e.currentTarget;
							const step = el.dataset.thumbStep ?? 'local';
							if (step === 'local') {
								el.dataset.thumbStep = 'remote';
								el.src = remoteThumbnailSrc;
								return;
							}
							el.src = PLACEHOLDER_SRC;
						}}
					/>
					<button
						onClick={() => setClicked(true)}
						class="absolute top-1/2 left-1/2 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 transform items-center justify-items-center rounded-full bg-[rgba(255,0,0,0.75)] align-middle hover:bg-[rgba(0,0,0,0.75)]"
					>
						<LuPlay class="mx-auto fill-white text-white" />
						<span class="sr-only">{'Click here to play video'}</span>
					</button>
				</div>
			}
		</div>
	</div>
}
