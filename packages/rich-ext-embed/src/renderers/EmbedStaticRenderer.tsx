import '../styles.css';

import { useColorScheme } from '@haklex/rich-editor/static';
import { SiGithub } from '@icons-pack/react-simple-icons';
import type { ReactNode } from 'react';
import { Component, lazy, Suspense, useEffect, useMemo, useState } from 'react';

import { useEmbedRenderers } from '../context/EmbedRendererContext';
import * as styles from '../styles-static.css';
import { type EmbedType, getSpotifyEmbedPath } from '../url-matchers';

const extToLang: Record<string, string> = {
  '.js': 'javascript',
  '.ts': 'typescript',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  '.mts': 'typescript',
  '.cts': 'typescript',
  '.jsx': 'jsx',
  '.tsx': 'tsx',
  '.md': 'markdown',
  '.css': 'css',
  '.scss': 'scss',
  '.html': 'html',
  '.json': 'json',
  '.yml': 'yaml',
  '.yaml': 'yaml',
  '.toml': 'toml',
  '.xml': 'xml',
  '.sh': 'bash',
  '.bash': 'bash',
  '.zsh': 'bash',
  '.go': 'go',
  '.py': 'python',
  '.rb': 'ruby',
  '.java': 'java',
  '.c': 'c',
  '.cpp': 'cpp',
  '.cs': 'csharp',
  '.rs': 'rust',
  '.swift': 'swift',
  '.kt': 'kotlin',
  '.lua': 'lua',
  '.sql': 'sql',
  '.graphql': 'graphql',
  '.scala': 'scala',
  '.dart': 'dart',
  '.vue': 'vue',
  '.h': 'c',
  '.hpp': 'cpp',
  '.m': 'objectivec',
  '.ex': 'elixir',
  '.r': 'r',
};

function getLangFromPath(path: string): string {
  const dot = path.lastIndexOf('.');
  if (dot === -1) return 'text';
  return extToLang[path.slice(dot).toLowerCase()] || 'text';
}

// Pre-warm Shiki import (runs once, resolved from cache on subsequent calls)
const shikiPromise = import('shiki/bundle/web').catch(() => null);

export interface EmbedStaticRendererProps {
  type: EmbedType | null;
  url: string;
}

const typeLabels: Record<EmbedType, string> = {
  'tweet': 'X / Twitter',
  'youtube': 'YouTube',
  'apple-music': 'Apple Music',
  'spotify': 'Spotify',
  'codesandbox': 'CodeSandbox',
  'bilibili': 'Bilibili',
  'github-file': 'GitHub File',
  'github-gist': 'GitHub Gist',
  'thinking': 'Thinking',
};

const LazyTweet = lazy(() => import('react-tweet').then((mod) => ({ default: mod.IsolatedTweet })));

class EmbedErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

// --- Shared helpers ---

function GitHubSvg() {
  return <SiGithub size={16} />;
}

function FixedRatioContainer({
  children,
  ratio = 58,
}: {
  children: React.ReactNode;
  ratio?: number;
}) {
  return (
    <div className={`${styles.ratioContainer} ${styles.semanticClassNames.ratioContainer}`}>
      <div
        className={`${styles.ratioInner} ${styles.semanticClassNames.ratioInner}`}
        style={{ paddingBottom: `${ratio}%` }}
      >
        {children}
      </div>
    </div>
  );
}

function FallbackLink({ url, type }: { url: string; type: EmbedType | null }) {
  const label = type ? typeLabels[type] : 'Embed';
  const cssModifier = type || 'generic';
  const fallbackTypeClass = styles.fallbackType[cssModifier];
  const semanticModifierClass = styles.semanticFallbackModifierClass[cssModifier];
  return (
    <div
      className={`${styles.fallback} ${fallbackTypeClass} ${styles.semanticClassNames.fallback} ${semanticModifierClass}`.trim()}
    >
      <span className={`${styles.fallbackBadge} ${styles.semanticClassNames.fallbackBadge}`}>
        <span className={`${styles.fallbackDot} ${styles.semanticClassNames.fallbackDot}`} />
        {label}
      </span>
      <a
        className={`${styles.fallbackLink} ${styles.semanticClassNames.fallbackLink}`}
        href={url}
        rel="noreferrer"
        target="_blank"
      >
        {url}
      </a>
    </div>
  );
}

// --- Type-specific renderers ---

function TweetRenderer({ url }: { url: string }) {
  const colorScheme = useColorScheme();
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return <FallbackLink type="tweet" url={url} />;
  }

  const id = parsedUrl.pathname.split('/').pop();
  if (!id) return <FallbackLink type="tweet" url={url} />;

  const fallback = <FallbackLink type="tweet" url={url} />;

  return (
    <EmbedErrorBoundary fallback={fallback}>
      <div className={`${styles.tweet} ${styles.semanticClassNames.tweet}`}>
        <Suspense
          fallback={
            <div className={`${styles.loading} ${styles.semanticClassNames.loading}`}>
              Loading tweet...
            </div>
          }
        >
          <LazyTweet
            id={id}
            style={{ width: '100%' }}
            theme={colorScheme === 'dark' ? 'dark' : 'light'}
          />
        </Suspense>
      </div>
    </EmbedErrorBoundary>
  );
}

function GithubFileEmbed({ url, href }: { url: URL; href: string }) {
  const colorScheme = useColorScheme();
  const shikiTheme = colorScheme === 'dark' ? 'github-dark' : 'github-light';

  const split = url.pathname.split('/');
  const [, owner, repo, , ...rest] = split;
  const ref = rest[0];
  const path = ref ? rest.slice(1).join('/') : rest.join('/');

  const matchResult = url.hash.match(/L\d+/g);
  let startLine = 0;
  let endLine: number | undefined;
  if (matchResult) {
    if (matchResult.length === 1) {
      startLine = Number.parseInt(matchResult[0].slice(1)) - 1;
      endLine = startLine + 1;
    } else {
      startLine = Number.parseInt(matchResult[0].slice(1)) - 1;
      endLine = Number.parseInt(matchResult[1].slice(1));
    }
  }

  const [content, setContent] = useState<string | null>(null);
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const lang = useMemo(() => getLangFromPath(path), [path]);

  useEffect(() => {
    let cancelled = false;
    setContent(null);
    setHighlightedHtml(null);
    setLoading(true);
    setError(false);

    const fetchPromise = fetch(
      `https://cdn.jsdelivr.net/gh/${owner}/${repo}${ref ? `@${ref}` : ''}/${path}`,
    ).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    });

    Promise.all([fetchPromise, shikiPromise])
      .then(([text, shikiMod]) => {
        if (cancelled) return;
        setContent(text);

        const lines = text.split('\n');
        const end = endLine ?? lines.length;
        const displayCode = lines.slice(startLine, end).join('\n');

        if (!shikiMod) {
          setLoading(false);
          return;
        }

        shikiMod
          .codeToHtml(displayCode, {
            lang,
            theme: shikiTheme,
          })
          .then((html) => {
            if (!cancelled) {
              setHighlightedHtml(html);
              setLoading(false);
            }
          })
          .catch(() => {
            if (!cancelled) setLoading(false);
          });
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [owner, repo, ref, path, lang, startLine, endLine, shikiTheme]);

  if (loading) {
    return (
      <div className={`${styles.loading} ${styles.semanticClassNames.loading}`}>
        Loading GitHub File Preview...
      </div>
    );
  }

  if (error || content === null) {
    return <FallbackLink type="github-file" url={href} />;
  }

  const lines = content.split('\n');
  const end = endLine ?? lines.length;
  const isLong = end - startLine > 20;

  return (
    <div className={`${styles.githubFile} ${styles.semanticClassNames.githubFile}`}>
      <div
        className={`${styles.githubFileCode} ${styles.semanticClassNames.githubFileCode} ${isLong ? `${styles.githubFileCodeLong} ${styles.semanticClassNames.githubFileCodeLong}` : ''}`.trim()}
      >
        {highlightedHtml ? (
          <div
            className={`${styles.shiki} ${styles.semanticClassNames.shiki}`}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            style={{ '--start-line': startLine } as React.CSSProperties}
          />
        ) : (
          <pre>
            <code>
              {lines.slice(startLine, end).map((line, i) => (
                <span
                  className={`${styles.githubFileLine} ${styles.semanticClassNames.githubFileLine}`}
                  key={i}
                >
                  <span
                    className={`${styles.githubFileLineNum} ${styles.semanticClassNames.githubFileLineNum}`}
                  >
                    {startLine + i + 1}
                  </span>
                  {line}
                  {'\n'}
                </span>
              ))}
            </code>
          </pre>
        )}
      </div>
      <a
        className={`${styles.sourceLink} ${styles.semanticClassNames.sourceLink}`}
        href={href}
        rel="noreferrer"
        target="_blank"
      >
        <GitHubSvg />
        <span>{href}</span>
      </a>
    </div>
  );
}

// --- Main renderer ---

export function EmbedStaticRenderer({ type, url }: EmbedStaticRendererProps) {
  const customRenderers = useEmbedRenderers();

  if (!url) return null;

  // Custom renderer override
  if (type && customRenderers[type]) {
    const Custom = customRenderers[type]!;
    return <Custom type={type} url={url} />;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return <FallbackLink type={type} url={url} />;
  }

  switch (type) {
    case 'tweet': {
      return <TweetRenderer url={url} />;
    }

    case 'youtube': {
      const id = parsedUrl.searchParams.get('v');
      if (!id) return <FallbackLink type={type} url={url} />;
      return (
        <FixedRatioContainer>
          <iframe
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            className={`${styles.iframe} ${styles.semanticClassNames.iframe}`}
            src={`https://www.youtube.com/embed/${id}`}
            title="YouTube video player"
          />
        </FixedRatioContainer>
      );
    }

    case 'apple-music': {
      parsedUrl.hostname = 'embed.music.apple.com';
      parsedUrl.protocol = 'https:';
      return (
        <FixedRatioContainer ratio={68}>
          <iframe
            allowFullScreen
            allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
            className={`${styles.iframe} ${styles.semanticClassNames.iframe}`}
            sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
            src={parsedUrl.toString()}
            title="Apple Music player"
          />
        </FixedRatioContainer>
      );
    }

    case 'spotify': {
      const embedPath = getSpotifyEmbedPath(parsedUrl);
      if (!embedPath) return <FallbackLink type={type} url={url} />;
      parsedUrl.pathname = embedPath;
      return (
        <FixedRatioContainer ratio={54}>
          <iframe
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            className={`${styles.iframe} ${styles.semanticClassNames.iframe}`}
            loading="lazy"
            src={parsedUrl.toString()}
            title="Spotify player"
          />
        </FixedRatioContainer>
      );
    }

    case 'bilibili': {
      const id = parsedUrl.pathname.split('/')[2];
      if (!id) return <FallbackLink type={type} url={url} />;
      return (
        <FixedRatioContainer>
          <iframe
            allowFullScreen
            className={`${styles.iframe} ${styles.semanticClassNames.iframe}`}
            scrolling="no"
            src={`//player.bilibili.com/player.html?bvid=${id}&autoplay=0`}
          />
        </FixedRatioContainer>
      );
    }

    case 'codesandbox': {
      const path = parsedUrl.pathname.slice(2);
      return (
        <FixedRatioContainer>
          <iframe
            className={`${styles.iframe} ${styles.semanticClassNames.iframe}`}
            src={`https://codesandbox.io/embed/${path}?fontsize=14&hidenavigation=1&theme=dark${parsedUrl.search}`}
          />
        </FixedRatioContainer>
      );
    }

    case 'github-gist': {
      const [, owner, id] = parsedUrl.pathname.split('/');
      if (!owner || !id) return <FallbackLink type={type} url={url} />;
      return (
        <div className={`${styles.gist} ${styles.semanticClassNames.gist}`}>
          <iframe
            className={`${styles.gistIframe} ${styles.semanticClassNames.gistIframe}`}
            src={`https://gist.github.com/${owner}/${id}.pibb`}
          />
          <a
            className={`${styles.sourceLink} ${styles.semanticClassNames.sourceLink}`}
            href={url}
            rel="noreferrer"
            target="_blank"
          >
            <GitHubSvg />
            <span>{url}</span>
          </a>
        </div>
      );
    }

    case 'github-file': {
      return <GithubFileEmbed href={url} url={parsedUrl} />;
    }

    default: {
      return <FallbackLink type={type} url={url} />;
    }
  }
}
