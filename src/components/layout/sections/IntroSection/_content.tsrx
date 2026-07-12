import { AnimatedGradientText } from '@/components/animated/animated-grad-text.tsrx';
import type { FlattenedExperience } from '@/data/queries';

export function AnimatedIntroSection1() @{
	<AnimatedGradientText
		className="font-bold"
		variant="span"
		text="Jesse Koldewijn"
	/>
}

type IntroExperienceProps = {
	latestExperience?: FlattenedExperience | null;
};

export function AnimatedIntroSection2(props: IntroExperienceProps) @{
	const { latestExperience } = props;
	<AnimatedGradientText
		variant="span"
		className="px-1 font-bold"
		text={latestExperience?.company_name ?? ''}
	/>
}

export function AnimatedIntroSection3(props: IntroExperienceProps) @{
	const { latestExperience } = props;
	<AnimatedGradientText
		variant="span"
		className="[background-size:105%] font-bold"
		text={latestExperience?.title ?? ''}
	/>
}
