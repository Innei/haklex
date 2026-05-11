import '@haklex/rich-diff/style.css';

import { RichRenderer } from '@haklex/rich-compose';
import { RichDiff } from '@haklex/rich-diff';
import type { RichEditorVariant } from '@haklex/rich-editor';
import { ColorSchemeProvider, getVariantClass } from '@haklex/rich-editor';
import type { ChatMessage, ChatParticipant, ChatVariant } from '@haklex/rich-ext-chat';
import { ChatRenderer } from '@haklex/rich-ext-chat/static';
import type { CodeFile } from '@haklex/rich-ext-code-snippet';
import { CodeSnippetRenderer } from '@haklex/rich-ext-code-snippet/static';
import type { ExcalidrawEditRendererProps, ExcalidrawSnapshot } from '@haklex/rich-ext-excalidraw';
import { ExcalidrawConfigProvider } from '@haklex/rich-ext-excalidraw/static';
import type { GalleryImage, GalleryRendererProps } from '@haklex/rich-ext-gallery';
import { GalleryRenderer } from '@haklex/rich-ext-gallery/static';
import { LinkCardRenderer } from '@haklex/rich-renderer-linkcard/static';
import { PortalThemeProvider } from '@haklex/rich-style-token';
import { type FC, useCallback, useState } from 'react';

import { Panel } from '../components/Panel';
import { useFullWidth } from '../context/FullWidthContext';
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
  {
    id: 'chat',
    name: 'Chat',
    description: 'Static chat-snapshot node with user-agent and user-user variants.',
    packageName: 'rich-ext-chat',
    preview: 'Chat',
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
  // ── compact: github family ──
  {
    key: 'gh-repo',
    label: 'GitHub Repo',
    url: 'https://github.com/facebook/react',
    description: 'shape=compact · gh-repo · star count + description',
  },
  {
    key: 'gh-pr',
    label: 'GitHub PR',
    url: 'https://github.com/facebook/react/pull/28000',
    description: 'shape=compact · gh-pr · state badge + diff stats',
  },
  {
    key: 'gh-issue',
    label: 'GitHub Issue',
    url: 'https://github.com/facebook/react/issues/26380',
    description: 'shape=compact · gh-issue · state + repo path',
  },
  {
    key: 'gh-commit',
    label: 'GitHub Commit',
    url: 'https://github.com/facebook/react/commit/4ea0b8c',
    description: 'shape=compact · gh-commit · sha + diff stats',
  },
  {
    key: 'gh-discussion',
    label: 'GitHub Discussion',
    url: 'https://github.com/vercel/next.js/discussions/55205',
    description: 'shape=compact · gh-discussion · category badge',
  },

  // ── expanded ──
  {
    key: 'arxiv',
    label: 'arXiv Paper',
    url: 'https://arxiv.org/abs/1706.03762',
    description: 'shape=expanded · mono id badge · 3-line abstract',
  },

  // ── wide ──
  {
    key: 'leetcode',
    label: 'LeetCode Problem',
    url: 'https://leetcode.cn/problems/two-sum/',
    description: 'shape=wide · difficulty color + tags + AR',
  },
  {
    key: 'netease',
    label: 'Netease Music Song',
    url: 'https://music.163.com/song?id=186016',
    description: 'shape=wide · block desc (歌手 / 专辑)',
  },
  {
    key: 'qq-music',
    label: 'QQ Music Song',
    url: 'https://y.qq.com/n/ryqq/songDetail/001Qu4I30eVFYb',
    description: 'shape=wide · block desc (歌手 / 专辑)',
  },

  // ── poster ──
  {
    key: 'bangumi',
    label: 'Bangumi Subject',
    url: 'https://bgm.tv/subject/253',
    description: 'shape=poster · vertical poster + rating',
  },
  {
    key: 'tmdb-movie',
    label: 'TMDB Movie',
    url: 'https://www.themoviedb.org/movie/129',
    description: 'shape=poster · vertical poster + ★ rating',
  },
  {
    key: 'tmdb-tv',
    label: 'TMDB TV',
    url: 'https://www.themoviedb.org/tv/72636',
    description: 'shape=poster · vertical poster + ★ rating',
  },

  // ── custom plugin examples ──
  {
    key: 'douban',
    label: 'Douban Book (custom plugin)',
    url: 'https://book.douban.com/subject/1477390',
    description: 'shape=poster · custom plugin merged into builtins',
  },
  {
    key: 'issue',
    label: 'Internal Issue (custom plugin)',
    url: 'https://issues.example.com/PROJ-1234',
    description: 'shape=compact · custom plugin added alongside builtins',
  },
  {
    key: 'github-override',
    label: 'GitHub Repo (overridden)',
    url: 'https://github.com/vercel/next.js',
    description: 'Same-name "gh-repo" overrides the built-in implementation',
    useOverride: true,
  },

  // ── fallback / error ──
  {
    key: 'static',
    label: 'Static fallback (no plugin match)',
    url: 'https://example.com/article',
    title: 'Example Article',
    description: 'Falls back to static props rendering when no plugin matches',
  },
  {
    key: 'error',
    label: 'Error state (404 repo)',
    url: 'https://github.com/this-org-does-not-exist-xyz/no-repo',
    description: 'fetch fail → dashed degraded link with host + hint',
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

// ── Chat Section ──────────────────────────────────────────────

interface ChatSample {
  description: string;
  key: string;
  label: string;
  messages: ChatMessage[];
  participants: ChatParticipant[];
  variant: ChatVariant;
}

const chatSamples: ChatSample[] = [
  {
    key: 'user-agent',
    label: 'User · Agent',
    description: 'User as right-aligned bubble; agent as flowing article',
    variant: 'user-agent',
    participants: [
      { id: 'p_u', kind: 'user', name: 'Innei' },
      { id: 'p_a', kind: 'agent', name: 'Claude' },
    ],
    messages: [
      {
        id: 'm1',
        participantId: 'p_u',
        content: "How does Lexical's DecoratorNode differ from ElementNode?",
      },
      {
        id: 'm2',
        participantId: 'p_a',
        content:
          "The two serve different purposes:\n\n- **ElementNode** contains other nodes — paragraphs, headings, lists.\n- **DecoratorNode** renders a React component as a leaf — polls, embeds, charts.\n\nUse a decorator when the content isn't editable as text.",
      },
      {
        id: 'm3',
        participantId: 'p_u',
        content: 'Got it. So for the chat node we should subclass DecoratorNode.',
      },
    ],
  },
  {
    key: 'user-user',
    label: 'User · User',
    description: 'Two-person dialogue — both sides as bubbles',
    variant: 'user-user',
    participants: [
      { id: 'p_alice', kind: 'user', name: 'Alice' },
      { id: 'p_bob', kind: 'user', name: 'Bob' },
    ],
    messages: [
      {
        id: 'm1',
        participantId: 'p_alice',
        content: 'Are we still doing the static/edit split for the new chat node?',
      },
      {
        id: 'm2',
        participantId: 'p_bob',
        content: 'Yes — same pattern as code-snippet.',
      },
      {
        id: 'm3',
        participantId: 'p_alice',
        content: 'Perfect. Should I open a draft PR?',
      },
      {
        id: 'm4',
        participantId: 'p_bob',
        content: "Hold on — let's get the spec approved first.",
      },
    ],
  },
];

function ChatDetail() {
  const theme = useTheme();

  return (
    <>
      <p
        style={{
          margin: '0 0 16px',
          color: 'var(--demo-text-muted)',
          fontSize: 14,
        }}
      >
        <code>variant</code> selects the layout. <strong>user-agent</strong> stylises agent replies
        as flowing prose; <strong>user-user</strong> renders both speakers as bubbles. Markdown is
        rendered via
        <code> streamdown</code>.
      </p>

      <div className="biz-grid">
        {chatSamples.map((sample) => (
          <Panel badge={`chat · ${sample.variant}`} key={sample.key} title={sample.label}>
            <p className="node-description">{sample.description}</p>
            <div
              className={`node-render ${getVariantClass('article')}`}
              data-color-scheme={theme}
              data-theme={theme}
              style={{ marginTop: 8 }}
            >
              <ChatRenderer
                messages={sample.messages}
                participants={sample.participants}
                variant={sample.variant}
              />
            </div>
          </Panel>
        ))}
      </div>
    </>
  );
}

// ── Code Snippet Section ──────────────────────────────────────

interface CodeSnippetSample {
  description: string;
  files: CodeFile[];
  key: string;
  label: string;
}

const codeSnippetSamples: CodeSnippetSample[] = [
  {
    key: 'single',
    label: 'Single File',
    description: 'A single TypeScript module rendered with shiki dual-theme highlighting.',
    files: [
      {
        filename: 'fibonacci.ts',
        language: 'typescript',
        code: `export function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // 55`,
      },
    ],
  },
  {
    key: 'multi',
    label: 'Multi-File Tabs',
    description: 'Multiple files share a tab strip; click to switch active file.',
    files: [
      {
        filename: 'index.ts',
        language: 'typescript',
        code: `export function hello(name: string): string {
  return \`Hello, \${name}!\`;
}`,
      },
      {
        filename: 'index.test.ts',
        language: 'typescript',
        code: `import { hello } from './index';

test('greets', () => {
  expect(hello('World')).toBe('Hello, World!');
});`,
      },
      {
        filename: 'README.md',
        language: 'markdown',
        code: `# Hello Module

A trivial greeter for the **rich-ext-code-snippet** demo.`,
      },
    ],
  },
];

interface CodeSnippetEditRendererComponent {
  (props: { files: CodeFile[]; onFilesChange?: (files: CodeFile[]) => void }): ReturnType<FC>;
}

function CodeSnippetDetail() {
  const theme = useTheme();
  const [editFiles, setEditFiles] = useState<CodeFile[]>(codeSnippetSamples[1].files);
  const [EditRenderer, setEditRenderer] = useState<CodeSnippetEditRendererComponent | null>(null);
  const [loaded, setLoaded] = useState(false);

  if (!loaded) {
    import('@haklex/rich-ext-code-snippet/edit').then((mod) => {
      setEditRenderer(() => mod.CodeSnippetEditRenderer);
      setLoaded(true);
    });
  }

  return (
    <PortalThemeProvider className={getVariantClass('article')} theme={theme}>
      <ColorSchemeProvider colorScheme={theme}>
        <p
          style={{
            margin: '0 0 16px',
            color: 'var(--demo-text-muted)',
            fontSize: 14,
          }}
        >
          Static renderer uses <code>shiki</code> with dual light/dark themes. The edit variant
          overlays an <strong>Edit</strong> button that opens a CodeMirror modal for tab-based
          multi-file editing.
        </p>

        <div className="biz-grid">
          {codeSnippetSamples.map((sample) => (
            <Panel
              badge={`code-snippet · ${sample.files.length} file${sample.files.length > 1 ? 's' : ''}`}
              key={sample.key}
              title={sample.label}
            >
              <p className="node-description">{sample.description}</p>
              <div
                className={`node-render ${getVariantClass('article')}`}
                data-color-scheme={theme}
                data-theme={theme}
              >
                <CodeSnippetRenderer files={sample.files} />
              </div>
            </Panel>
          ))}

          <Panel badge="code-snippet · edit" title="Edit Mode">
            <p className="node-description">
              Hover the snippet to reveal the Edit button. Saves write back into the editable state
              — try renaming a file or modifying the code.
            </p>
            <div
              className={`node-render ${getVariantClass('article')}`}
              data-color-scheme={theme}
              data-theme={theme}
            >
              {EditRenderer ? (
                <EditRenderer files={editFiles} onFilesChange={setEditFiles} />
              ) : (
                <p style={{ color: 'var(--demo-text-muted)', fontSize: 14 }}>
                  Loading edit renderer...
                </p>
              )}
            </div>
          </Panel>
        </div>
      </ColorSchemeProvider>
    </PortalThemeProvider>
  );
}

// ── Gallery Section ───────────────────────────────────────────

const galleryLayouts = ['grid', 'masonry', 'carousel'] as const;
type GalleryLayout = (typeof galleryLayouts)[number];

const galleryStaticImages: GalleryImage[] = [
  {
    src: 'https://picsum.photos/id/1015/800/520',
    alt: 'Mountain river',
    width: 800,
    height: 520,
  },
  { src: 'https://picsum.photos/id/1018/800/520', alt: 'Misty peaks', width: 800, height: 520 },
  { src: 'https://picsum.photos/id/1019/800/520', alt: 'Forest lake', width: 800, height: 520 },
  { src: 'https://picsum.photos/id/1039/800/520', alt: 'Coastline', width: 800, height: 520 },
];

const galleryEditInitial: GalleryImage[] = [
  { src: 'https://picsum.photos/id/1043/800/520', alt: 'Field', width: 800, height: 520 },
  { src: 'https://picsum.photos/id/1059/800/520', alt: 'Snow', width: 800, height: 520 },
  { src: 'https://picsum.photos/id/1062/800/520', alt: 'Clouds', width: 800, height: 520 },
];

function GalleryDetail() {
  const theme = useTheme();
  const [staticLayout, setStaticLayout] = useState<GalleryLayout>('grid');
  const [editImages, setEditImages] = useState<GalleryImage[]>(galleryEditInitial);
  const [editLayout, setEditLayout] = useState<GalleryLayout>('grid');
  const [EditRenderer, setEditRenderer] = useState<FC<GalleryRendererProps> | null>(null);
  const [loaded, setLoaded] = useState(false);

  if (!loaded) {
    import('@haklex/rich-ext-gallery').then((mod) => {
      setEditRenderer(() => mod.GalleryEditRenderer);
      setLoaded(true);
    });
  }

  return (
    <PortalThemeProvider className={getVariantClass('article')} theme={theme}>
      <ColorSchemeProvider colorScheme={theme}>
        <p
          style={{
            margin: '0 0 16px',
            color: 'var(--demo-text-muted)',
            fontSize: 14,
          }}
        >
          Three layouts: <strong>Grid</strong> (uniform columns), <strong>Masonry</strong> (variable
          height), <strong>Carousel</strong> (horizontal scroll with autoplay and indicators). Click
          any image to open the lightbox.
        </p>

        <div className="toolbar" style={{ marginBottom: 16 }}>
          <div className="toolbar-group">
            <span className="toolbar-label">Layout</span>
            {galleryLayouts.map((l) => (
              <button
                className={staticLayout === l ? 'btn btn-active' : 'btn'}
                key={l}
                onClick={() => setStaticLayout(l)}
              >
                {l[0].toUpperCase() + l.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <Panel badge={`gallery · ${staticLayout}`} title="Static Renderer">
          <p className="node-description">
            Read-only display. Carousel mode autoplays with bidirectional scroll until the user
            interacts.
          </p>
          <div
            className={`node-render ${getVariantClass('article')}`}
            data-color-scheme={theme}
            data-theme={theme}
          >
            <GalleryRenderer images={galleryStaticImages} layout={staticLayout} />
          </div>
        </Panel>

        <div style={{ height: 16 }} />

        <Panel badge={`gallery · edit · ${editLayout}`} title="Edit Mode">
          <p className="node-description">
            Hover to reveal the Edit button. The dialog supports drag-reorder, add/remove, and a
            segmented control for layout switching.
          </p>
          <div
            className={`node-render ${getVariantClass('article')}`}
            data-color-scheme={theme}
            data-theme={theme}
          >
            {EditRenderer ? (
              <EditRenderer
                images={editImages}
                layout={editLayout}
                onImagesChange={setEditImages}
                onLayoutChange={setEditLayout}
              />
            ) : (
              <p style={{ color: 'var(--demo-text-muted)', fontSize: 14 }}>
                Loading edit renderer...
              </p>
            )}
          </div>
        </Panel>
      </ColorSchemeProvider>
    </PortalThemeProvider>
  );
}

// ── Detail Router ─────────────────────────────────────────────

function ExtensionDetail({ id }: { id: string }) {
  switch (id) {
    case 'chat': {
      return <ChatDetail />;
    }
    case 'code-snippet': {
      return <CodeSnippetDetail />;
    }
    case 'excalidraw': {
      return <ExcalidrawDetail />;
    }
    case 'diff': {
      return <DiffDetail />;
    }
    case 'gallery': {
      return <GalleryDetail />;
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
  useFullWidth();
  const [activeExt, setActiveExt] = useState<string>(extensions[0].id);
  const active = extensions.find((e) => e.id === activeExt) || extensions[0];

  return (
    <div className="ext-layout">
      <aside className="ext-sidebar">
        <div className="sidebar-header">
          <span className="sidebar-label">Extensions</span>
        </div>
        <div className="sidebar-list">
          {extensions.map((ext) => (
            <button
              className={activeExt === ext.id ? 'sidebar-item sidebar-item-active' : 'sidebar-item'}
              key={ext.id}
              onClick={() => setActiveExt(ext.id)}
            >
              <div className="sidebar-item-name">{ext.name}</div>
              <div className="sidebar-item-desc">{ext.description}</div>
            </button>
          ))}
        </div>
      </aside>

      <div className="ext-detail">
        <div className="ext-detail-header">
          <h2 className="ext-detail-title">{active.name}</h2>
          <span className="ext-detail-tag">@haklex/{active.packageName}</span>
        </div>
        <p className="ext-detail-desc">{active.description}</p>
        <ExtensionDetail id={active.id} />
      </div>
    </div>
  );
}
