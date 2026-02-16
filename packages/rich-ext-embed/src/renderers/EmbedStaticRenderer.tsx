import '../styles-static.css'

import { Github } from 'lucide-react'
import type { ReactNode } from 'react'
import { Component, lazy, Suspense, useEffect, useMemo, useState } from 'react'

import { useEmbedRenderers } from '../context/EmbedRendererContext'
import type { EmbedType } from '../url-matchers'

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
}

function getLangFromPath(path: string): string {
  const dot = path.lastIndexOf('.')
  if (dot === -1) return 'text'
  return extToLang[path.slice(dot).toLowerCase()] || 'text'
}

// Pre-warm Shiki import (runs once, resolved from cache on subsequent calls)
const shikiPromise = import('shiki/bundle/web').catch(() => null)

export interface EmbedStaticRendererProps {
  type: EmbedType | null
  url: string
}

const typeLabels: Record<EmbedType, string> = {
  tweet: 'X / Twitter',
  youtube: 'YouTube',
  codesandbox: 'CodeSandbox',
  bilibili: 'Bilibili',
  'github-file': 'GitHub File',
  'github-gist': 'GitHub Gist',
  thinking: 'Thinking',
}

// --- Lazy Tweet via react-tweet (optional peer dep) ---

const LazyTweet = lazy(() =>
  import('react-tweet').then((mod) => ({ default: mod.Tweet })),
)

class EmbedErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}

// --- Shared helpers ---

function GitHubSvg() {
  return <Github size={16} />
}

function FixedRatioContainer({
  children,
  ratio = 58,
}: {
  children: React.ReactNode
  ratio?: number
}) {
  return (
    <div className="embed-static-ratio-container">
      <div
        className="embed-static-ratio-inner"
        style={{ paddingBottom: `${ratio}%` }}
      >
        {children}
      </div>
    </div>
  )
}

function FallbackLink({ url, type }: { url: string; type: EmbedType | null }) {
  const label = type ? typeLabels[type] : 'Embed'
  const cssModifier = type || 'generic'
  return (
    <div
      className={`embed-static-fallback embed-static-fallback--${cssModifier}`}
    >
      <span className="embed-static-fallback__badge">
        <span className="embed-static-fallback__dot" />
        {label}
      </span>
      <a
        className="embed-static-fallback__link"
        href={url}
        target="_blank"
        rel="noreferrer"
      >
        {url}
      </a>
    </div>
  )
}

// --- Type-specific renderers ---

function TweetRenderer({ url }: { url: string }) {
  let parsedUrl: URL | null = null
  try {
    parsedUrl = new URL(url)
  } catch {
    return <FallbackLink url={url} type="tweet" />
  }

  const id = parsedUrl.pathname.split('/').pop()
  if (!id) return <FallbackLink url={url} type="tweet" />

  const fallback = <FallbackLink url={url} type="tweet" />

  return (
    <EmbedErrorBoundary fallback={fallback}>
      <div className="embed-static-tweet">
        <Suspense
          fallback={
            <div className="embed-static-loading">Loading tweet...</div>
          }
        >
          <LazyTweet id={id} />
        </Suspense>
      </div>
    </EmbedErrorBoundary>
  )
}

function GithubFileEmbed({ url, href }: { url: URL; href: string }) {
  const split = url.pathname.split('/')
  const [, owner, repo, , ...rest] = split
  const ref = rest[0]
  const path = ref ? rest.slice(1).join('/') : rest.join('/')

  const matchResult = url.hash.match(/L\d+/g)
  let startLine = 0
  let endLine: number | undefined
  if (matchResult) {
    if (matchResult.length === 1) {
      startLine = Number.parseInt(matchResult[0].slice(1)) - 1
      endLine = startLine + 1
    } else {
      startLine = Number.parseInt(matchResult[0].slice(1)) - 1
      endLine = Number.parseInt(matchResult[1].slice(1))
    }
  }

  const [content, setContent] = useState<string | null>(null)
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const lang = useMemo(() => getLangFromPath(path), [path])

  useEffect(() => {
    let cancelled = false
    setContent(null)
    setHighlightedHtml(null)
    setLoading(true)
    setError(false)

    const fetchPromise = fetch(
      `https://cdn.jsdelivr.net/gh/${owner}/${repo}${ref ? `@${ref}` : ''}/${path}`,
    ).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.text()
    })

    Promise.all([fetchPromise, shikiPromise])
      .then(([text, shikiMod]) => {
        if (cancelled) return
        setContent(text)

        const lines = text.split('\n')
        const end = endLine ?? lines.length
        const displayCode = lines.slice(startLine, end).join('\n')

        if (!shikiMod) {
          setLoading(false)
          return
        }

        shikiMod
          .codeToHtml(displayCode, {
            lang,
            themes: { light: 'github-light', dark: 'github-dark' },
            defaultColor: false,
          })
          .then((html) => {
            if (!cancelled) {
              setHighlightedHtml(html)
              setLoading(false)
            }
          })
          .catch(() => {
            if (!cancelled) setLoading(false)
          })
      })
      .catch(() => {
        if (!cancelled) {
          setError(true)
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [owner, repo, ref, path, lang, startLine, endLine])

  if (loading) {
    return (
      <div className="embed-static-loading">Loading GitHub File Preview...</div>
    )
  }

  if (error || content === null) {
    return <FallbackLink url={href} type="github-file" />
  }

  const lines = content.split('\n')
  const end = endLine ?? lines.length
  const isLong = end - startLine > 20

  return (
    <div className="embed-static-github-file">
      <div
        className={`embed-static-github-file__code${isLong ? ' embed-static-github-file__code--long' : ''}`}
      >
        {highlightedHtml ? (
          <div
            className="embed-static-shiki"
            style={{ '--start-line': startLine } as React.CSSProperties}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        ) : (
          <pre>
            <code>
              {lines.slice(startLine, end).map((line, i) => (
                <span key={i} className="embed-static-github-file__line">
                  <span className="embed-static-github-file__line-num">
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
        className="embed-static-source-link"
        href={href}
        target="_blank"
        rel="noreferrer"
      >
        <GitHubSvg />
        <span>{href}</span>
      </a>
    </div>
  )
}

// --- Main renderer ---

export function EmbedStaticRenderer({ type, url }: EmbedStaticRendererProps) {
  const customRenderers = useEmbedRenderers()

  if (!url) return null

  // Custom renderer override
  if (type && customRenderers[type]) {
    const Custom = customRenderers[type]!
    return <Custom url={url} type={type} />
  }

  let parsedUrl: URL | null = null
  try {
    parsedUrl = new URL(url)
  } catch {
    return <FallbackLink url={url} type={type} />
  }

  switch (type) {
    case 'tweet': {
      return <TweetRenderer url={url} />
    }

    case 'youtube': {
      const id = parsedUrl.searchParams.get('v')
      if (!id) return <FallbackLink url={url} type={type} />
      return (
        <FixedRatioContainer>
          <iframe
            src={`https://www.youtube.com/embed/${id}`}
            className="embed-static-iframe"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="YouTube video player"
          />
        </FixedRatioContainer>
      )
    }

    case 'bilibili': {
      const id = parsedUrl.pathname.split('/')[2]
      if (!id) return <FallbackLink url={url} type={type} />
      return (
        <FixedRatioContainer>
          <iframe
            src={`//player.bilibili.com/player.html?bvid=${id}&autoplay=0`}
            scrolling="no"
            className="embed-static-iframe"
            allowFullScreen
          />
        </FixedRatioContainer>
      )
    }

    case 'codesandbox': {
      const path = parsedUrl.pathname.slice(2)
      return (
        <FixedRatioContainer>
          <iframe
            className="embed-static-iframe"
            src={`https://codesandbox.io/embed/${path}?fontsize=14&hidenavigation=1&theme=dark${parsedUrl.search}`}
          />
        </FixedRatioContainer>
      )
    }

    case 'github-gist': {
      const [, owner, id] = parsedUrl.pathname.split('/')
      if (!owner || !id) return <FallbackLink url={url} type={type} />
      return (
        <div className="embed-static-gist">
          <iframe
            src={`https://gist.github.com/${owner}/${id}.pibb`}
            className="embed-static-gist__iframe"
          />
          <a
            className="embed-static-source-link"
            href={url}
            target="_blank"
            rel="noreferrer"
          >
            <GitHubSvg />
            <span>{url}</span>
          </a>
        </div>
      )
    }

    case 'github-file': {
      return <GithubFileEmbed url={parsedUrl} href={url} />
    }

    default:
      return <FallbackLink url={url} type={type} />
  }
}
