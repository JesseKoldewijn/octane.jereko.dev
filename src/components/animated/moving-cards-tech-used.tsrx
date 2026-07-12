import { useLayoutEffect, useRef } from 'octane';
import type { usedTechnologies } from '@/config/tech';
import { cn } from '@/lib/utils';

const MARQUEE_COPY_COUNT = 4;
const MARQUEE_PASSES = [0, 1, 2, 3];

const ICON_SLOT = 'h-[60px] md:h-[80px]';
const SQUARE_ICON = 'size-[60px] md:size-[80px]';
const PILL_ICON =
	'h-[60px] w-auto max-w-[120px] md:h-[80px] md:max-w-[160px] object-contain object-center';

type TechItem = (typeof usedTechnologies)[number];

function TechLogoLi(props) @{
	const { item } = props;
	const isTwLogo = item.name === 'Tailwind CSS';
	const lightLogo = isTwLogo;
	const isShadcn = item.name === 'Shadcn UI';
	const isAceternity = item.name === 'Aceternity UI';
	const isOctane = item.name === 'Octane';
	const isPillLogo = isOctane || isTwLogo;

	const iconSrc =
		typeof item.icon === 'string'
			? item.icon
			: (item.icon as { src?: string }).src;

	<li
		class={cn(
			{
				'rounded-lg bg-neutral-300': isShadcn,
				'rounded-lg bg-neutral-950 dark:bg-neutral-100':
					isAceternity || lightLogo,
				'overflow-hidden rounded-lg bg-neutral-950 px-3 md:px-4': isOctane,
			},
			'flex shrink-0 items-center',
			ICON_SLOT,
		)}
	>
		<img
			alt={`${item.name} Logo`}
			class={cn(
				isShadcn && 'bg-neutral-950 invert-0 dark:bg-neutral-100 dark:invert',
				isAceternity && 'invert-0 dark:invert',
				lightLogo && 'hue-rotate-180 invert dark:hue-rotate-0 dark:invert-0',
				'block shrink-0 rounded-lg object-contain object-center',
				isPillLogo ? PILL_ICON : SQUARE_ICON,
			)}
			src={iconSrc}
			width={isPillLogo ? 160 : 80}
			height={80}
			loading="eager"
			decoding="async"
		/>
	</li>
}

export function InfiniteMovingCardsTechUsed(props) @{
	const {
		items,
		direction = 'left',
		speed = 'fast',
		pauseOnHover = true,
		className,
	} = props;
	const listRef = useRef<HTMLUListElement>(null);
	const marqueeItems = MARQUEE_PASSES.flatMap((pass) =>
		items.map((item) => ({ key: `${item.name}-p${pass}`, item })),
	);

	useLayoutEffect(() => {
		const ul = listRef.current;
		if (!ul) return;

		const duration =
			speed === 'fast' ? '20s' : speed === 'normal' ? '40s' : '80s';
		ul.style.setProperty('--marquee-duration', duration);
		ul.style.setProperty(
			'--marquee-anim-direction',
			direction === 'left' ? 'normal' : 'reverse',
		);

		const syncShift = () => {
			const w = ul.scrollWidth;
			if (w <= 0) return;
			const shift = w / MARQUEE_COPY_COUNT;
			ul.style.setProperty('--tech-marquee-shift', `${shift}px`);
		};

		syncShift();

		const ro = new ResizeObserver(() => syncShift());
		ro.observe(ul);

		const imgs = ul.querySelectorAll('img');
		imgs.forEach((img) => img.addEventListener('load', syncShift));

		return () => {
			ro.disconnect();
			imgs.forEach((img) => img.removeEventListener('load', syncShift));
		};
	}, [direction, speed, items]);

	<div
		class={cn(
			'scroller relative z-20 max-w-7xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]',
			className,
		)}
	>
		<ul
			ref={listRef}
			class={cn(
				'tech-marquee-track flex w-max shrink-0 flex-nowrap items-center gap-4 py-4',
				pauseOnHover && 'hover:[animation-play-state:paused]',
			)}
		>
			@for (const row of marqueeItems; key row.key) {
				<TechLogoLi item={row.item} />
			}
		</ul>
	</div>
}
