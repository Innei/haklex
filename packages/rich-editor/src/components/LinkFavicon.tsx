'use client';

import { Globe, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';

import { semanticClassNames, sharedStyles } from '../styles/shared.css';
import { getHostname, probeFavicon } from '../utils/favicon';
import { clsx } from './utils';

export type LinkFaviconProps = {
  href?: string;
  source?: string;
  noIcon?: boolean;
  className?: string;
  /** Platform type -> icon map, injected by app for known platforms (e.g. GitHub, Bilibili) */
  platformIconMap?: Record<string, React.ReactNode>;
  /** Resolve platform type from URL, injected by app */
  getPlatformFromUrl?: (url: URL) => string | null;
};

export function LinkFavicon({
  href,
  source,
  noIcon = false,
  className,
  platformIconMap,
  getPlatformFromUrl,
}: LinkFaviconProps) {
  const faviconClassName = clsx(
    semanticClassNames.linkFavicon,
    sharedStyles.linkFavicon,
    className,
  );
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!href) return;
    const hostname = getHostname(href);
    if (!hostname) return;

    let cancelled = false;
    probeFavicon(hostname).then((url) => {
      if (!cancelled) setFaviconUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [href]);

  if (noIcon || (!href && !source)) return null;

  // Direct source (e.g. SocialSourceLink)
  let platformType = source;
  if (!platformType && href && getPlatformFromUrl) {
    try {
      platformType = getPlatformFromUrl(new URL(href)) ?? undefined;
    } catch {
      /* invalid url */
    }
  }

  if (platformType && platformIconMap?.[platformType]) {
    return <span className={faviconClassName}>{platformIconMap[platformType]}</span>;
  }

  if (faviconUrl) {
    return (
      <span className={faviconClassName}>
        <img alt="" aria-hidden="true" height={14} src={faviconUrl} width={14} />
      </span>
    );
  }

  const isMailto = href?.toLowerCase().startsWith('mailto:');

  return (
    <span className={faviconClassName}>
      {isMailto ? <Mail aria-hidden size={14} /> : <Globe aria-hidden size={14} />}
    </span>
  );
}
