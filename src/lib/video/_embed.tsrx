import { useEffect } from 'octane';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton.tsrx';

export function Embed(props) @{
	const { playerID, youtubeVideoID, srcUrl, class: className, ...rest } = props;

	const startShowing = () => {
		const skeleton = document.getElementById(playerID + '-skeleton');
		if (skeleton) {
			skeleton.style.opacity = '0';
			skeleton.style.transition = 'opacity 1s ease-out';
		}
		const elem = document.getElementById(playerID);
		if (elem) {
			elem.style.opacity = '1';
			elem.style.transition = 'opacity 1s ease-in';
			elem.style.zIndex = '1';
		}
	};

	useEffect(() => {
		const timer = setTimeout(startShowing, 1000);
		return () => clearTimeout(timer);
	}, [playerID]);

	<div class={cn('relative flex flex-col', className)} {...rest}>
		<Skeleton
			id={playerID + '-skeleton'}
			class="bg-neutral-300 absolute mx-auto my-auto h-full max-h-[182px] w-full dark:bg-neutral-700"
		/>
		<div
			id={playerID}
			class="-z-50 mx-auto my-auto h-auto max-h-[182px] min-h-[182px] w-full"
			style={{ opacity: 0 }}
			data-elem-type="player-loader"
		>
			<embed
				key={youtubeVideoID}
				src={srcUrl}
				class="mx-auto my-auto h-full max-h-[182px] min-h-[182px] w-full"
				width={322}
				height={182}
			/>
		</div>
	</div>
}
