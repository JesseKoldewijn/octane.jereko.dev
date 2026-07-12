import { HeroSection } from '@/components/layout/sections/HeroSection.tsrx';
import { ExperienceLister } from '@/components/listers/ExperienceLister.tsrx';
import { themedProgrammingBanner } from '@/config/images';

export function Experience() @{
	<div>
		<HeroSection
			bannerImage={themedProgrammingBanner}
			bannerContent={{
				title: 'Experience',
				description: "A list of what I've done over the years.",
			}}
		/>
		<div class="mx-auto mt-8 w-auto max-w-md px-4 md:w-full md:px-0">
			<section>
				<ExperienceLister />
			</section>
		</div>
	</div>
}
