import { HeroSection } from '@/components/layout/sections/HeroSection.tsrx';
import { ProjectsLister } from '@/components/listers/ProjectsLister.tsrx';
import { themedProgrammingBanner } from '@/config/images';

export function Projects() @{
	<div>
		<HeroSection
			bannerImage={themedProgrammingBanner}
			bannerContent={{
				title: 'Projects',
				description: "A list of projects I've worked on.",
			}}
		/>
		<div class="mx-auto mt-8 w-auto max-w-md px-4 md:w-full md:px-0">
			<section>
				<ProjectsLister />
			</section>
		</div>
	</div>
}
