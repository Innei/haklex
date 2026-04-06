# Demo UX Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Four targeted UX improvements — route-based navigation, merged top nav, Extensions sidebar layout, Presets sidebar restyling.

**Architecture:** Split `PlaygroundPage` into 3 independent route pages, lift variant state to `Layout`, merge all nav into one header bar, redesign Extensions as sidebar+detail, restyle Presets sidebar to match.

**Tech Stack:** React 19, react-router-dom v7, CSS custom properties, Lexical editor ecosystem.

---

## File Structure

| File                                  | Action | Responsibility                                                                                                                                      |
| ------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `demo/src/App.tsx`                    | Modify | Update routes (6 routes + redirect), update `navItems` (6 items), lift `variant` state to `Layout`, conditionally render variant selector in header |
| `demo/src/pages/PlaygroundPage.tsx`   | Delete | Split into 3 files below                                                                                                                            |
| `demo/src/pages/EditorPage.tsx`       | Create | `EditorTabContent` extracted, receives `variant` from context                                                                                       |
| `demo/src/pages/PresetsPage.tsx`      | Create | `PresetsTabContent` extracted, receives `variant` from context, restyled sidebar                                                                    |
| `demo/src/pages/CommentsPage.tsx`     | Create | `CommentsTabContent` extracted, receives `variant` from context                                                                                     |
| `demo/src/pages/ExtensionsPage.tsx`   | Modify | Rewrite to sidebar+detail layout                                                                                                                    |
| `demo/src/context/VariantContext.tsx` | Create | Context for `RichEditorVariant` state shared across editor pages                                                                                    |
| `demo/src/demo.css`                   | Modify | Remove playground-bar/tab styles, add ext-layout/sidebar styles, restyle presets-sidebar                                                            |

---

### Task 1: Create VariantContext

**Files:**

- Create: `demo/src/context/VariantContext.tsx`

- [ ] **Step 1: Create VariantContext file**

```tsx
import type { RichEditorVariant } from '@haklex/rich-editor';
import { createContext, type Dispatch, type SetStateAction } from 'react';

export const VariantContext = createContext<RichEditorVariant>('article');
export const SetVariantContext = createContext<Dispatch<SetStateAction<RichEditorVariant>>>(
  () => {},
);
```

Note: Two separate contexts for value and setter avoids re-renders on components that only read the variant. Consumers use `use(VariantContext)` per project eslint rule (no `useContext`).

- [ ] **Step 2: Commit**

```bash
git add demo/src/context/VariantContext.tsx
git commit -m "feat(demo): add VariantContext for shared variant state"
```

---

### Task 2: Extract EditorPage

**Files:**

- Create: `demo/src/pages/EditorPage.tsx`
- Reference: `demo/src/pages/PlaygroundPage.tsx` (lines 160–438, `EditorTabContent`)

- [ ] **Step 1: Create EditorPage.tsx**

Copy the `EditorTabContent` function from `PlaygroundPage.tsx` (lines 160–438) into a new file as `EditorPage`. Changes from the original:

1. Remove the `variant` prop — instead import and `use(VariantContext)` to get the variant
2. Export as `EditorPage` (not `EditorTabContent`)
3. Copy all imports that `EditorTabContent` uses from `PlaygroundPage.tsx`:
   - The `NestedDocDialogEditor` helper function (lines 98–107)
   - `insertItemOrder` constant (lines 50–64)
   - `colorOverridePresets` and related types/constants (lines 28–90)
   - All external imports needed by these

```tsx
// Top of file — key structural change:
import { use } from 'react';
import { VariantContext } from '../context/VariantContext';

// Inside the component:
export function EditorPage() {
  const variant = use(VariantContext);
  // ... rest of EditorTabContent body unchanged
}
```

- [ ] **Step 2: Verify the file compiles**

```bash
cd /Users/innei/git/innei-repo/haklex && npx eslint demo/src/pages/EditorPage.tsx
```

Expected: No errors (or only warnings unrelated to this change).

- [ ] **Step 3: Commit**

```bash
git add demo/src/pages/EditorPage.tsx
git commit -m "feat(demo): extract EditorPage from PlaygroundPage"
```

---

### Task 3: Extract PresetsPage with Restyled Sidebar

**Files:**

- Create: `demo/src/pages/PresetsPage.tsx`
- Reference: `demo/src/pages/PlaygroundPage.tsx` (lines 442–537, `PresetsTabContent`)

- [ ] **Step 1: Create PresetsPage.tsx**

Copy `PresetsTabContent` from `PlaygroundPage.tsx` (lines 442–537) into a new file as `PresetsPage`. Changes:

1. Remove `variant` prop — use `use(VariantContext)` instead
2. Export as `PresetsPage`
3. Copy helpers it needs: `getPresetsInitialState`, `updateSearchParams`, `validPresetKeys`, `validVariants`, `validModes` (lines 92–156)
4. Move the Edit/Readonly toggle from the toolbar into the sidebar header
5. Remove the standalone toolbar div entirely

The JSX structure changes for the sidebar header and mode toggle:

```tsx
export function PresetsPage() {
  const variant = use(VariantContext);
  const theme = useTheme();
  const [initial] = useState(getPresetsInitialState);
  const [selectedKey, _setSelectedKey] = useState(initial.selectedKey);
  const [mode, _setMode] = useState<'edit' | 'readonly'>(initial.mode);
  const [liveState, setLiveState] = useState<SerializedEditorState | null>(null);

  const setSelectedKey = useCallback((key: string) => {
    _setSelectedKey(key);
    updateSearchParams('preset', key);
  }, []);

  const setMode = useCallback((m: 'edit' | 'readonly') => {
    _setMode(m);
    updateSearchParams('mode', m);
  }, []);

  const selected = presets.find((p) => p.key === selectedKey) || presets[0];
  const jsonData = mode === 'edit' ? (liveState ?? selected.data) : selected.data;

  useEffect(() => {
    setLiveState(null);
  }, [selectedKey]);

  return (
    <MentionPlatformProvider platforms={allExtraPlatformMeta}>
      <div className="page">
        <div className="presets-layout">
          {/* Sidebar */}
          <aside className="presets-sidebar">
            <div className="sidebar-header">
              <span className="sidebar-label">Presets</span>
              <div className="sidebar-header-actions">
                <button
                  className={mode === 'edit' ? 'sidebar-pill sidebar-pill-active' : 'sidebar-pill'}
                  onClick={() => setMode('edit')}
                >
                  Edit
                </button>
                <button
                  className={
                    mode === 'readonly' ? 'sidebar-pill sidebar-pill-active' : 'sidebar-pill'
                  }
                  onClick={() => setMode('readonly')}
                >
                  Read
                </button>
              </div>
            </div>
            <div className="sidebar-list">
              {presets.map((preset) => (
                <button
                  key={preset.key}
                  className={
                    selectedKey === preset.key ? 'sidebar-item sidebar-item-active' : 'sidebar-item'
                  }
                  onClick={() => setSelectedKey(preset.key)}
                >
                  <div className="sidebar-item-name">{preset.label}</div>
                  <div className="sidebar-item-desc">{preset.description}</div>
                </button>
              ))}
            </div>
          </aside>

          {/* Main content */}
          <div className="presets-main">
            <Panel badge={`${variant} · ${mode}`} title={selected.label}>
              {mode === 'edit' ? (
                <ShiroEditor
                  initialValue={selected.data}
                  key={`${selected.key}-edit`}
                  theme={theme}
                  variant={variant}
                  onChange={setLiveState}
                />
              ) : (
                <ShiroRenderer
                  key={`${selected.key}-readonly`}
                  theme={theme}
                  value={selected.data}
                  variant={variant}
                />
              )}
            </Panel>

            <Panel title="Serialized JSON">
              <JsonViewer data={jsonData} defaultExpanded={false} />
            </Panel>
          </div>
        </div>
      </div>
    </MentionPlatformProvider>
  );
}
```

Note the CSS class name changes: sidebar items now use shared `.sidebar-*` classes (same classes the Extensions page will use). The old `.preset-item` classes will be removed in Task 6.

- [ ] **Step 2: Verify the file compiles**

```bash
cd /Users/innei/git/innei-repo/haklex && npx eslint demo/src/pages/PresetsPage.tsx
```

- [ ] **Step 3: Commit**

```bash
git add demo/src/pages/PresetsPage.tsx
git commit -m "feat(demo): extract PresetsPage with restyled sidebar"
```

---

### Task 4: Extract CommentsPage

**Files:**

- Create: `demo/src/pages/CommentsPage.tsx`
- Reference: `demo/src/pages/PlaygroundPage.tsx` (lines 541–616, `CommentsTabContent`)

- [ ] **Step 1: Create CommentsPage.tsx**

Copy `CommentsTabContent` from `PlaygroundPage.tsx` into a new file as `CommentsPage`. Changes:

1. Remove `variant` prop — use `use(VariantContext)` instead
2. Export as `CommentsPage`
3. Copy helpers it needs: `extractTextContent`, `computeFingerprint`, `extractBlockInfos` (lines 109–137), and `Comment`/`BlockInfo` type imports

```tsx
import type { CommentAnchor } from '@haklex/rich-editor';
import { MentionPlatformProvider, ShiroRenderer } from '@haklex/rich-kit-shiro';
import type { SerializedEditorState } from 'lexical';
import { nanoid } from 'nanoid';
import { use, useCallback, useMemo, useRef, useState } from 'react';

import { BlockCommentGutter } from '../components/comments/BlockCommentGutter';
import { CommentHighlighter } from '../components/comments/CommentHighlightPlugin';
import { CommentSidebar } from '../components/comments/CommentSidebar';
import { SelectionCommentPopup } from '../components/comments/SelectionCommentPopup';
import { VariantContext } from '../context/VariantContext';
import { useTheme } from '../context/ThemeContext';
import { initialContent } from '../fixtures/initial-content';
import type { BlockInfo, Comment } from '../types/comments';

// Copy extractTextContent, computeFingerprint, extractBlockInfos helpers here

export function CommentsPage() {
  const variant = use(VariantContext);
  const theme = useTheme();
  // ... rest of CommentsTabContent body unchanged
}
```

- [ ] **Step 2: Verify the file compiles**

```bash
cd /Users/innei/git/innei-repo/haklex && npx eslint demo/src/pages/CommentsPage.tsx
```

- [ ] **Step 3: Commit**

```bash
git add demo/src/pages/CommentsPage.tsx
git commit -m "feat(demo): extract CommentsPage from PlaygroundPage"
```

---

### Task 5: Rewrite ExtensionsPage with Sidebar Layout

**Files:**

- Modify: `demo/src/pages/ExtensionsPage.tsx`

- [ ] **Step 1: Rewrite the page component**

Keep all the existing detail components (`ExcalidrawDetail`, `DiffDetail`, `LinkCardDetail`, `ExtensionDetail`) and the `extensions` array + `Extension` type unchanged. Only rewrite the `ExtensionsPage` component at the bottom of the file (lines 423–472).

Replace the `ExtensionsPage` component with:

```tsx
export function ExtensionsPage() {
  const [activeExt, setActiveExt] = useState<string>(extensions[0].id);
  const active = extensions.find((e) => e.id === activeExt) || extensions[0];

  return (
    <div className="page">
      <div className="nodes-page-header">
        <h1 className="nodes-page-title">Extensions</h1>
        <p className="nodes-page-desc">
          Heavy or domain-specific extensions that can be loaded on demand.
        </p>
      </div>

      <div className="ext-layout">
        <aside className="ext-sidebar">
          <div className="sidebar-header">
            <span className="sidebar-label">Extensions</span>
          </div>
          <div className="sidebar-list">
            {extensions.map((ext) => (
              <button
                key={ext.id}
                className={
                  activeExt === ext.id ? 'sidebar-item sidebar-item-active' : 'sidebar-item'
                }
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
    </div>
  );
}
```

Key changes from current:

- `activeExt` defaults to `extensions[0].id` instead of `null`
- Grid replaced with `ext-layout` (flex sidebar + detail)
- Cards replaced with `sidebar-item` buttons (shared class with Presets)
- Detail always visible (no conditional rendering)

- [ ] **Step 2: Verify the file compiles**

```bash
cd /Users/innei/git/innei-repo/haklex && npx eslint demo/src/pages/ExtensionsPage.tsx
```

- [ ] **Step 3: Commit**

```bash
git add demo/src/pages/ExtensionsPage.tsx
git commit -m "refactor(demo): rewrite ExtensionsPage with sidebar layout"
```

---

### Task 6: Update CSS — Remove Old Styles, Add New Styles

**Files:**

- Modify: `demo/src/demo.css`

- [ ] **Step 1: Remove old playground tab styles**

Delete these CSS blocks (lines 830–907):

- `.playground-bar`
- `.playground-tabs`
- `.playground-tab`
- `.playground-tab:first-child`
- `.playground-tab:last-child`
- `.playground-tab-active`
- `.playground-actions`
- `.playground-action-btn`
- `.playground-action-btn:hover`

**Keep** `.playground-select` — it is reused for the variant selector in the header (Task 7).

- [ ] **Step 2: Remove old extension card styles**

Delete these CSS blocks (lines 1102–1167):

- `.ext-grid`
- `@media (max-width: 768px) { .ext-grid }`
- `.ext-card`
- `.ext-card:hover`
- `.ext-card-preview`
- `.ext-card-body`
- `.ext-card-name`
- `.ext-card-desc`
- `.ext-card-tag`
- `.ext-detail` (will be replaced)

- [ ] **Step 3: Remove old preset sidebar styles**

Delete these CSS blocks (lines 410–484):

- `.presets-sidebar` (will be replaced)
- `.presets-sidebar h3`
- `.presets-list`
- `.preset-item`
- `.preset-item:hover`
- `.preset-item-active`
- `.preset-item-label`
- `.preset-item-desc`

Also remove from the responsive section (lines 918–926):

- `.presets-sidebar` inside `@media (max-width: 768px)`

- [ ] **Step 4: Add shared sidebar styles**

Add these new styles. These are used by both Extensions and Presets pages:

```css
/* ── Shared Sidebar ── */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.sidebar-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--demo-text-muted);
}

.sidebar-header-actions {
  display: flex;
  gap: 2px;
}

.sidebar-pill {
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 500;
  color: var(--demo-text-muted);
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.sidebar-pill:hover {
  color: var(--demo-text);
  background: var(--demo-hover);
}

.sidebar-pill-active {
  color: var(--demo-text);
  background: var(--demo-accent-bg);
  font-weight: 600;
}

.sidebar-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar-item {
  width: 100%;
  padding: 8px 12px;
  background: none;
  border: none;
  border-radius: 6px;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
  color: inherit;
}

.sidebar-item:hover {
  background: var(--demo-hover);
}

.sidebar-item-active {
  background: var(--demo-accent-bg);
}

.sidebar-item-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--demo-text-secondary);
}

.sidebar-item-active .sidebar-item-name {
  font-weight: 600;
  color: var(--demo-text);
}

.sidebar-item-desc {
  font-size: 11px;
  color: var(--demo-text-muted);
  line-height: 1.4;
  margin-top: 2px;
}
```

- [ ] **Step 5: Add new presets sidebar styles**

Replace the old `.presets-sidebar` with:

```css
/* ── Presets Page ── */
.presets-layout {
  display: flex;
  gap: 0;
  align-items: flex-start;
}

.presets-sidebar {
  width: 220px;
  flex-shrink: 0;
  padding: 16px;
  border-right: 1px solid var(--demo-border);
  position: sticky;
  top: 24px;
  max-height: calc(100dvh - var(--app-header-height, 0px) - 48px);
  overflow-y: auto;
}

.presets-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-left: 24px;
}
```

- [ ] **Step 6: Add new extensions layout styles**

```css
/* ── Extensions Page ── */
.ext-layout {
  display: flex;
  gap: 0;
  align-items: flex-start;
}

.ext-sidebar {
  width: 220px;
  flex-shrink: 0;
  padding: 16px;
  border-right: 1px solid var(--demo-border);
  position: sticky;
  top: 24px;
  max-height: calc(100dvh - var(--app-header-height, 0px) - 48px);
  overflow-y: auto;
}

.ext-detail {
  flex: 1;
  padding-left: 24px;
}

.ext-detail-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 4px;
}

.ext-detail-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.ext-detail-tag {
  font-size: 11px;
  padding: 2px 8px;
  border: 1px solid var(--demo-border);
  border-radius: 999px;
  color: var(--demo-text-muted);
}

.ext-detail-desc {
  font-size: 13px;
  color: var(--demo-text-muted);
  margin: 0 0 20px;
  line-height: 1.5;
}
```

- [ ] **Step 7: Update responsive styles**

Replace the presets/extensions responsive rules inside `@media (max-width: 768px)`:

```css
@media (max-width: 768px) {
  /* ... existing rules for app-header, comments, etc. ... */

  .presets-layout {
    flex-direction: column;
  }

  .presets-sidebar {
    width: 100%;
    position: static;
    border-right: none;
    border-bottom: 1px solid var(--demo-border);
  }

  .presets-main {
    padding-left: 0;
  }

  .ext-layout {
    flex-direction: column;
  }

  .ext-sidebar {
    width: 100%;
    position: static;
    border-right: none;
    border-bottom: 1px solid var(--demo-border);
  }

  .ext-detail {
    padding-left: 0;
  }
}
```

- [ ] **Step 8: Commit**

```bash
git add demo/src/demo.css
git commit -m "refactor(demo): replace playground/extension/preset CSS with shared sidebar styles"
```

---

### Task 7: Update App.tsx — Routes, Nav, Variant in Header

**Files:**

- Modify: `demo/src/App.tsx`

- [ ] **Step 1: Update imports**

Replace the `PlaygroundPage` import with the three new page imports and add `VariantContext`/`SetVariantContext`:

```tsx
// Remove this:
import { PlaygroundPage } from './pages/PlaygroundPage';

// Add these:
import { CommentsPage } from './pages/CommentsPage';
import { EditorPage } from './pages/EditorPage';
import { PresetsPage } from './pages/PresetsPage';
import { VariantContext, SetVariantContext } from './context/VariantContext';
```

Also add `RichEditorVariant` type import:

```tsx
import type { ColorScheme, RichEditorVariant } from '@haklex/rich-editor';
```

- [ ] **Step 2: Update navItems**

Replace the current `navItems` array (lines 21–26):

```tsx
const navItems = [
  { path: '/editor', label: 'Editor' },
  { path: '/presets', label: 'Presets' },
  { path: '/comments', label: 'Comments' },
  { path: '/nodes', label: 'Nodes' },
  { path: '/extensions', label: 'Extensions' },
  { path: '/ai', label: 'AI' },
] as const;

const variantRoutes = new Set(['/editor', '/presets', '/comments']);
```

- [ ] **Step 3: Add variant state to Layout**

Inside the `Layout` function, add variant state and determine whether to show the selector:

```tsx
function Layout() {
  const location = useLocation();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [variant, setVariant] = useState<RichEditorVariant>('article');
  const systemScheme = useSystemColorScheme();
  // ... existing headerRef, headerHeight state ...

  const showVariantSelector = variantRoutes.has(location.pathname);

  // ... rest of existing logic ...
```

- [ ] **Step 4: Wrap Outlet with VariantContext providers**

In the Layout JSX, wrap `<Outlet />` with both variant contexts and add the variant selector to the header. Find the `<div className="app-header-right">` section and add the selector before the GitHub link:

```tsx
<div className="app-header-right">
  {showVariantSelector && (
    <select
      className="playground-select"
      value={variant}
      onChange={(e) => setVariant(e.target.value as RichEditorVariant)}
    >
      <option value="article">Article</option>
      <option value="comment">Comment</option>
      <option value="note">Note</option>
    </select>
  )}
  <a className="nav-github-link" /* ... */>GitHub</a>
  <button className="nav-theme-toggle" /* ... */>...</button>
</div>
```

And wrap the `<Outlet />` with contexts:

```tsx
<SetVariantContext value={setVariant}>
  <VariantContext value={variant}>
    <Outlet />
  </VariantContext>
</SetVariantContext>
```

Note: Keep the `.playground-select` CSS class — it's the existing styled select. Don't remove it from CSS since it's now used in the header.

- [ ] **Step 5: Update router config**

Replace the routes array (lines 185–196):

```tsx
export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Navigate replace to="/editor" /> },
      { path: '/editor', element: <EditorPage /> },
      { path: '/presets', element: <PresetsPage /> },
      { path: '/comments', element: <CommentsPage /> },
      { path: '/nodes', element: <NodeShowcase /> },
      { path: '/extensions', element: <ExtensionsPage /> },
      { path: '/ai', element: <AgentPage /> },
      { path: '*', element: <Navigate replace to="/editor" /> },
    ],
  },
]);
```

- [ ] **Step 6: Verify the file compiles**

```bash
cd /Users/innei/git/innei-repo/haklex && npx eslint demo/src/App.tsx
```

- [ ] **Step 7: Commit**

```bash
git add demo/src/App.tsx
git commit -m "refactor(demo): route-based navigation with variant selector in header"
```

---

### Task 8: Delete PlaygroundPage and Verify

**Files:**

- Delete: `demo/src/pages/PlaygroundPage.tsx`

- [ ] **Step 1: Delete PlaygroundPage.tsx**

```bash
rm /Users/innei/git/innei-repo/haklex/demo/src/pages/PlaygroundPage.tsx
```

- [ ] **Step 2: Search for any remaining references**

```bash
cd /Users/innei/git/innei-repo/haklex && grep -r "PlaygroundPage" demo/src/
```

Expected: No results. If any remain, update those files to remove the reference.

- [ ] **Step 3: Run full lint check on modified files**

```bash
cd /Users/innei/git/innei-repo/haklex && npx eslint demo/src/App.tsx demo/src/pages/EditorPage.tsx demo/src/pages/PresetsPage.tsx demo/src/pages/CommentsPage.tsx demo/src/pages/ExtensionsPage.tsx demo/src/context/VariantContext.tsx
```

Expected: No errors.

- [ ] **Step 4: Build the demo to verify**

```bash
cd /Users/innei/git/innei-repo/haklex && pnpm --filter @haklex/rich-editor-demo build
```

Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add -u demo/src/pages/PlaygroundPage.tsx
git commit -m "chore(demo): remove PlaygroundPage after route split"
```

---

### Task 9: Visual Verification

- [ ] **Step 1: Start the dev server and manually verify**

```bash
cd /Users/innei/git/innei-repo/haklex && pnpm dev
```

Verify in browser:

1. `http://localhost:5173/` redirects to `/editor`
2. Header shows 6 nav items: Editor, Presets, Comments, Nodes, Extensions, AI
3. Variant selector appears in header on `/editor`, `/presets`, `/comments` — hidden on other routes
4. `/editor` — editor with toolbar, renderer, JSON panels work
5. `/presets` — sidebar (220px, no bg, border-right) with Edit/Read pills in header, preset list below
6. `/comments` — editor + comment sidebar, selection/block comments work
7. `/extensions` — sidebar nav with 5 items, detail area shows live demo, Excalidraw default selected
8. All routes deep-linkable (refresh preserves page)
9. Presets query params (`?preset=X&mode=edit`) still work

- [ ] **Step 2: Final commit if any fixes needed**

If visual verification reveals issues, fix them and commit with descriptive message.
