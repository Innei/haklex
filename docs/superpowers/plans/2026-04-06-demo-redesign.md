# Demo Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the haklex demo from 7 flat pages into a polished 4-page showcase with minimal monochrome visual style.

**Architecture:** Replace the current flat nav + 7 independent pages with a 4-tab top nav (Playground / Nodes / Extensions / AI). Playground consolidates Editor + Presets + Comments with an internal segmented control. Visual tokens shift from teal/pink to monochrome black/white. Logo is an SVG angle-bracket + sparkle icon.

**Tech Stack:** React 19, React Router 7, plain CSS (demo.css), Vanilla Extract for component-specific styles, Lexical 0.42, existing @haklex workspace packages.

---

## File Structure

### New files

- `demo/src/components/Logo.tsx` — SVG logo component
- `demo/src/pages/PlaygroundPage.tsx` — consolidated editor/presets/comments page
- `demo/src/pages/ExtensionsPage.tsx` — heavy extensions showcase (from BizPage content)

### Modified files

- `demo/src/App.tsx` — new nav items, routes, header redesign
- `demo/src/demo.css` — token overhaul, new component styles, remove deprecated styles
- `demo/src/pages/NodeShowcase.tsx` — card redesign with expand/collapse
- `demo/src/pages/AgentPage.tsx` — layout adjustments (full-bleed, chat pane width)

### Removed files (delete)

- `demo/src/pages/DesignPage.tsx`
- `demo/src/pages/DesignPage.css.ts`
- `demo/src/pages/BizPage.tsx`
- `demo/src/pages/EditorPage.tsx` (replaced by PlaygroundPage)
- `demo/src/pages/PresetsPage.tsx` (merged into PlaygroundPage)
- `demo/src/pages/CommentsPage.tsx` (merged into PlaygroundPage)
- `demo/src/pages/DiffPage.tsx` (merged into ExtensionsPage)
- `demo/src/pages/LinkCardPluginsPage.tsx` (merged into ExtensionsPage)

### Unchanged files (reused as-is)

- `demo/src/components/JsonViewer.tsx`
- `demo/src/components/Panel.tsx`
- `demo/src/components/comments/*` (all 4 comment components)
- `demo/src/context/ThemeContext.tsx`
- `demo/src/fixtures/*` (all fixture files)
- `demo/src/main.tsx`

---

## Task 1: CSS Token Overhaul

**Files:**

- Modify: `demo/src/demo.css`

- [ ] **Step 1: Replace color tokens in `:root`**

Replace the `:root` block in `demo/src/demo.css`:

```css
:root {
  --demo-bg: #fafafa;
  --demo-surface: #fff;
  --demo-surface-alt: #fafafa;
  --demo-text: #171717;
  --demo-text-secondary: #525252;
  --demo-text-muted: #a3a3a3;
  --demo-border: #e5e5e5;
  --demo-border-light: #f5f5f5;
  --demo-hover: #f5f5f5;
  --demo-accent: #171717;
  --demo-accent-bg: rgba(23, 23, 23, 0.06);
  --demo-code-bg: #1a1a2e;
  --demo-code-text: #a5d6ff;

  color-scheme: light dark;
}
```

- [ ] **Step 2: Replace dark theme tokens**

Replace the `[data-theme='dark']` block:

```css
[data-theme='dark'] {
  --demo-bg: #0a0a0a;
  --demo-surface: #141414;
  --demo-surface-alt: #0a0a0a;
  --demo-text: #fafafa;
  --demo-text-secondary: #a3a3a3;
  --demo-text-muted: #525252;
  --demo-border: #262626;
  --demo-border-light: #262626;
  --demo-hover: #262626;
  --demo-accent: #fafafa;
  --demo-accent-bg: rgba(250, 250, 250, 0.06);
  --demo-code-bg: #0a0a0a;
  --demo-code-text: #e5e5e5;
}
```

- [ ] **Step 3: Verify dev server renders correctly**

Run: `cd /Users/innei/git/innei-repo/haklex && pnpm dev`

Open http://localhost:5188 — confirm the page loads without errors and the teal/pink colors are gone, replaced by neutral monochrome tones. Both light and dark themes should look correct.

- [ ] **Step 4: Commit**

```bash
git add demo/src/demo.css
git commit -m "refactor(demo): replace teal/pink accent tokens with monochrome palette"
```

---

## Task 2: Logo Component

**Files:**

- Create: `demo/src/components/Logo.tsx`

- [ ] **Step 1: Create the Logo component**

Create `demo/src/components/Logo.tsx`:

```tsx
interface LogoProps {
  size?: number;
}

export function Logo({ size = 20 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-label="haklex logo">
      <rect width="32" height="32" rx="7" fill="currentColor" />
      <path
        d="M12.5 10L8 16L12.5 22"
        stroke="var(--demo-bg)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M19.5 10L24 16L19.5 22"
        stroke="var(--demo-bg)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M16 12 L16.8 14.8 L19 16 L16.8 17.2 L16 20 L15.2 17.2 L13 16 L15.2 14.8 Z"
        fill="var(--demo-bg)"
      />
    </svg>
  );
}
```

- [ ] **Step 2: Lint**

Run: `npx eslint demo/src/components/Logo.tsx`

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add demo/src/components/Logo.tsx
git commit -m "feat(demo): add Logo SVG component with angle brackets + sparkle"
```

---

## Task 3: Header & Navigation Redesign

**Files:**

- Modify: `demo/src/App.tsx`
- Modify: `demo/src/demo.css`

- [ ] **Step 1: Update nav items and header in App.tsx**

In `demo/src/App.tsx`, replace the `navItems` array:

```tsx
const navItems = [
  { path: '/', label: 'Playground' },
  { path: '/nodes', label: 'Nodes' },
  { path: '/extensions', label: 'Extensions' },
  { path: '/ai', label: 'AI' },
] as const;
```

Add the Logo import at the top imports:

```tsx
import { Logo } from './components/Logo';
```

- [ ] **Step 2: Rewrite the header JSX in Layout**

Replace the `<header>` block inside the `Layout` function with:

```tsx
<header
  className="app-header"
  ref={headerRef}
  style={{ left: 0, position: 'fixed', right: 0, top: 0 }}
>
  <div className="app-header-content">
    <Link to="/" className="app-logo">
      <Logo size={20} />
      <span className="app-logo-text">haklex</span>
    </Link>
    <nav className="app-nav">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={isActivePath(item.path) ? 'nav-tab nav-tab-active' : 'nav-tab'}
        >
          {item.label}
        </Link>
      ))}
    </nav>
    <div className="app-header-right">
      <a
        className="nav-github-link"
        href="https://github.com/user/haklex"
        target="_blank"
        rel="noreferrer"
      >
        GitHub
      </a>
      <button className="nav-theme-toggle" title={themeLabel} onClick={cycleTheme}>
        <ThemeIcon size={16} />
      </button>
    </div>
  </div>
</header>
```

- [ ] **Step 3: Update header CSS**

In `demo/src/demo.css`, replace the header-related styles (`.app-header` through `.nav-theme-toggle:hover`) with:

```css
.app-header {
  background: var(--demo-surface);
  border-bottom: 1px solid var(--demo-border);
  position: sticky;
  top: 0;
  z-index: 2;
}

.app-header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.app-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--demo-text);
}

.app-logo-text {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.3px;
}

.app-nav {
  display: flex;
  gap: 2px;
  align-items: center;
}

.nav-tab {
  display: inline-block;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  border: none;
  background: none;
  color: var(--demo-text-muted);
  text-decoration: none;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.15s;
  font-family: inherit;
}

.nav-tab:visited {
  color: var(--demo-text-muted);
}

.nav-tab:hover {
  background: var(--demo-hover);
  color: var(--demo-text);
}

.nav-tab-active {
  background: var(--demo-accent-bg);
  color: var(--demo-text);
  font-weight: 600;
}

.nav-tab-active:visited {
  color: var(--demo-text);
}

.app-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-github-link {
  font-size: 13px;
  color: var(--demo-text-muted);
  text-decoration: none;
  padding: 6px 12px;
  border: 1px solid var(--demo-border);
  border-radius: 6px;
  font-weight: 500;
}

.nav-github-link:hover {
  color: var(--demo-text);
  border-color: var(--demo-text-muted);
}

.nav-theme-toggle {
  width: 32px;
  height: 32px;
  border: 1px solid var(--demo-border);
  border-radius: 6px;
  background: transparent;
  color: var(--demo-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transition: all 0.15s;
}

.nav-theme-toggle:hover {
  background: var(--demo-hover);
  color: var(--demo-text);
}
```

Also remove the `.nav-divider`, `.app-title`, `.app-subtitle` CSS rules — they are no longer used.

- [ ] **Step 4: Remove old header elements**

In `App.tsx`, remove the `<h1 className="app-title">` and `<p className="app-subtitle">` JSX if still present. Remove the `.nav-divider` element.

- [ ] **Step 5: Update `isActivePath` for root route**

The Playground is now at `/`, so update `isActivePath` to handle root:

```tsx
const isActivePath = useCallback(
  (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  },
  [location.pathname],
);
```

- [ ] **Step 6: Update max-width in main content wrapper**

In `App.tsx`, update the inline style on the content wrapper div inside `<main>`:

```tsx
maxWidth: '1200px',
```

(Changed from 1400px to 1200px to match header.)

- [ ] **Step 7: Verify header renders**

Run dev server and confirm: logo + "haklex" left, 4 nav tabs center, GitHub link + theme toggle right. 56px height, no subtitle.

- [ ] **Step 8: Commit**

```bash
git add demo/src/App.tsx demo/src/demo.css
git commit -m "refactor(demo): redesign header with logo, 4-tab nav, and monochrome style"
```

---

## Task 4: Playground Page

**Files:**

- Create: `demo/src/pages/PlaygroundPage.tsx`
- Modify: `demo/src/demo.css`
- Modify: `demo/src/App.tsx`

- [ ] **Step 1: Add Playground CSS to demo.css**

Append to `demo/src/demo.css`:

```css
/* ── Playground ── */
.playground-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.playground-tabs {
  display: flex;
  gap: 1px;
  background: var(--demo-border);
  border-radius: 8px;
  padding: 1px;
  overflow: hidden;
}

.playground-tab {
  padding: 7px 16px;
  font-size: 12px;
  font-weight: 500;
  color: var(--demo-text-muted);
  background: var(--demo-bg);
  cursor: pointer;
  transition: all 0.15s;
  border: none;
  font-family: inherit;
}

.playground-tab:first-child {
  border-radius: 7px 0 0 7px;
}

.playground-tab:last-child {
  border-radius: 0 7px 7px 0;
}

.playground-tab-active {
  color: var(--demo-text);
  background: var(--demo-surface);
  font-weight: 600;
}

.playground-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.playground-select {
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  color: var(--demo-text-secondary);
  background: var(--demo-surface);
  border: 1px solid var(--demo-border);
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
}

.playground-action-btn {
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 500;
  color: var(--demo-text-secondary);
  background: transparent;
  border: 1px solid var(--demo-border);
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.playground-action-btn:hover {
  color: var(--demo-text);
  border-color: var(--demo-text-muted);
}

.playground-editor-wrapper {
  background: var(--demo-surface);
  border: 1px solid var(--demo-border);
  border-radius: 12px;
  overflow: hidden;
}

.playground-editor-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  border-top: 1px solid var(--demo-border);
  background: var(--demo-bg);
  font-size: 11px;
  color: var(--demo-text-muted);
}

.playground-editor-bottom-left {
  display: flex;
  gap: 16px;
}
```

- [ ] **Step 2: Create PlaygroundPage component**

Create `demo/src/pages/PlaygroundPage.tsx`. This consolidates EditorPage, PresetsPage, and CommentsPage. The component manages a `tab` state and renders the appropriate sub-view.

```tsx
import type { ColorScheme, SerializedEditorState } from '@haklex/rich-editor';
import type { Variant } from '@haklex/rich-kit-shiro';

import { NestedDocDialogEditorProvider } from '@haklex/rich-ext-nested-doc';
import { ShiroEditor, ShiroRenderer } from '@haklex/rich-kit-shiro';
import { ToolbarPlugin } from '@haklex/rich-plugin-toolbar';
import { nanoid } from 'nanoid';
import { useCallback, useEffect, useMemo, useRef, useState, use } from 'react';
import { useSearchParams } from 'react-router-dom';

import { BlockCommentGutter } from '../components/comments/BlockCommentGutter';
import { CommentHighlighter } from '../components/comments/CommentHighlightPlugin';
import { CommentSidebar } from '../components/comments/CommentSidebar';
import { SelectionCommentPopup } from '../components/comments/SelectionCommentPopup';
import { JsonViewer } from '../components/JsonViewer';
import { ThemeContext } from '../context/ThemeContext';
import { initialContent } from '../fixtures/initial-content';
import { presets } from '../fixtures/presets';

type Tab = 'editor' | 'presets' | 'comments';

// Import types and nodes needed for editor setup — same as current EditorPage
import { editInsertItemOrder, NestedDocEditNode, NestedDocNode } from '@haklex/rich-ext-nested-doc';
import { colorPresets } from '../fixtures';

export function PlaygroundPage() {
  const colorScheme = use(ThemeContext);
  const [tab, setTab] = useState<Tab>('editor');
  const [variant, setVariant] = useState<Variant>('article');
  const [showJson, setShowJson] = useState(false);
  const [editorState, setEditorState] = useState<SerializedEditorState | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Presets tab state
  const [selectedPreset, setSelectedPreset] = useState(presets[0]?.key ?? '');
  const [presetMode, setPresetMode] = useState<'edit' | 'readonly'>('readonly');
  const presetData = useMemo(
    () => presets.find((p) => p.key === selectedPreset)?.data ?? null,
    [selectedPreset],
  );

  // Comments tab state
  const editorContainerRef = useRef<HTMLDivElement | null>(null);

  // Sync tab from URL
  useEffect(() => {
    const urlTab = searchParams.get('tab');
    if (urlTab === 'presets' || urlTab === 'comments') {
      setTab(urlTab);
    }
  }, [searchParams]);

  const handleTabChange = useCallback(
    (newTab: Tab) => {
      setTab(newTab);
      setSearchParams((prev) => {
        if (newTab === 'editor') {
          prev.delete('tab');
        } else {
          prev.set('tab', newTab);
        }
        return prev;
      });
    },
    [setSearchParams],
  );

  const tabs: { key: Tab; label: string }[] = [
    { key: 'editor', label: 'Editor' },
    { key: 'presets', label: 'Presets' },
    { key: 'comments', label: 'Comments' },
  ];

  return (
    <div className="page">
      {/* Top bar */}
      <div className="playground-bar">
        <div className="playground-tabs">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={tab === t.key ? 'playground-tab playground-tab-active' : 'playground-tab'}
              onClick={() => handleTabChange(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="playground-actions">
          <select
            className="playground-select"
            value={variant}
            onChange={(e) => setVariant(e.target.value as Variant)}
          >
            <option value="article">Article</option>
            <option value="note">Note</option>
            <option value="comment">Comment</option>
          </select>
          {tab === 'editor' && (
            <button className="playground-action-btn" onClick={() => setShowJson((v) => !v)}>
              {showJson ? 'Hide JSON' : 'JSON'}
            </button>
          )}
        </div>
      </div>

      {/* Tab content */}
      {tab === 'editor' && (
        <EditorTab
          variant={variant}
          colorScheme={colorScheme}
          showJson={showJson}
          editorState={editorState}
          onStateChange={setEditorState}
        />
      )}
      {tab === 'presets' && (
        <PresetsTab
          variant={variant}
          colorScheme={colorScheme}
          selectedPreset={selectedPreset}
          onSelectPreset={setSelectedPreset}
          presetData={presetData}
          mode={presetMode}
          onModeChange={setPresetMode}
        />
      )}
      {tab === 'comments' && (
        <CommentsTab
          variant={variant}
          colorScheme={colorScheme}
          containerRef={editorContainerRef}
        />
      )}
    </div>
  );
}

/* ── Editor Tab ── */
function EditorTab({
  variant,
  colorScheme,
  showJson,
  editorState,
  onStateChange,
}: {
  variant: Variant;
  colorScheme: ColorScheme;
  showJson: boolean;
  editorState: SerializedEditorState | null;
  onStateChange: (state: SerializedEditorState) => void;
}) {
  return (
    <>
      <div className="playground-editor-wrapper">
        <NestedDocDialogEditorProvider>
          <ShiroEditor
            colorScheme={colorScheme}
            variant={variant}
            colorPresetOverride={colorScheme === 'dark' ? colorPresets.dark : undefined}
            initialState={initialContent}
            onChange={onStateChange}
            nodes={[NestedDocNode, NestedDocEditNode]}
            insertItemOrder={editInsertItemOrder}
          >
            <ToolbarPlugin />
          </ShiroEditor>
        </NestedDocDialogEditorProvider>
      </div>
      {showJson && editorState && <JsonViewer data={editorState} defaultExpanded={false} />}
    </>
  );
}

/* ── Presets Tab ── */
function PresetsTab({
  variant,
  colorScheme,
  selectedPreset,
  onSelectPreset,
  presetData,
  mode,
  onModeChange,
}: {
  variant: Variant;
  colorScheme: ColorScheme;
  selectedPreset: string;
  onSelectPreset: (key: string) => void;
  presetData: SerializedEditorState | null;
  mode: 'edit' | 'readonly';
  onModeChange: (mode: 'edit' | 'readonly') => void;
}) {
  return (
    <div className="presets-layout">
      <div className="presets-sidebar">
        <h3>Presets</h3>
        <div className="presets-list">
          {presets.map((p) => (
            <button
              key={p.key}
              className={
                selectedPreset === p.key ? 'preset-item preset-item-active' : 'preset-item'
              }
              onClick={() => onSelectPreset(p.key)}
            >
              <div className="preset-item-label">{p.label}</div>
              <div className="preset-item-desc">{p.description}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="presets-main">
        <div className="toolbar">
          <div className="toolbar-group">
            <span className="toolbar-label">Mode</span>
            <button
              className={mode === 'readonly' ? 'btn btn-active' : 'btn'}
              onClick={() => onModeChange('readonly')}
            >
              Readonly
            </button>
            <button
              className={mode === 'edit' ? 'btn btn-active' : 'btn'}
              onClick={() => onModeChange('edit')}
            >
              Edit
            </button>
          </div>
        </div>
        {presetData &&
          (mode === 'edit' ? (
            <ShiroEditor
              key={selectedPreset}
              colorScheme={colorScheme}
              variant={variant}
              initialState={presetData}
            />
          ) : (
            <ShiroRenderer colorScheme={colorScheme} variant={variant} state={presetData} />
          ))}
      </div>
    </div>
  );
}

/* ── Comments Tab ── */
// Re-uses existing comment components from demo/src/components/comments/
// This is a simplified version; the full comment logic from CommentsPage is preserved.
interface CommentAnchor {
  type: 'range' | 'block';
  blockIndex: number;
  startOffset?: number;
  endOffset?: number;
}
interface Comment {
  id: string;
  text: string;
  anchor: CommentAnchor;
  createdAt: number;
}
interface BlockInfo {
  index: number;
  text: string;
  fingerprint: string;
}

function CommentsTab({
  variant,
  colorScheme,
  containerRef,
}: {
  variant: Variant;
  colorScheme: ColorScheme;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [blockInfos, setBlockInfos] = useState<BlockInfo[]>([]);

  const handleAddComment = useCallback((text: string, anchor: CommentAnchor) => {
    setComments((prev) => [...prev, { id: nanoid(), text, anchor, createdAt: Date.now() }]);
  }, []);

  const handleDeleteComment = useCallback((id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // Extract block info from rendered content
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new MutationObserver(() => {
      const blocks = container.querySelectorAll('.rich-content > [data-lexical-editor] > *');
      const infos: BlockInfo[] = Array.from(blocks).map((el, i) => ({
        index: i,
        text: el.textContent ?? '',
        fingerprint: `${el.tagName}-${(el.textContent ?? '').slice(0, 50)}`,
      }));
      setBlockInfos(infos);
    });

    observer.observe(container, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [containerRef]);

  return (
    <div className="comments-layout">
      <div className="comments-editor" ref={containerRef}>
        <ShiroEditor colorScheme={colorScheme} variant={variant} initialState={initialContent} />
        <BlockCommentGutter
          containerRef={containerRef}
          blockInfos={blockInfos}
          comments={comments}
          onAdd={handleAddComment}
        />
        <SelectionCommentPopup
          blockInfos={blockInfos}
          containerRef={containerRef}
          onAdd={handleAddComment}
        />
        <CommentHighlighter
          containerRef={containerRef}
          blockInfos={blockInfos}
          comments={comments}
          activeId={activeCommentId}
        />
      </div>
      <CommentSidebar
        comments={comments}
        activeId={activeCommentId}
        onHover={setActiveCommentId}
        onDelete={handleDeleteComment}
      />
    </div>
  );
}
```

**Note to implementer:** The above is a starting scaffold. You MUST cross-reference with the existing `EditorPage.tsx`, `PresetsPage.tsx`, and `CommentsPage.tsx` to ensure all props, imports, and features are preserved. In particular:

- `EditorPage` has `colorPresets`, `insertItemOrder`, and nested doc node setup — verify the exact imports from the existing file.
- `CommentsPage` has a more sophisticated block fingerprinting algorithm — copy the actual implementation from the existing `CommentsPage.tsx`.
- `PresetsPage` has URL param persistence for preset/variant/mode — the scaffold above uses simplified versions.

- [ ] **Step 3: Lint**

Run: `npx eslint demo/src/pages/PlaygroundPage.tsx`

Fix any lint errors.

- [ ] **Step 4: Update routes in App.tsx**

In `demo/src/App.tsx`, replace the imports and route children:

Remove old page imports:

```tsx
// Remove these:
import { EditorPage } from './pages/EditorPage';
import { PresetsPage } from './pages/PresetsPage';
import { CommentsPage } from './pages/CommentsPage';
import { DesignPage } from './pages/DesignPage';
import { BizPage } from './pages/BizPage';
```

Add new imports:

```tsx
import { PlaygroundPage } from './pages/PlaygroundPage';
import { ExtensionsPage } from './pages/ExtensionsPage';
```

Replace route children:

```tsx
children: [
  { path: '/', element: <PlaygroundPage /> },
  { path: '/nodes', element: <NodeShowcase /> },
  { path: '/extensions', element: <ExtensionsPage /> },
  { path: '/ai', element: <AgentPage /> },
  { path: '*', element: <Navigate replace to="/" /> },
],
```

**Note:** `ExtensionsPage` doesn't exist yet — create a placeholder for now (Task 6 will fill it in):

Create a temporary `demo/src/pages/ExtensionsPage.tsx`:

```tsx
export function ExtensionsPage() {
  return (
    <div className="page">
      <h1>Extensions</h1>
      <p>Coming soon.</p>
    </div>
  );
}
```

- [ ] **Step 5: Verify Playground page works**

Open http://localhost:5188 — the default page should show the Playground with the segmented control. Click through Editor/Presets/Comments tabs.

- [ ] **Step 6: Commit**

```bash
git add demo/src/pages/PlaygroundPage.tsx demo/src/pages/ExtensionsPage.tsx demo/src/App.tsx demo/src/demo.css
git commit -m "feat(demo): add PlaygroundPage consolidating editor, presets, and comments"
```

---

## Task 5: Node Showcase Redesign

**Files:**

- Modify: `demo/src/pages/NodeShowcase.tsx`
- Modify: `demo/src/demo.css`

- [ ] **Step 1: Add new Node Showcase CSS**

Append to `demo/src/demo.css`, replacing the old `.showcase-*` and `.node-*` styles:

```css
/* ── Node Showcase (redesigned) ── */
.nodes-page-header {
  margin-bottom: 32px;
}

.nodes-page-title {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
  margin-bottom: 6px;
}

.nodes-page-desc {
  font-size: 14px;
  color: var(--demo-text-muted);
  line-height: 1.5;
}

.nodes-filter-bar {
  display: flex;
  gap: 6px;
  margin-bottom: 28px;
}

.nodes-filter-pill {
  padding: 6px 16px;
  font-size: 13px;
  font-weight: 500;
  color: var(--demo-text-muted);
  background: transparent;
  border: 1px solid var(--demo-border);
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}

.nodes-filter-pill:hover {
  color: var(--demo-text);
  border-color: var(--demo-text-muted);
}

.nodes-filter-pill-active {
  color: var(--demo-text);
  background: var(--demo-accent-bg);
  border-color: transparent;
}

.nodes-filter-count {
  font-size: 12px;
  color: var(--demo-text-muted);
  font-weight: 400;
  margin-left: 6px;
}

.nodes-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 1200px) {
  .nodes-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .nodes-grid {
    grid-template-columns: 1fr;
  }
}

.node-card {
  background: var(--demo-surface);
  border: 1px solid var(--demo-border);
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.15s;
}

.node-card:hover {
  border-color: var(--demo-text-muted);
}

.node-card-expanded {
  border-color: var(--demo-text-muted);
}

.node-card-body {
  padding: 20px;
}

.node-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 4px;
}

.node-card-name {
  font-size: 14px;
  font-weight: 600;
}

.node-card-type {
  font-size: 10px;
  font-weight: 600;
  color: var(--demo-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 2px 8px;
  background: var(--demo-accent-bg);
  border-radius: 999px;
  white-space: nowrap;
}

.node-card-desc {
  font-size: 13px;
  color: var(--demo-text-muted);
  line-height: 1.5;
  margin-bottom: 16px;
}

.node-card-preview {
  background: var(--demo-bg);
  border-radius: 8px;
  padding: 16px;
  min-height: 64px;
}

.node-card-detail {
  border-top: 1px solid var(--demo-border);
  padding: 16px 20px;
}

.node-detail-tabs {
  display: flex;
  gap: 1px;
  margin-bottom: 12px;
  background: var(--demo-border);
  border-radius: 6px;
  padding: 1px;
  overflow: hidden;
}

.node-detail-tab {
  padding: 5px 14px;
  font-size: 11px;
  font-weight: 500;
  color: var(--demo-text-muted);
  background: var(--demo-surface);
  border: none;
  cursor: pointer;
  font-family: inherit;
}

.node-detail-tab:first-child {
  border-radius: 5px 0 0 5px;
}

.node-detail-tab:last-child {
  border-radius: 0 5px 5px 0;
}

.node-detail-tab-active {
  font-weight: 600;
  color: var(--demo-text);
}

.node-detail-tab:not(.node-detail-tab-active) {
  background: var(--demo-bg);
}

.node-detail-json {
  background: var(--demo-code-bg);
  color: var(--demo-code-text);
  border-radius: 6px;
  padding: 14px 16px;
  font-family: 'SF Mono', SFMono-Regular, ui-monospace, Consolas, monospace;
  font-size: 11px;
  line-height: 1.6;
  max-height: 200px;
  overflow: auto;
}

.node-detail-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
```

- [ ] **Step 2: Rewrite NodeShowcase component**

Read the existing `demo/src/pages/NodeShowcase.tsx` first, then rewrite it using the new CSS classes. The component should:

1. Import `nodeSamples` from fixtures (same as current)
2. Add a `filter` state: `'all' | 'inline' | 'block' | 'container'`
3. Add an `expandedId` state: `string | null`
4. Render page header, filter pills with counts, and 3-column card grid
5. Each card shows name, type badge, description (from sample), and live preview (using ShiroRenderer or ShiroEditor based on mode)
6. Clicking a card toggles `expandedId` — expanded card shows JSON serialization + Readonly/Editable toggle

The implementer should reference the existing `NodeShowcase.tsx` for the exact node rendering logic and adapt it to the new card layout.

- [ ] **Step 3: Lint**

Run: `npx eslint demo/src/pages/NodeShowcase.tsx`

- [ ] **Step 4: Verify nodes page**

Navigate to http://localhost:5188/nodes — confirm filter pills work, cards render with previews, expand/collapse works.

- [ ] **Step 5: Commit**

```bash
git add demo/src/pages/NodeShowcase.tsx demo/src/demo.css
git commit -m "refactor(demo): redesign NodeShowcase with card grid, filters, and expand detail"
```

---

## Task 6: Extensions Page

**Files:**

- Modify: `demo/src/pages/ExtensionsPage.tsx` (replace placeholder)
- Modify: `demo/src/demo.css`

- [ ] **Step 1: Add Extensions CSS**

Append to `demo/src/demo.css`:

```css
/* ── Extensions Page ── */
.ext-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

@media (max-width: 768px) {
  .ext-grid {
    grid-template-columns: 1fr;
  }
}

.ext-card {
  background: var(--demo-surface);
  border: 1px solid var(--demo-border);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.15s;
}

.ext-card:hover {
  border-color: var(--demo-text-muted);
}

.ext-card-preview {
  background: var(--demo-bg);
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--demo-border);
  overflow: hidden;
}

.ext-card-body {
  padding: 16px 20px;
}

.ext-card-name {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
}

.ext-card-desc {
  font-size: 13px;
  color: var(--demo-text-muted);
  line-height: 1.5;
}

.ext-card-tag {
  display: inline-block;
  margin-top: 10px;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 500;
  color: var(--demo-text-muted);
  background: var(--demo-accent-bg);
  border-radius: 999px;
}

.ext-detail {
  margin-top: 24px;
}
```

- [ ] **Step 2: Implement ExtensionsPage**

Rewrite `demo/src/pages/ExtensionsPage.tsx`. This page pulls content from the current `BizPage.tsx`, `DiffPage.tsx`, and `LinkCardPluginsPage.tsx`.

```tsx
import type { ColorScheme } from '@haklex/rich-editor';

import { use, useState } from 'react';

import { ThemeContext } from '../context/ThemeContext';

interface Extension {
  id: string;
  name: string;
  description: string;
  packageName: string;
  previewLabel: string;
}

const extensions: Extension[] = [
  {
    id: 'excalidraw',
    name: 'Excalidraw',
    description: 'Embed interactive whiteboards and diagrams directly in the document.',
    packageName: 'rich-ext-excalidraw',
    previewLabel: 'Whiteboard',
  },
  {
    id: 'code-snippet',
    name: 'Code Snippet',
    description: 'Syntax-highlighted code blocks with language detection and line numbers.',
    packageName: 'rich-ext-code-snippet',
    previewLabel: 'Syntax Highlight',
  },
  {
    id: 'gallery',
    name: 'Gallery',
    description: 'Multi-image gallery with masonry layout and lightbox support.',
    packageName: 'rich-ext-gallery',
    previewLabel: 'Image Grid',
  },
  {
    id: 'embed',
    name: 'Embed',
    description: 'Rich link cards, video embeds, and oEmbed integration.',
    packageName: 'rich-ext-embed',
    previewLabel: 'Link Card',
  },
  {
    id: 'diff',
    name: 'Diff Viewer',
    description: 'Visualize structural differences between two editor states.',
    packageName: 'rich-diff',
    previewLabel: 'Change Diff',
  },
  {
    id: 'nested-doc',
    name: 'Nested Document',
    description: 'Embedded sub-documents with their own editor scope and toolbar.',
    packageName: 'rich-ext-nested-doc',
    previewLabel: 'Sub-Editor',
  },
];

export function ExtensionsPage() {
  const colorScheme = use(ThemeContext);
  const [activeExt, setActiveExt] = useState<string | null>(null);

  return (
    <div className="page">
      <div className="nodes-page-header">
        <h1 className="nodes-page-title">Extensions</h1>
        <p className="nodes-page-desc">
          Heavy-weight plugins and integrations that extend the editor beyond text.
        </p>
      </div>

      <div className="ext-grid">
        {extensions.map((ext) => (
          <div
            key={ext.id}
            className="ext-card"
            onClick={() => setActiveExt(activeExt === ext.id ? null : ext.id)}
          >
            <div className="ext-card-preview">
              <span style={{ fontSize: 13, color: 'var(--demo-text-muted)' }}>
                {ext.previewLabel}
              </span>
            </div>
            <div className="ext-card-body">
              <div className="ext-card-name">{ext.name}</div>
              <div className="ext-card-desc">{ext.description}</div>
              <span className="ext-card-tag">{ext.packageName}</span>
            </div>
          </div>
        ))}
      </div>

      {activeExt && (
        <div className="ext-detail">
          <ExtensionDetail id={activeExt} colorScheme={colorScheme} />
        </div>
      )}
    </div>
  );
}

function ExtensionDetail({ id, colorScheme }: { id: string; colorScheme: ColorScheme }) {
  // Each extension gets a live demo area.
  // The implementer should pull the actual demo content from BizPage.tsx:
  // - 'excalidraw': ExcalidrawConfigProvider + embedded Excalidraw
  // - 'diff': RichDiff with diffSamples fixture
  // - 'embed': LinkCardRenderer with plugins from extra-linkcard-plugins
  // - 'code-snippet', 'gallery', 'nested-doc': relevant ShiroEditor setups

  return (
    <div className="panel">
      <div className="panel-header">
        <h3 className="panel-title">{extensions.find((e) => e.id === id)?.name} — Live Demo</h3>
      </div>
      <div className="panel-body">
        <p style={{ color: 'var(--demo-text-muted)', fontSize: 13 }}>
          Live demo for {id}. Implementer: port the relevant section from BizPage.tsx here.
        </p>
      </div>
    </div>
  );
}
```

**Note to implementer:** The `ExtensionDetail` component above is a scaffold. You must port the actual live demo content from `BizPage.tsx` for each extension. The excalidraw, diff, and link card demos are already working in BizPage — move them here.

- [ ] **Step 3: Lint**

Run: `npx eslint demo/src/pages/ExtensionsPage.tsx`

- [ ] **Step 4: Verify extensions page**

Navigate to http://localhost:5188/extensions — confirm cards render, clicking shows detail area.

- [ ] **Step 5: Commit**

```bash
git add demo/src/pages/ExtensionsPage.tsx demo/src/demo.css
git commit -m "feat(demo): add ExtensionsPage with card grid and detail scaffold"
```

---

## Task 7: AI Page Layout Adjustments

**Files:**

- Modify: `demo/src/pages/AgentPage.tsx`
- Modify: `demo/src/demo.css`

- [ ] **Step 1: Update AI page CSS**

The existing `.agent-*` styles in `demo/src/demo.css` need minor tweaks. Update:

```css
.agent-split {
  flex: 1;
  display: flex;
  height: calc(100dvh - var(--app-header-height, 56px));
  min-height: 0;
  margin: -24px;
}

.agent-pane-editor {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  background: var(--demo-surface);
}

.agent-pane-chat {
  width: 380px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  box-sizing: border-box;
  padding: 0;
  background: var(--demo-bg);
  border-left: 1px solid var(--demo-border);
}
```

The key change is `width: 380px` (from 400px) and using `56px` default for header height.

- [ ] **Step 2: Verify the AI page still works**

Navigate to http://localhost:5188/ai — confirm the split layout renders correctly, chat panel is 380px, editor fills remaining space.

- [ ] **Step 3: Commit**

```bash
git add demo/src/demo.css demo/src/pages/AgentPage.tsx
git commit -m "refactor(demo): adjust AI page layout to match new design spec"
```

---

## Task 8: Delete Old Pages & Clean Up

**Files:**

- Delete: `demo/src/pages/DesignPage.tsx`
- Delete: `demo/src/pages/DesignPage.css.ts`
- Delete: `demo/src/pages/BizPage.tsx`
- Delete: `demo/src/pages/EditorPage.tsx`
- Delete: `demo/src/pages/PresetsPage.tsx`
- Delete: `demo/src/pages/CommentsPage.tsx`
- Delete: `demo/src/pages/DiffPage.tsx`
- Delete: `demo/src/pages/LinkCardPluginsPage.tsx`
- Modify: `demo/src/App.tsx`
- Modify: `demo/src/demo.css`

- [ ] **Step 1: Verify no remaining imports of old pages**

Run: `grep -rn "EditorPage\|PresetsPage\|CommentsPage\|DesignPage\|BizPage\|DiffPage\|LinkCardPluginsPage" demo/src/App.tsx`

Expected: No matches (they should have been removed in Task 4).

- [ ] **Step 2: Delete old page files**

```bash
rm demo/src/pages/DesignPage.tsx
rm demo/src/pages/DesignPage.css.ts
rm demo/src/pages/BizPage.tsx
rm demo/src/pages/EditorPage.tsx
rm demo/src/pages/PresetsPage.tsx
rm demo/src/pages/CommentsPage.tsx
rm demo/src/pages/DiffPage.tsx
rm demo/src/pages/LinkCardPluginsPage.tsx
```

- [ ] **Step 3: Remove unused CSS rules from demo.css**

Remove these CSS rule blocks that are no longer used:

- `.app-title`, `.app-subtitle` (already removed in Task 3)
- `.nav-divider` (already removed in Task 3)
- Old `.showcase-intro`, `.showcase-section`, `.showcase-section-title`, `.showcase-grid` rules (replaced by `.nodes-*` in Task 5)
- `.biz-anchor-nav`, `.biz-grid` rules (replaced by `.ext-*` in Task 6)

Keep: `.presets-*`, `.comments-*`, `.toolbar*`, `.panel*`, `.btn*`, `.json-*`, `.tips-*`, `.import-textarea`, `.agent-*` — these are still used by PlaygroundPage, AgentPage, or shared components.

- [ ] **Step 4: Lint the whole demo**

Run: `npx eslint demo/src/App.tsx demo/src/pages/PlaygroundPage.tsx demo/src/pages/ExtensionsPage.tsx demo/src/pages/NodeShowcase.tsx demo/src/pages/AgentPage.tsx`

Fix any errors (unused imports, etc.).

- [ ] **Step 5: Full verification**

Open http://localhost:5188 and verify:

1. `/` — Playground loads with Editor/Presets/Comments tabs
2. `/nodes` — Node cards render with filter pills
3. `/extensions` — Extension cards render
4. `/ai` — AI page with split layout
5. Theme toggle works on all pages
6. No console errors

- [ ] **Step 6: Commit**

```bash
git add -A demo/src/
git commit -m "chore(demo): remove old pages (DesignPage, BizPage, EditorPage, PresetsPage, CommentsPage, DiffPage, LinkCardPluginsPage) and clean up unused CSS"
```

---

## Task 9: Final Polish

**Files:**

- Modify: `demo/src/demo.css`

- [ ] **Step 1: Verify responsive breakpoints**

Check all responsive media queries in demo.css work:

- `@media (max-width: 768px)` — header stacks, grids go single column, AI page stacks vertically
- `@media (max-width: 1200px)` — nodes grid goes to 2 columns

- [ ] **Step 2: Remove any remaining teal/pink color references**

Run: `grep -rn "#33a6b8\|#f596aa\|teal\|pink" demo/src/`

Expected: No matches except possibly in comment highlight CSS (which uses hardcoded rgba values). Update those to use neutral colors if found.

- [ ] **Step 3: Update comment highlight colors**

If `::highlight(comment-highlight)` styles still use teal rgba values, update them to use the accent variable:

```css
::highlight(comment-highlight) {
  background: var(--demo-accent-bg);
  text-decoration: underline;
  text-decoration-color: var(--demo-accent);
  text-decoration-thickness: 2px;
  text-underline-offset: 2px;
}

::highlight(comment-highlight-active) {
  background: rgba(23, 23, 23, 0.12);
  text-decoration: underline;
  text-decoration-color: var(--demo-accent);
  text-decoration-thickness: 2px;
  text-underline-offset: 2px;
}
```

And for dark mode:

```css
[data-theme='dark'] ::highlight(comment-highlight) {
  background: var(--demo-accent-bg);
  text-decoration-color: var(--demo-accent);
}

[data-theme='dark'] ::highlight(comment-highlight-active) {
  background: rgba(250, 250, 250, 0.12);
  text-decoration-color: var(--demo-accent);
}
```

- [ ] **Step 4: Commit**

```bash
git add demo/src/demo.css
git commit -m "fix(demo): update comment highlight colors to monochrome palette"
```
