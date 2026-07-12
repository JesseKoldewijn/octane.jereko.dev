import { AnimatedGradientText } from '@/components/animated/animated-grad-text.tsrx';
import { TextGen } from '@/components/animated/text-gen-lazy.tsrx';
import { cn } from '@/lib/utils';
import type { HeroBannerContent, ThemedBannerImage } from '@/lib/tsrx-props';
import { HeroSectionButtons } from './_HeroSectionButtons.tsrx';
import { HeroSectionImage } from './_HeroSectionImage.tsrx';

export function HeroSection(props: {
	bannerImage: ThemedBannerImage;
	bannerFallbackImage?: ThemedBannerImage;
	bannerContent: HeroBannerContent;
	className?: string;
}) @{
	const { bannerImage, bannerFallbackImage, bannerContent, className } = props;
	const bannerID =
		'banner-image' + String(bannerContent.title).replace(' ', '-');

	<section class={cn(className, 'mx-4 h-full min-h-[495px] md:mx-8')}>
		<div class="mx-auto grid max-w-screen-xl px-4 py-8 lg:grid-cols-12 lg:gap-8 lg:pt-16 xl:gap-0">
			<div class="mx-auto place-self-center text-center lg:col-span-7 lg:ml-0 lg:text-left">
				<AnimatedGradientText
					text={bannerContent.title}
					variant="h1"
					className={cn(
						'max-w-2xl text-4xl leading-none font-extrabold tracking-tight md:text-5xl xl:text-6xl',
					)}
				/>

				<div class="flex min-h-20">
					<TextGen
						words={bannerContent.description}
						className="max-w-2xl font-light text-neutral-500 md:text-lg lg:text-xl dark:text-neutral-200"
					/>
				</div>

				<HeroSectionButtons bannerContent={bannerContent} />
			</div>
			<div class="order-first mb-8 flex max-h-[300px] min-h-[300px] transition-opacity md:mb-16 md:max-h-[500px] lg:order-last lg:col-span-5 lg:mt-0 lg:mb-0">
				<HeroSectionImage
					bannerImage={bannerImage}
					bannerFallbackImage={bannerFallbackImage}
					bannerID={bannerID}
				/>
			</div>
		</div>
	</section>
}
