import { useEffect, useState } from 'octane';
import { useHydrated } from '@/components/ClientOnly.tsrx';
import { TextGenFallback } from '@/components/animated/text-gen-fallback.tsrx';

function TextGenAnimated(props) @{
	const { words, className } = props;
	const [Animated, setAnimated] = useState(null);

	useEffect(() => {
		import('./text-gen.tsrx').then((mod) => {
			setAnimated(() => mod.INTERNAL_TextGenComponent);
		});
	}, []);

	@if (Animated) {
		<Animated words={words} className={className} />
	} @else {
		<TextGenFallback words={words} className={className} />
	}
}

export function TextGen(props) @{
	const { words, className } = props;
	const hydrated = useHydrated();

	@if (!hydrated) {
		<TextGenFallback words={words} className={className} />
	} @else {
		<TextGenAnimated words={words} className={className} />
	}
}
