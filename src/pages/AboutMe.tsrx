import { NavLink } from '@/components/NavLink.tsrx';
import { AboutMeHeader } from '@/components/page-elements/about-me/AboutMeHeader.tsrx';
import { AnimatedGradientText } from '@/components/animated/animated-grad-text.tsrx';
import { GoToHeading } from '@/components/page-elements/about-me/go-to-heading.tsrx';
import { themedAvatar } from '@/config/images';

export function AboutMe() @{
	<div>
		<AboutMeHeader
			pathname="/about-me"
			bannerImage={themedAvatar}
			title="About Me"
			description="Who am I? And what do I do?"
		/>
		<div class="mx-4 flex flex-col items-center justify-center gap-8 lg:mx-2 lg:flex-row">
			<section
				id="about-me-overview"
				class="flex w-auto max-w-md flex-col gap-4 text-center"
			>
				<h2 class="text-center text-2xl font-bold">{'So... who am I?'}</h2>
				<div class="flex flex-col gap-4">
					<p>
						{'To start off, my background and interests has been mainly in/towards '}
						<AnimatedGradientText class="ml-1 font-semibold" variant="span" text="IT" noSplit />
						{', '}
						<AnimatedGradientText class="mx-1 font-semibold" variant="span" text="Tech (in general)" noSplit />
						{' and '}
						<AnimatedGradientText class="mx-1 font-semibold" variant="span" text="Gaming" noSplit />
						{" for as long as I can remember. Which since you're checking out my website, might not surprise you."}
					</p>
					<p>
						{'One of the earliest tech-related memories I can remember is that when I was around the age of '}
						<AnimatedGradientText class="ml-1 font-semibold" variant="span" text="12" noSplit />
						{', I completely disassembled the '}
						<AnimatedGradientText class="mx-1 font-semibold" variant="span" text="PC" noSplit />
						{' I got as a hand-me-down from my dad. I did it just to see how it was assembled and put together, out of interest in what all the parts looked like.'}
					</p>
				</div>
			</section>
			<section
				id="about-me-overview-2"
				class="xs:mb-auto flex w-auto max-w-md flex-col gap-4 text-center"
			>
				<h2 class="text-center text-2xl font-bold">
					{'Want to know more about me, who I am and what I do?'}
				</h2>
				<div class="flex flex-col gap-4">
					<p>
						{'Feel free to check out any of the sub-sections in the navigation '}
						<GoToHeading class="ml-1 cursor-pointer underline-offset-2 hover:underline">
							{'above'}
							<span class="sr-only">{'Click here to jump to the about-me navigation'}</span>
						</GoToHeading>
						{'!'}
					</p>
				</div>
			</section>
		</div>
	</div>
}
