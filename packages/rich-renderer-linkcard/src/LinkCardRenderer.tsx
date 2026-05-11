import type { LinkCardRendererProps } from '@haklex/rich-editor/renderers';
import { Globe, Unlink } from 'lucide-react';
import type { ComponentType } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useLinkCardFetchContext } from './FetchContext';
import { useCardFetcher } from './hooks/useCardFetcher';
import { useUrlMatcher } from './hooks/useUrlMatcher';
import { LinkCardSkeleton } from './LinkCardSkeleton';
import { plugins as builtinPlugins } from './plugins';
import * as styles from './styles.css';
import type { LinkCardFetchContext, PluginRegistry } from './types';

export interface EnhancedLinkCardProps extends LinkCardRendererProps {
  className?: string;
  fetchContext?: LinkCardFetchContext;
  id?: string;
  /**
   * 额外插件，与内置插件合并（同名覆盖内置，按 priority 排序）
   */
  plugins?: PluginRegistry;
  source?: string;
}

function FallbackIcon({ favicon }: { favicon?: string }) {
  const [faviconFailed, setFaviconFailed] = useState(false);

  return (
    <span className={`${styles.icon} ${styles.semanticClassNames.icon}`}>
      {favicon && !faviconFailed ? (
        <img alt="" src={favicon} onError={() => setFaviconFailed(true)} />
      ) : (
        <Globe aria-hidden="true" />
      )}
    </span>
  );
}

function displayHost(url: string): string {
  try {
    const u = new URL(url);
    return `${u.hostname}${u.pathname === '/' ? '' : u.pathname}`;
  } catch {
    return url;
  }
}

export const LinkCardRenderer: ComponentType<EnhancedLinkCardProps> = (props) => {
  const {
    url,
    title,
    description,
    favicon,
    image,
    source: explicitSource,
    id: explicitId,
    className,
    plugins: extraPlugins,
    fetchContext: fetchContextProp,
  } = props;

  const contextValue = useLinkCardFetchContext();
  const fetchContext = fetchContextProp ?? contextValue;

  const mergedPlugins = useMemo(() => {
    if (!extraPlugins || extraPlugins.length === 0) return builtinPlugins;
    const map = new Map(builtinPlugins.map((p) => [p.name, p]));
    for (const plugin of extraPlugins) {
      map.set(plugin.name, plugin);
    }
    return [...map.values()].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  }, [extraPlugins]);

  const pluginMap = useMemo(
    () => new Map(mergedPlugins.map((plugin) => [plugin.name, plugin])),
    [mergedPlugins],
  );

  const urlMatch = useUrlMatcher(!explicitSource || !explicitId ? url : undefined, mergedPlugins);
  const source = explicitSource || urlMatch?.plugin.name;
  const id = explicitId || urlMatch?.match.id;
  const matchedFullUrl = urlMatch?.match.fullUrl;

  const useDynamicFetch = !!source && !!id;
  const selectedPlugin = source ? pluginMap.get(source) : undefined;
  const { loading, isError, cardInfo, fullUrl, isValid, ref } = useCardFetcher({
    source,
    plugin: selectedPlugin,
    id: id || '',
    fallbackUrl: matchedFullUrl || url,
    enabled: useDynamicFetch,
    context: fetchContext,
  });

  const shape = selectedPlugin?.shape ?? 'compact';
  const shapeStyleClass = styles.shapeClass[shape];
  const shapeSemanticClass = styles.semanticShapeClass[shape];

  const finalTitle = cardInfo?.title || title || url;
  const finalDesc = cardInfo?.desc || description;
  const finalImage = cardInfo?.image || image;
  const finalColor = cardInfo?.color;

  const [shortDesc, setShortDesc] = useState(false);
  const descRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = descRef.current;
    if (!el || !finalDesc) {
      setShortDesc(false);
      return;
    }
    const style = getComputedStyle(el);
    const lineHeight = Number.parseFloat(style.lineHeight) || 1.5 * 14;
    const maxTwoLines = lineHeight * 2;
    setShortDesc(el.scrollHeight <= maxTwoLines + 1);
  }, [finalDesc, finalTitle]);

  if (useDynamicFetch && !isValid) {
    return null;
  }

  if (useDynamicFetch && loading) {
    return (
      <a data-hide-print href={fullUrl} ref={ref} rel="noopener noreferrer" target="_blank">
        <LinkCardSkeleton source={source} />
      </a>
    );
  }

  if (useDynamicFetch && isError) {
    return (
      <a
        data-hide-print
        data-source={source || undefined}
        href={fullUrl}
        ref={ref}
        rel="noopener noreferrer"
        target="_blank"
        className={[styles.cardError, styles.semanticClassNames.cardError, 'not-prose', className]
          .filter(Boolean)
          .join(' ')}
      >
        <span className={styles.errorIcon}>
          <Unlink aria-hidden="true" />
        </span>
        <span className={`${styles.errorContent} ${styles.semanticClassNames.errorContent}`}>
          <span className={`${styles.errorUrl} ${styles.semanticClassNames.errorUrl}`}>
            {displayHost(fullUrl)}
          </span>
          <span className={`${styles.errorHint} ${styles.semanticClassNames.errorHint}`}>
            无法预览 · 仍可访问
          </span>
        </span>
      </a>
    );
  }

  const hasImage = !!finalImage;
  const shouldCenterContent = !finalDesc || shortDesc;

  return (
    <a
      data-hide-print
      data-source={source || undefined}
      href={useDynamicFetch ? fullUrl : url}
      ref={useDynamicFetch ? ref : undefined}
      rel="noopener noreferrer"
      target="_blank"
      className={[
        styles.card,
        styles.semanticClassNames.card,
        shapeStyleClass,
        shapeSemanticClass,
        shouldCenterContent && styles.cardShortDesc,
        shouldCenterContent && styles.semanticClassNames.cardShortDesc,
        'not-prose',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        borderColor: finalColor ? `${finalColor}30` : undefined,
      }}
    >
      {finalColor && (
        <div
          className={`${styles.bg} ${styles.semanticClassNames.bg}`}
          style={{
            backgroundColor: finalColor,
            opacity: 0.04,
          }}
        />
      )}
      {hasImage ? (
        <span
          className={`${styles.image} ${styles.semanticClassNames.image}`}
          data-image={finalImage || ''}
          style={{
            backgroundImage: `url(${finalImage})`,
          }}
        />
      ) : (
        <FallbackIcon favicon={favicon} />
      )}
      <span className={`${styles.content} ${styles.semanticClassNames.content}`}>
        <span className={`${styles.title} ${styles.semanticClassNames.title}`}>
          <span className={`${styles.titleText} ${styles.semanticClassNames.titleText}`}>
            {finalTitle}
          </span>
        </span>
        {finalDesc && (
          <span className={`${styles.desc} ${styles.semanticClassNames.desc}`} ref={descRef}>
            {finalDesc}
          </span>
        )}
      </span>
    </a>
  );
};
