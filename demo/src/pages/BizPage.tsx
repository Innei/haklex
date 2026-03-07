import '@haklex/rich-diff/style.css';

import { RichDiff } from '@haklex/rich-diff';
import type { RichEditorVariant } from '@haklex/rich-editor';
import { ColorSchemeProvider, getVariantClass } from '@haklex/rich-editor';
import type { ExcalidrawEditRendererProps, ExcalidrawSnapshot } from '@haklex/rich-ext-excalidraw';
import { LinkCardRenderer } from '@haklex/rich-renderer-linkcard/static';
import { ExcalidrawConfigProvider } from '@haklex/rich-renderers/excalidraw';
import { RichRenderer } from '@haklex/rich-static-renderer';
import { PortalThemeProvider } from '@haklex/rich-style-token';
import { type FC, useCallback, useState } from 'react';

import { Panel } from '../components/Panel';
import { useTheme } from '../context/ThemeContext';
import { diffSamples } from '../fixtures/diff-samples';
import { customGithubRepoPlugin, extraLinkCardPlugins } from '../fixtures/extra-linkcard-plugins';

// ── Excalidraw Demo Data ───────────────────────────────────────

const excalidrawInlineSnapshot = JSON.stringify({
  elements: [
    {
      id: 'rect1',
      type: 'rectangle',
      x: 100,
      y: 100,
      width: 200,
      height: 120,
      strokeColor: '#1971c2',
      backgroundColor: '#a5d8ff',
      fillStyle: 'solid',
      strokeWidth: 2,
      roughness: 1,
      opacity: 100,
      seed: 1,
      version: 1,
      versionNonce: 1,
      isDeleted: false,
      boundElements: null,
      updated: 1,
      link: null,
      locked: false,
    },
    {
      id: 'ellipse1',
      type: 'ellipse',
      x: 350,
      y: 140,
      width: 160,
      height: 80,
      strokeColor: '#e8590c',
      backgroundColor: '#ffc078',
      fillStyle: 'solid',
      strokeWidth: 2,
      roughness: 1,
      opacity: 100,
      seed: 2,
      version: 1,
      versionNonce: 2,
      isDeleted: false,
      boundElements: null,
      updated: 1,
      link: null,
      locked: false,
    },
  ],
  appState: { viewBackgroundColor: '#ffffff' },
  files: {},
});

// ── Excalidraw Section ─────────────────────────────────────────

function ExcalidrawSection() {
  const theme = useTheme();
  const [blobStore] = useState<Map<string, string>>(() => new Map());

  const mockSaveSnapshot = useCallback(
    async (snapshot: object) => {
      const json = JSON.stringify(snapshot);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      blobStore.set(url, json);
      return url;
    },
    [blobStore],
  );

  const [remoteSnapshot, setRemoteSnapshot] = useState<ExcalidrawSnapshot>(() => ({
    type: 'remote',
    url: URL.createObjectURL(new Blob([excalidrawInlineSnapshot], { type: 'application/json' })),
  }));
  const [deltaSnapshot, setDeltaSnapshot] = useState<ExcalidrawSnapshot>(() => ({
    type: 'delta',
    baseUrl: URL.createObjectURL(
      new Blob([excalidrawInlineSnapshot], { type: 'application/json' }),
    ),
    delta: {},
  }));

  // Lazy load the edit renderer
  const [ExcalidrawEditRenderer, setEditRenderer] =
    useState<FC<ExcalidrawEditRendererProps> | null>(null);
  const [loaded, setLoaded] = useState(false);

  if (!loaded) {
    import('@haklex/rich-ext-excalidraw').then((mod) => {
      setEditRenderer(() => mod.ExcalidrawEditRenderer);
      setLoaded(true);
    });
  }

  if (!ExcalidrawEditRenderer) {
    return (
      <section className="showcase-section" id="excalidraw">
        <h3 className="showcase-section-title">Excalidraw Storage Modes</h3>
        <p style={{ color: 'var(--demo-text-muted)', fontSize: 14 }}>
          Loading excalidraw editor...
        </p>
      </section>
    );
  }

  return (
    <PortalThemeProvider className={getVariantClass('article')} theme={theme}>
      <ColorSchemeProvider colorScheme={theme}>
        <ExcalidrawConfigProvider saveSnapshot={mockSaveSnapshot}>
          <section className="showcase-section" id="excalidraw">
            <h3 className="showcase-section-title">Excalidraw Storage Modes</h3>
            <p
              style={{
                margin: '0 0 16px',
                color: 'var(--demo-text-muted)',
                fontSize: 14,
              }}
            >
              Three storage strategies: <strong>Remote</strong> (full snapshot uploaded as blob URL)
              and <strong>Delta</strong> (base ref + JSON diff patch). Toggle storage mode in the
              editor header.
            </p>
            <div className="biz-grid">
              <Panel badge="excalidraw" title="Remote Mode">
                <p className="node-description">
                  Snapshot uploaded to a blob URL. The editor stores the URL as the snapshot value.
                  On load, fetches the URL and renders.
                </p>
                <div
                  className={getVariantClass('article')}
                  data-color-scheme={theme}
                  data-theme={theme}
                  style={{ position: 'relative' }}
                >
                  <ExcalidrawEditRenderer
                    snapshot={remoteSnapshot}
                    onSnapshotChange={setRemoteSnapshot}
                  />
                </div>
              </Panel>

              <Panel badge="excalidraw" title="Delta Mode">
                <p className="node-description">
                  Base snapshot uploaded once. Subsequent saves store only the JSON diff
                  (jsondiffpatch delta) against the base, drastically reducing payload size.
                </p>
                <div
                  className={getVariantClass('article')}
                  data-color-scheme={theme}
                  data-theme={theme}
                  style={{ height: 320, position: 'relative' }}
                >
                  <ExcalidrawEditRenderer
                    snapshot={deltaSnapshot}
                    onSnapshotChange={setDeltaSnapshot}
                  />
                </div>
              </Panel>
            </div>
          </section>
        </ExcalidrawConfigProvider>
      </ColorSchemeProvider>
    </PortalThemeProvider>
  );
}

// ── LinkCard Section ───────────────────────────────────────────

interface DemoCard {
  description: string;
  key: string;
  label: string;
  title?: string;
  url: string;
  useOverride?: boolean;
}

const demoCards: DemoCard[] = [
  {
    key: 'douban',
    label: 'Douban Book (custom plugin)',
    url: 'https://book.douban.com/subject/1477390',
    description: 'doubanBookPlugin 匹配 book.douban.com，与内置 11 个插件合并后生效',
  },
  {
    key: 'issue',
    label: 'Internal Issue (custom plugin)',
    url: 'https://issues.example.com/PROJ-1234',
    description: 'internalIssuePlugin 匹配 issues.example.com，新增插件不影响内置',
  },
  {
    key: 'github',
    label: 'GitHub Repo (builtin)',
    url: 'https://github.com/facebook/react',
    description: '内置 gh-repo 插件自动匹配，无需额外配置',
  },
  {
    key: 'github-override',
    label: 'GitHub Repo (overridden)',
    url: 'https://github.com/vercel/next.js',
    description: '传入同名 "gh-repo" 插件覆盖内置实现，卡片标题带 (custom plugin) 标记',
    useOverride: true,
  },
  {
    key: 'static',
    label: 'Static fallback (no plugin match)',
    url: 'https://example.com/article',
    title: 'Example Article',
    description: '无插件匹配时降级为静态 props 渲染',
  },
];

function LinkCardSection() {
  const theme = useTheme();
  const [showOverride, setShowOverride] = useState(false);

  return (
    <section className="showcase-section" id="linkcard">
      <h3 className="showcase-section-title">LinkCard Plugin Extension</h3>
      <p
        style={{
          margin: '0 0 16px',
          color: 'var(--demo-text-muted)',
          fontSize: 14,
        }}
      >
        <code>plugins</code> prop 传入的插件会与内置 11 个插件合并（同名覆盖，按 priority 排序）。
      </p>

      <div className="toolbar" style={{ marginBottom: 16 }}>
        <div className="toolbar-group">
          <span className="toolbar-label">Override</span>
          <button
            className={showOverride ? 'btn btn-active' : 'btn'}
            onClick={() => setShowOverride((v) => !v)}
          >
            Override gh-repo
          </button>
        </div>
      </div>

      <div className="biz-grid">
        {demoCards
          .filter((c) => !c.useOverride || showOverride)
          .map((card) => (
            <Panel badge="linkcard" key={card.key} title={card.label}>
              <p className="node-description">{card.description}</p>
              <div
                className={`node-render ${getVariantClass('article')}`}
                data-theme={theme}
                style={{ marginTop: 8 }}
              >
                <LinkCardRenderer
                  title={card.title}
                  url={card.url}
                  plugins={
                    card.useOverride
                      ? [...extraLinkCardPlugins, customGithubRepoPlugin]
                      : extraLinkCardPlugins
                  }
                />
              </div>
            </Panel>
          ))}
      </div>
    </section>
  );
}

// ── Diff Section ───────────────────────────────────────────────

function DiffSection() {
  const theme = useTheme();
  const [variant, setVariant] = useState<RichEditorVariant>('comment');
  const [selectedKey, setSelectedKey] = useState(diffSamples[0].key);

  const selected = diffSamples.find((s) => s.key === selectedKey) || diffSamples[0];

  return (
    <section className="showcase-section" id="diff">
      <h3 className="showcase-section-title">Rich Diff Viewer</h3>

      <div className="toolbar" style={{ marginBottom: 16 }}>
        <div className="toolbar-group">
          <span className="toolbar-label">Sample</span>
          {diffSamples.map((sample) => (
            <button
              className={selectedKey === sample.key ? 'btn btn-active' : 'btn'}
              key={sample.key}
              title={sample.description}
              onClick={() => setSelectedKey(sample.key)}
            >
              {sample.label}
            </button>
          ))}
        </div>
        <div className="toolbar-group">
          <span className="toolbar-label">Variant</span>
          <button
            className={variant === 'article' ? 'btn btn-active' : 'btn'}
            onClick={() => setVariant('article')}
          >
            Article
          </button>
          <button
            className={variant === 'comment' ? 'btn btn-active' : 'btn'}
            onClick={() => setVariant('comment')}
          >
            Comment
          </button>
        </div>
      </div>

      <Panel badge={`${selected.label} · ${variant} · ${theme}`} title="Side-by-Side Diff">
        <RichDiff
          className={theme === 'dark' ? 'rich-diff-dark' : ''}
          key={selected.key}
          newValue={selected.newValue}
          oldValue={selected.oldValue}
          theme={theme}
          variant={variant}
        />
      </Panel>

      <div className="biz-grid" style={{ marginTop: 16 }}>
        <Panel title="Old">
          <RichRenderer
            key={`${selected.key}-old`}
            theme={theme}
            value={selected.oldValue}
            variant={variant}
          />
        </Panel>
        <Panel title="New">
          <RichRenderer
            key={`${selected.key}-new`}
            theme={theme}
            value={selected.newValue}
            variant={variant}
          />
        </Panel>
      </div>
    </section>
  );
}

// ── BizPage ────────────────────────────────────────────────────

export function BizPage() {
  return (
    <div className="page">
      <div className="showcase-intro">
        <h2>Business Scenarios</h2>
        <p>
          Integration demos: Excalidraw storage modes, LinkCard plugin extension, and Rich Diff
          viewer.
        </p>
        <nav className="biz-anchor-nav">
          <button
            onClick={() =>
              document.getElementById('excalidraw')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            Excalidraw
          </button>
          <button
            onClick={() =>
              document.getElementById('linkcard')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            LinkCard
          </button>
          <button
            onClick={() => document.getElementById('diff')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Diff
          </button>
        </nav>
      </div>

      <ExcalidrawSection />
      <LinkCardSection />
      <DiffSection />
    </div>
  );
}
