import { useEffect } from 'octane';
import { Navbar } from '@/components/layout/navbar/Navbar.tsrx';
import { useHydrated } from '@/components/ClientOnly.tsrx';
import { MobileNavDialog } from '@/components/layout/navbar/mobile/MobileNavDialog.tsrx';
import { FooterWithSlots } from '@/components/layout/FooterWithSlots.tsrx';
import { PwaRegister } from '@/components/PwaRegister.tsrx';
import { getSocialsByPlatform } from '@/data/queries';
import { getMetaForPath, SITE_URL } from '@/config/meta.ts';
import { SiteShellPage } from '@/components/layout/SiteShellPage.tsrx';
import { usePathname } from '@/app/use-pathname.ts';

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function SiteShell(props: { pathname?: string }) @{
  const pathname = usePathname(props.pathname ?? '/');
  const socials = getSocialsByPlatform('twitter', 'github', 'linkedin');
  const meta = getMetaForPath(pathname);
  const canonical = `${SITE_URL}${pathname === '/' ? '' : pathname}`;
  const hydrated = useHydrated();

  useEffect(() => {
    document.title = meta.title;
    setMeta('description', meta.description);
    setMeta('og:title', meta.title, 'property');
    setMeta('og:description', meta.description, 'property');
    setMeta('og:url', canonical, 'property');
    setMeta('twitter:title', meta.title);
    setMeta('twitter:description', meta.description);

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonical;
  }, [pathname]);

  <div>
    <PwaRegister />
    <Navbar />
    @if (hydrated) {
      <MobileNavDialog socials={socials} />
    }
    <main class="min-h-[90svh] pb-8">
      <SiteShellPage pathname={pathname} />
    </main>
    <FooterWithSlots socials={socials} />
  </div>
}
