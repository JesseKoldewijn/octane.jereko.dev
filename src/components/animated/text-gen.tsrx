import { motion, useAnimate, stagger } from '@octanejs/motion';
import { useEffect, useLayoutEffect, useState } from 'octane';

interface RenderWordsProps {
	wordsArray: string[];
	scope: any;
}

function RenderWords(props: RenderWordsProps) @{
	const { wordsArray, scope } = props;

	<motion.div ref={scope}>
		@for (const entry of wordsArray.map((word, idx) => ({ word, key: word + idx })); key entry.key) {
			<motion.span class="text-black opacity-0 dark:text-white">
				{`${entry.word} `}
			</motion.span>
		}
	</motion.div>
}

interface TextGenProps {
	words: string;
	className?: string;
}

export function INTERNAL_TextGenComponent(props: TextGenProps) @{
	const { words, className } = props;
	const [pathName, setPathName] = useState('');
	const [scope, animate] = useAnimate();

	useEffect(() => {
		setPathName(typeof window !== 'undefined' ? window.location.pathname : '');
	}, []);

	useLayoutEffect(() => {
		if (!scope.current) return;
		animate(
			'span',
			{ opacity: 1 },
			{ duration: 2, delay: stagger(0.2) },
		);
	}, [pathName]);

	const wordsArray = words.split(' ');

	<div class={className} data-pathname-key={pathName}>
		<div class="mt-4">
			<div class="text-2xl leading-snug tracking-wide text-black dark:text-white">
				<RenderWords wordsArray={wordsArray} scope={scope} />
			</div>
		</div>
	</div>
}
