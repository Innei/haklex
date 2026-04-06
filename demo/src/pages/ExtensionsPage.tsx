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

// ── Extension definitions ─────────────────────────────────────

interface Extension {
  description: string;
  id: string;
  name: string;
  packageName: string;
  preview: string;
}

const extensions: Extension[] = [
  {
    id: 'excalidraw',
    name: 'Excalidraw',
    description: 'Embedded whiteboard with remote and delta storage modes.',
    packageName: 'rich-ext-excalidraw',
    preview: 'Whiteboard',
  },
  {
    id: 'diff',
    name: 'Diff Viewer',
    description: 'Side-by-side rich diff with variant and theme support.',
    packageName: 'rich-diff',
    preview: 'Diff',
  },
  {
    id: 'linkcard',
    name: 'Link Card',
    description: 'URL preview cards with extensible plugin matching.',
    packageName: 'rich-renderer-linkcard',
    preview: 'Link',
  },
  {
    id: 'code-snippet',
    name: 'Code Snippet',
    description: 'Syntax-highlighted code blocks with language detection.',
    packageName: 'rich-ext-code-snippet',
    preview: 'Code',
  },
  {
    id: 'gallery',
    name: 'Gallery',
    description: 'Image gallery node with grid and lightbox support.',
    packageName: 'rich-ext-gallery',
    preview: 'Gallery',
  },
];

// ── Excalidraw Demo Data ──────────────────────────────────────

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

// ── Excalidraw Section ────────────────────────────────────────

function ExcalidrawDetail() {
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
      <p style={{ color: 'var(--demo-text-muted)', fontSize: 14 }}>Loading excalidraw editor...</p>
    );
  }

  return (
    <PortalThemeProvider className={getVariantClass('article')} theme={theme}>
      <ColorSchemeProvider colorScheme={theme}>
        <ExcalidrawConfigProvider saveSnapshot={mockSaveSnapshot}>
          <p
            style={{
              margin: '0 0 16px',
              color: 'var(--demo-text-muted)',
              fontSize: 14,
            }}
          >
            Three storage strategies: <strong>Remote</strong> (full snapshot uploaded as blob URL)
            and <strong>Delta</strong> (base ref + JSON diff patch).
          </p>
          <div className="biz-grid">
            <Panel badge="excalidraw" title="Remote Mode">
              <p className="node-description">
                Snapshot uploaded to a blob URL. The editor stores the URL as the snapshot value.
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
                Base snapshot uploaded once. Subsequent saves store only the JSON diff.
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
        </ExcalidrawConfigProvider>
      </ColorSchemeProvider>
    </PortalThemeProvider>
  );
}

// ── LinkCard Section ──────────────────────────────────────────

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
    description: 'doubanBookPlugin matches book.douban.com, merged with built-in 11 plugins',
  },
  {
    key: 'issue',
    label: 'Internal Issue (custom plugin)',
    url: 'https://issues.example.com/PROJ-1234',
    description: 'internalIssuePlugin matches issues.example.com, added alongside built-ins',
  },
  {
    key: 'github',
    label: 'GitHub Repo (builtin)',
    url: 'https://github.com/facebook/react',
    description: 'Built-in gh-repo plugin auto-matches, no extra config needed',
  },
  {
    key: 'github-override',
    label: 'GitHub Repo (overridden)',
    url: 'https://github.com/vercel/next.js',
    description: 'Same-name "gh-repo" plugin overrides the built-in implementation',
    useOverride: true,
  },
  {
    key: 'static',
    label: 'Static fallback (no plugin match)',
    url: 'https://example.com/article',
    title: 'Example Article',
    description: 'Falls back to static props rendering when no plugin matches',
  },
];

function LinkCardDetail() {
  const theme = useTheme();
  const [showOverride, setShowOverride] = useState(false);

  return (
    <>
      <p
        style={{
          margin: '0 0 16px',
          color: 'var(--demo-text-muted)',
          fontSize: 14,
        }}
      >
        <code>plugins</code> prop merges with built-in 11 plugins (same-name overrides, sorted by
        priority).
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
    </>
  );
}

// ── Diff Section ──────────────────────────────────────────────

function DiffDetail() {
  const theme = useTheme();
  const [variant, setVariant] = useState<RichEditorVariant>('comment');
  const [selectedKey, setSelectedKey] = useState(diffSamples[0].key);

  const selected = diffSamples.find((s) => s.key === selectedKey) || diffSamples[0];

  return (
    <>
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
    </>
  );
}

// ── Detail Router ─────────────────────────────────────────────

function ExtensionDetail({ id }: { id: string }) {
  switch (id) {
    case 'excalidraw': {
      return <ExcalidrawDetail />;
    }
    case 'diff': {
      return <DiffDetail />;
    }
    case 'linkcard': {
      return <LinkCardDetail />;
    }
    default: {
      return (
        <p style={{ color: 'var(--demo-text-muted)', fontSize: 14 }}>
          Live demo not yet available for this extension.
        </p>
      );
    }
  }
}

// ── Page ──────────────────────────────────────────────────────

export function ExtensionsPage() {
  const [activeExt, setActiveExt] = useState<string | null>(null);

  return (
    <div className="page">
      <div className="nodes-page-header">
        <h1 className="nodes-page-title">Extensions</h1>
        <p className="nodes-page-desc">
          Heavy or domain-specific extensions that can be loaded on demand.
        </p>
      </div>

      <div className="ext-grid">
        {extensions.map((ext) => (
          <div
            className="ext-card"
            key={ext.id}
            style={activeExt === ext.id ? { borderColor: 'var(--demo-text-muted)' } : undefined}
            onClick={() => setActiveExt(activeExt === ext.id ? null : ext.id)}
          >
            <div className="ext-card-preview">
              <span
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: 'var(--demo-text-muted)',
                  opacity: 0.3,
                  letterSpacing: '-1px',
                }}
              >
                {ext.preview}
              </span>
            </div>
            <div className="ext-card-body">
              <div className="ext-card-name">{ext.name}</div>
              <div className="ext-card-desc">{ext.description}</div>
              <span className="ext-card-tag">@haklex/{ext.packageName}</span>
            </div>
          </div>
        ))}
      </div>

      {activeExt && (
        <div className="ext-detail">
          <ExtensionDetail id={activeExt} />
        </div>
      )}
    </div>
  );
}
