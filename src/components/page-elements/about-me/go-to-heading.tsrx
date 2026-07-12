import { testIds } from '@/testids';

export function GoToHeading(props) @{
	const { children, ...rest } = props;

	const goToNavigation = () => {
		const navigationElem = document.getElementById(testIds.aboutMe.navigation);
		if (!navigationElem) return;
		window.scrollTo({
			top: navigationElem.offsetTop - 250,
			behavior: 'smooth',
		});
	};

	<button
		type="button"
		data-testid={testIds.aboutMe.goToHeadingButton}
		onClick={goToNavigation}
		{...rest}
	>
		{children}
	</button>
}
