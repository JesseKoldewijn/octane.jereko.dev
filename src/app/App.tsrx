import { SiteShell } from '../components/layout/SiteShell.tsrx';

export function App(props: { url?: string }) @{
	const pathname = (props.url ?? '/').split('?')[0];
	<SiteShell pathname={pathname} />
}
