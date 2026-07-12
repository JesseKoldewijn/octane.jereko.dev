import { HeroSection } from '@/components/layout/sections/HeroSection.tsrx';
import { IntroSection } from '@/components/layout/sections/IntroSection/index.tsrx';
import { LastAttendedEvent } from '@/components/events/last-attended.tsrx';
import { themedAvatar } from '@/config/images';

export function Home() @{
	<div>
		<HeroSection
			bannerImage={themedAvatar}
			bannerContent={{
				title: 'Jereko',
				description: 'Hi, My name is Jesse!',
			}}
		/>
		<section class="mx-auto flex w-full max-w-lg flex-col items-center gap-8 px-4 pt-0 text-center md:pt-5 lg:pt-10">
			<h2 class="text-md font-semibold md:text-xl">{'Thanks for the visit!'}</h2>
			<p class="text-neutral-600 dark:text-neutral-200">
				{"This website is used to showcase my projects, experience and volunteering work. I also use this website to showcase my skills in engineering and events I've attended."}
			</p>
		</section>
		<section class="mx-auto flex w-full max-w-lg flex-col items-center gap-8 px-4 py-20 text-center">
			<h2 class="text-md font-semibold md:text-xl">
				{'A short introduction about me'}
			</h2>
			<IntroSection />
		</section>
		<LastAttendedEvent />
	</div>
}
