import '@haklex/rich-diff/style.css';

import { createAgentStore, createReviewBatch } from '@haklex/rich-agent-core';
import { RichRenderer } from '@haklex/rich-compose';
import { RichDiff } from '@haklex/rich-diff';
import type { RichEditorVariant } from '@haklex/rich-editor';
import { ColorSchemeProvider, getVariantClass } from '@haklex/rich-editor';
import { AgentDiffEditNode, DiffReviewOverlayPlugin } from '@haklex/rich-ext-ai-agent';
import type { ChatMessage, ChatParticipant, ChatVariant } from '@haklex/rich-ext-chat';
import { ChatRenderer } from '@haklex/rich-ext-chat/static';
import type { CodeFile } from '@haklex/rich-ext-code-snippet';
import { CodeSnippetRenderer } from '@haklex/rich-ext-code-snippet/static';
import type { ExcalidrawEditRendererProps, ExcalidrawSnapshot } from '@haklex/rich-ext-excalidraw';
import { ExcalidrawConfigProvider } from '@haklex/rich-ext-excalidraw/static';
import type { GalleryImage, GalleryRendererProps } from '@haklex/rich-ext-gallery';
import { GalleryRenderer } from '@haklex/rich-ext-gallery/static';
import {
  type NestedDocDialogEditorProps,
  NestedDocDialogEditorProvider,
  NestedDocPlugin,
} from '@haklex/rich-ext-nested-doc';
import { ToolbarPlugin } from '@haklex/rich-plugin-toolbar';
import { LinkCardRenderer } from '@haklex/rich-renderer-linkcard/static';
import { MermaidEditRenderer, MermaidRenderer } from '@haklex/rich-renderer-mermaid';
import { PortalThemeProvider } from '@haklex/rich-style-token';
import type { SerializedEditorState } from 'lexical';
import { type FC, useCallback, useEffect, useMemo, useState } from 'react';

import { Panel } from '../components/Panel';
import { useFullWidth } from '../context/FullWidthContext';
import { useTheme } from '../context/ThemeContext';
import { diffSamples } from '../fixtures/diff-samples';
import { customGithubRepoPlugin, extraLinkCardPlugins } from '../fixtures/extra-linkcard-plugins';
import { liteXmlPasteSample } from '../fixtures/litexml-paste-sample';
import { LexicalEditor } from '../lexical';

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
    id: 'litexml-import',
    name: 'LiteXML Import',
    description: 'Plain-text XML paste path for Markdown Flavor LiteXML nodes.',
    packageName: 'rich-litexml',
    preview: 'XML',
  },
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
    id: 'agent-diff-node',
    name: 'Agent Diff Node',
    description: 'Reviewable AI-edit proposal rendered as a real Lexical node.',
    packageName: 'rich-ext-ai-agent',
    preview: 'Agent Diff',
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
  {
    id: 'mermaid',
    name: 'Mermaid',
    description: 'Sync SVG diagram rendering powered by beautiful-mermaid.',
    packageName: 'rich-renderer-mermaid',
    preview: 'Mermaid',
  },
];

const liteXmlEditorExtraNodes = [AgentDiffEditNode];

function demoTextNode(text: string, format = 0) {
  return {
    type: 'text',
    text,
    detail: 0,
    format,
    mode: 'normal',
    style: '',
    version: 1,
  };
}

function demoParagraph(text: string, blockId: string) {
  return {
    type: 'paragraph',
    children: [demoTextNode(text)],
    direction: 'ltr',
    format: '',
    indent: 0,
    textFormat: 0,
    textStyle: '',
    version: 1,
    $: { blockId },
  };
}

const liteXmlInitialContent: SerializedEditorState = {
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  },
};

const liteXmlInsertItemOrder = [
  'Image',
  'Code Block',
  'Table',
  'Link Card',
  'Callout',
  'Banner',
  'Gallery',
  'Video',
  'Mermaid Diagram',
  'Code Snippet',
  'Embed',
  'Whiteboard',
  'Nested Document',
];

function LiteXmlNestedDocDialogEditor({ initialValue, onEditorReady }: NestedDocDialogEditorProps) {
  return (
    <LexicalEditor
      header={<ToolbarPlugin insertItemOrder={liteXmlInsertItemOrder} maxVisibleInsertItems={5} />}
      initialValue={initialValue}
      onEditorReady={onEditorReady}
    />
  );
}

// ── LiteXML Import Section ───────────────────────────────────

function LiteXmlImportDetail() {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);

  return (
    <NestedDocDialogEditorProvider value={LiteXmlNestedDocDialogEditor}>
      <div className="biz-grid">
        <Panel
          badge="xml"
          title="Markdown Flavor LiteXML"
          headerExtra={
            <button
              className="btn btn-sm"
              onClick={() => {
                void navigator.clipboard.writeText(liteXmlPasteSample).then(() => {
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1200);
                });
              }}
            >
              {copied ? 'Copied' : 'Copy XML'}
            </button>
          }
        >
          <textarea
            readOnly
            className="import-textarea litexml-sample-textarea"
            rows={22}
            value={liteXmlPasteSample}
          />
        </Panel>

        <Panel badge="editor" bodyStyle={{ padding: 0 }} title="Paste Target">
          <LexicalEditor
            extraNodes={liteXmlEditorExtraNodes}
            initialValue={liteXmlInitialContent}
            placeholder="Paste XML plain text here..."
            theme={theme}
            variant="article"
            header={
              <ToolbarPlugin insertItemOrder={liteXmlInsertItemOrder} maxVisibleInsertItems={5} />
            }
          >
            <NestedDocPlugin />
          </LexicalEditor>
        </Panel>
      </div>
    </NestedDocDialogEditorProvider>
  );
}

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

// ── Agent Diff Node Section ──────────────────────────────────

const agentDiffBaseContent: SerializedEditorState = {
  root: {
    type: 'root',
    children: [
      demoParagraph(
        'The agent proposes changes as persistent Lexical nodes, not external overlay DOM.',
        'agent-diff-source-1',
      ),
      demoParagraph(
        'Pending proposals remain reviewable while undo and redo can traverse the node insertion.',
        'agent-diff-source-2',
      ),
      demoParagraph(
        'The next agent turn should read the factual document by projecting pending diff nodes back to the pre-accept side.',
        'agent-diff-source-3',
      ),
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  },
};

const agentDiffOperations = [
  {
    op: 'replace' as const,
    blockId: 'agent-diff-source-1',
    node: demoParagraph(
      'The agent now proposes changes as durable Lexical diff nodes with real document placement.',
      'agent-diff-source-1',
    ),
  },
  {
    op: 'insert' as const,
    position: { type: 'after' as const, blockId: 'agent-diff-source-2' },
    node: demoParagraph(
      'Inserted proposals occupy their final document position before acceptance.',
      'agent-diff-inserted-1',
    ),
  },
  {
    op: 'delete' as const,
    blockId: 'agent-diff-source-3',
  },
];

function AgentDiffSeed({ store }: { store: ReturnType<typeof createAgentStore> }) {
  useEffect(() => {
    const batch = createReviewBatch(agentDiffOperations, agentDiffBaseContent, 0);
    store.getState().setReviewState({ documentRevision: 0, batches: [] });
    store.getState().addReviewBatch(batch);
  }, [store]);

  return null;
}

function AgentDiffNodeDetail() {
  const theme = useTheme();
  const store = useMemo(() => createAgentStore(), []);

  return (
    <Panel badge={`real node · ${theme}`} bodyStyle={{ padding: 0 }} title="AI Agent Diff Node">
      <LexicalEditor
        extraNodes={[AgentDiffEditNode]}
        header={<ToolbarPlugin />}
        initialValue={agentDiffBaseContent}
        placeholder="Agent diff node demo"
        theme={theme}
        variant="article"
      >
        <DiffReviewOverlayPlugin store={store} />
        <AgentDiffSeed store={store} />
      </LexicalEditor>
    </Panel>
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

// ── Mermaid Section ───────────────────────────────────────────

interface MermaidSample {
  code: string;
  description: string;
  key: string;
  label: string;
}

const mermaidSamples: MermaidSample[] = [
  {
    key: 'flowchart-td',
    label: 'Flowchart · TD',
    description: 'Top-down flowchart with a decision branch.',
    code: `flowchart TD
  A[Start] --> B{Decision}
  B -->|Yes| C[Action]
  B -->|No| D[Skip]
  C --> E[End]
  D --> E`,
  },
  {
    key: 'flowchart-lr',
    label: 'Flowchart · LR',
    description: 'Left-to-right data pipeline.',
    code: `flowchart LR
  A[Source] --> B[Transform]
  B --> C[Filter]
  C --> D[Sink]`,
  },
  {
    key: 'state',
    label: 'State Diagram',
    description: 'Finite state machine with retry loop.',
    code: `stateDiagram-v2
  [*] --> Idle
  Idle --> Loading: fetch
  Loading --> Success: ok
  Loading --> Error: fail
  Error --> Idle: retry
  Success --> [*]`,
  },
  {
    key: 'sequence',
    label: 'Sequence',
    description: 'Cross-actor interactions over time.',
    code: `sequenceDiagram
  participant C as Client
  participant S as Server
  participant DB
  C->>S: POST /login
  S->>DB: SELECT user
  DB-->>S: row
  S-->>C: JWT`,
  },
  {
    key: 'class',
    label: 'Class Diagram',
    description: 'UML-style class hierarchy.',
    code: `classDiagram
  class Node {
    +String type
    +clone() Node
  }
  class DecoratorNode {
    +decorate() ReactElement
  }
  class MermaidNode {
    -String diagram
  }
  Node <|-- DecoratorNode
  DecoratorNode <|-- MermaidNode`,
  },
  {
    key: 'er',
    label: 'ER Diagram',
    description: 'Entity-relationship between database tables.',
    code: `erDiagram
  USER ||--o{ POST : writes
  POST ||--|{ COMMENT : has
  USER {
    string name
    string email
  }
  POST {
    string title
    text body
  }
  COMMENT {
    text body
  }`,
  },
  {
    key: 'xy-bar',
    label: 'XY Chart · Bar',
    description: 'Categorical bar chart.',
    code: `xychart-beta
  title "Monthly Downloads"
  x-axis [Jan, Feb, Mar, Apr, May, Jun]
  y-axis "Count" 0 --> 12000
  bar [5200, 7100, 8400, 6800, 9600, 11200]`,
  },
  {
    key: 'xy-line',
    label: 'XY Chart · Line',
    description: 'Continuous trend line.',
    code: `xychart-beta
  title "Active Users"
  x-axis [W1, W2, W3, W4, W5, W6]
  y-axis "Users" 0 --> 1500
  line [320, 460, 580, 720, 980, 1280]`,
  },
];

function MermaidDetail() {
  const theme = useTheme();
  const [editContent, setEditContent] = useState(mermaidSamples[0].code);

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
          Sync SVG rendering via <code>beautiful-mermaid</code>. Supported types: flowchart, state,
          sequence, class, ER, XY chart. Unsupported in this engine: gantt, pie, gitGraph, journey,
          mindmap, timeline.
        </p>

        <div className="biz-masonry">
          {mermaidSamples.map((sample) => (
            <Panel badge={`mermaid · ${sample.key}`} key={sample.key} title={sample.label}>
              <p className="node-description">{sample.description}</p>
              <div
                className={`node-render ${getVariantClass('article')}`}
                data-color-scheme={theme}
                data-theme={theme}
              >
                <MermaidRenderer content={sample.code} />
              </div>
            </Panel>
          ))}

          <Panel badge="mermaid · edit" title="Edit Mode">
            <p className="node-description">
              Hover the diagram to reveal the Edit button. The dialog opens a code editor with live
              preview, templates, copy, and SVG download.
            </p>
            <div
              className={`node-render ${getVariantClass('article')}`}
              data-color-scheme={theme}
              data-theme={theme}
            >
              <MermaidEditRenderer content={editContent} onContentChange={setEditContent} />
            </div>
          </Panel>
        </div>
      </ColorSchemeProvider>
    </PortalThemeProvider>
  );
}

// ── Detail Router ─────────────────────────────────────────────

function ExtensionDetail({ id }: { id: string }) {
  switch (id) {
    case 'litexml-import': {
      return <LiteXmlImportDetail />;
    }
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
    case 'agent-diff-node': {
      return <AgentDiffNodeDetail />;
    }
    case 'gallery': {
      return <GalleryDetail />;
    }
    case 'linkcard': {
      return <LinkCardDetail />;
    }
    case 'mermaid': {
      return <MermaidDetail />;
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
