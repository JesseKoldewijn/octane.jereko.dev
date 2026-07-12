import { useEffect, useState } from 'octane';
import { useHydrated } from '@/components/ClientOnly.tsrx';
import { TextGenFallback } from '@/components/animated/text-gen-fallback.tsrx';

interface TextGenProps {
	words: string[];
	className?: string;
}

function TextGenAnimated(props: TextGenProps) @{
	const { words, className } = props;
	const [Animated, setAnimated] = useState<((props: TextGenProps) => any) | null>(null);

	useEffect(() => {
		import('./text-gen.tsrx').then((mod) => {
			if (mod?.INTERNAL_TextGenComponent) {
				setAnimated(() => mod.INTERNAL_TextGenComponent as unknown as typeof Animated);
			}
		});
	}, []);

	@if (Animated) {
		<Animated words={words} className={className} />
	} @else {
		<TextGenFallback words={words} className={className} />
	}
}

interface TextGenProps {
	words: string[];
	className?: string;
}

export function TextGen(props: TextGenProps) @{
	const { words, className } = props;
	const hydrated = useHydrated();

	@if (!hydrated) {
		<TextGenFallback words={words} className={className} />
	} @else {
		<TextGenAnimated words={words} className={className} />
	}
}
