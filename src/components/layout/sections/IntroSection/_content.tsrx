import { AnimatedGradientText } from '@/components/animated/animated-grad-text.tsrx';

export function AnimatedIntroSection1() @{
	<AnimatedGradientText
		className="font-bold"
		variant="span"
		text="Jesse Koldewijn"
	/>
}

export function AnimatedIntroSection2(props) @{
	const { latestExperience } = props;
	<AnimatedGradientText
		variant="span"
		className="px-1 font-bold"
		text={latestExperience?.company_name ?? ''}
	/>
}

export function AnimatedIntroSection3(props) @{
	const { latestExperience } = props;
	<AnimatedGradientText
		variant="span"
		className="[background-size:105%] font-bold"
		text={latestExperience?.title ?? ''}
	/>
}
