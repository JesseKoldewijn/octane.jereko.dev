import { useEffect, useState } from 'octane';
import { cn } from '@/lib/utils';

const getDOMTheme = () =>
	typeof document !== 'undefined' &&
	document.documentElement.classList.contains('dark')
		? 'dark'
		: 'light';

export function HeroSectionImage(props) @{
	const { bannerImage, bannerFallbackImage, bannerID } = props;
	const [isError, setIsError] = useState(false);
	const [domTheme, setDomTheme] = useState(() =>
		typeof document !== 'undefined' ? getDOMTheme() : 'dark',
	);
	const [currentBannerImage, setCurrentBannerImage] = useState(bannerImage.dark);
	const [currentFallbackBannerImage, setCurrentFallbackBannerImage] = useState(
		bannerFallbackImage?.dark,
	);

	useEffect(() => {
		let debounce;

		const observer = new MutationObserver(() => {
			clearTimeout(debounce);
			debounce = setTimeout(() => setDomTheme(getDOMTheme()), 0);
		});

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class'],
		});

		return () => {
			observer.disconnect();
			clearTimeout(debounce);
		};
	}, []);

	useEffect(() => {
		setCurrentBannerImage(
			domTheme === 'dark' ? bannerImage.dark : bannerImage.light,
		);

		if (bannerFallbackImage) {
			setCurrentFallbackBannerImage(
				domTheme === 'dark'
					? bannerFallbackImage.dark
					: bannerFallbackImage.light,
			);
		}
	}, [domTheme, bannerImage, bannerFallbackImage]);

	const isFallback = isError && !!currentFallbackBannerImage;
	const imageSrc = isFallback
		? currentFallbackBannerImage.src
		: currentBannerImage.src;

	<div
		class={cn(
			'relative my-auto mr-auto ml-auto h-auto w-auto max-h-75 scale-[calc(100%+2%)] rounded-full bg-neutral-100 lg:mr-0 lg:max-h-125 dark:bg-neutral-900',
		)}
	>
		<img
			id={bannerID}
			src={imageSrc}
			width={
				isFallback
					? currentFallbackBannerImage.width
					: currentBannerImage.width
			}
			height={
				isFallback
					? currentFallbackBannerImage.height
					: currentBannerImage.height
			}
			class={cn(
				'-mt-5 block max-h-75 w-auto rounded-t-none rounded-b-full object-fill',
			)}
			alt="hero"
			onError={() => setIsError(true)}
			loading="eager"
		/>
	</div>
}
