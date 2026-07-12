import { InfiniteMovingCardsTechUsed } from '@/components/animated/moving-cards-tech-used.tsrx';
import type { usedTechnologies } from '@/config/tech';

export function TechUsed(props: { techUsed: typeof usedTechnologies }) @{
	const { techUsed } = props;

	<div class="mx-4 mb-4 w-auto rounded-xl border bg-neutral-100 py-2 md:mx-4 md:mb-8 lg:mx-8 dark:bg-neutral-900">
		<section class="w-auto py-4 md:py-10 lg:py-12">
			<div class="container grid gap-4 px-4 text-center md:gap-5 md:px-6 lg:gap-10">
				<div class="space-y-3">
					<strong class="text-lg font-bold tracking-tighter sm:text-xl md:text-2xl">
						{'Tech used in my website'}
					</strong>
				</div>
				<div class="infinite-scroll-mask scroller w-full">
					<InfiniteMovingCardsTechUsed speed="normal" items={techUsed} />
				</div>
			</div>
		</section>
	</div>
}
