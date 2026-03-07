import type { LinkCardRendererProps } from '@haklex/rich-editor/renderers';
import { Globe } from 'lucide-react';
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

function mapSemanticClasses(classNames?: string): string {
  if (!classNames) return '';
  return classNames
    .split(/\s+/)
    .filter(Boolean)
    .map((cls) =>
      styles.semanticClassToStyle[cls] ? `${styles.semanticClassToStyle[cls]} ${cls}` : cls,
    )
    .join(' ');
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

  const typeClass = selectedPlugin?.typeClass;
  const typeStyleClass = typeClass ? styles.typeCardModifier[typeClass] : '';
  const typeSemanticClass = typeClass ? styles.semanticTypeClassNames[typeClass] : '';

  const isErrorState = useDynamicFetch && isError;
  const finalTitle = cardInfo?.title || title || (isErrorState ? '' : url);
  const finalDesc = cardInfo?.desc || description;
  const finalImage = cardInfo?.image || image;
  const finalColor = cardInfo?.color;
  const classNames = cardInfo?.classNames || {};
  const mappedCardRootClass = mapSemanticClasses(classNames.cardRoot);
  const mappedImageClass = mapSemanticClasses(classNames.image);

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

  const hasImage = !!finalImage;
  const showImagePlaceholder = isErrorState && !hasImage;
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
        typeStyleClass,
        typeSemanticClass,
        shouldCenterContent && styles.cardShortDesc,
        shouldCenterContent && styles.semanticClassNames.cardShortDesc,
        useDynamicFetch && (loading || isError) && styles.cardSkeleton,
        useDynamicFetch && (loading || isError) && styles.semanticClassNames.cardSkeleton,
        useDynamicFetch && isError && styles.cardError,
        useDynamicFetch && isError && styles.semanticClassNames.cardError,
        'not-prose',
        className,
        mappedCardRootClass,
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
      {hasImage || showImagePlaceholder ? (
        <span
          data-image={finalImage || ''}
          className={[styles.image, styles.semanticClassNames.image, mappedImageClass]
            .filter(Boolean)
            .join(' ')}
          style={{
            backgroundImage: finalImage ? `url(${finalImage})` : undefined,
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
