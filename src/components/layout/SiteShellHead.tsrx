import { getMetaForPath, SITE_URL } from '@/config/meta.ts';

function SiteShellHead(props: { pathname: string }) @{
  <>
    <title>{getMetaForPath(props.pathname).title}</title>
    <meta name="description" content={getMetaForPath(props.pathname).description} />
    <link
      rel="canonical"
      href={`${SITE_URL}${props.pathname === '/' ? '' : props.pathname}`}
    />
    <meta property="og:type" content="website" />
    <meta
      property="og:url"
      content={`${SITE_URL}${props.pathname === '/' ? '' : props.pathname}`}
    />
    <meta property="og:title" content={getMetaForPath(props.pathname).title} />
    <meta property="og:description" content={getMetaForPath(props.pathname).description} />
    <meta
      property="og:image"
      content={`${SITE_URL}/favicons/android-chrome-512x512.png`}
    />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={getMetaForPath(props.pathname).title} />
    <meta name="twitter:description" content={getMetaForPath(props.pathname).description} />
    <meta
      name="twitter:image"
      content={`${SITE_URL}/favicons/android-chrome-512x512.png`}
    />
  </>
}

export { SiteShellHead };
