# Edit Action Button 用法审计文档

> 扫描时间：2025-03-07  
> 目的：统一整理项目中独立的 ButtonAction 用法，为后续抽象为 UI 基础组件提供依据。

---

## 1. 扫描结果汇总

### 1.1 涉及包与文件

| 包 | 组件/文件 | 样式文件 | 按钮变体 |
|----|-----------|----------|----------|
| `@haklex/rich-renderer-image` | EditMetaPopover.tsx, ReplacePanel.tsx | styles.css.ts | editActionButton, editActionButtonEnd |
| `@haklex/rich-renderer-video` | VideoEditRenderer.tsx | styles.css.ts | editActionButton, editActionButtonEnd |
| `@haklex/rich-renderer-mention` | MentionEditRenderer.tsx | styles.css.ts | editActionButton, editActionButtonEnd |
| `@haklex/rich-renderer-linkcard` | LinkCardEditDecorator.tsx | styles.css.ts | editActionButton, editActionButtonEnd |
| `@haklex/rich-plugin-link-edit` | FloatingLinkEditorPlugin.tsx | styles.css.ts | actionButton, actionButtonEnd |
| `@haklex/rich-ext-embed` | EmbedLinkRenderer.tsx | styles.css.ts | actionButton, actionButtonDanger |
| `@haklex/rich-renderer-katex` | KaTeXEditDecorator.tsx | styles.css.ts | actionButton, footerButton, footerButtonPrimary |
| `@haklex/rich-editor` | ImageUploadPlugin.tsx | image-upload.css.ts | actionButton, secondaryButton |
| `@haklex/rich-editor` | nested-doc-dialog | nested-doc-dialog.css.ts | primaryButton, secondaryButton |
| `@haklex/rich-ext-nested-doc` | - | styles.css.ts | primaryButton, secondaryButton |

### 1.2 命名与语义分类

| 命名模式 | 用途 | 出现位置 |
|----------|------|----------|
| `editActionButton` + `editActionButtonEnd` | 编辑面板内 Save/Close/Open/Remove 等操作 | image, video, mention, linkcard |
| `actionButton` + `actionButtonEnd` | 链接编辑、浮动工具栏 | link-edit |
| `actionButton` + `actionButtonDanger` | 危险操作（删除） | embed |
| `actionButton` | 内联小图标按钮（24×24） | katex |
| `footerButton` + `footerButtonPrimary` | 弹窗底部 Cancel/Save | katex |
| `actionButton` + `secondaryButton` | 对话框主/次按钮 | image-upload, nested-doc |
| `primaryButton` + `secondaryButton` | 对话框主/次按钮 | nested-doc-dialog, rich-ext-nested-doc |

---

## 2. 使用场景与编写方式

### 2.1 模式 A：编辑面板操作栏（editActions + editActionButton）

**结构：**
```tsx
<div className={`${styles.editActions} ${styles.semanticClassNames.editActions}`}>
  <button className={`${styles.editActionButton} ${styles.semanticClassNames.editActionButton}`} ...>
    Save / Open / Preview / To Link
  </button>
  <button className={`${styles.editActionButton} ... ${styles.editActionButtonEnd} ${styles.semanticClassNames.editActionButtonEnd}`} ...>
    Close / Remove / Apply / Unlink
  </button>
</div>
```

**特点：**
- 容器：`editActions`（flex, gap: 4px）
- 普通按钮：`editActionButton`
- 靠右按钮：`editActionButton` + `editActionButtonEnd`（marginLeft: auto）
- 双 className 模式：`styles.xxx` + `styles.semanticClassNames.xxx`（便于主题覆盖）

**使用位置：**

| 文件 | 按钮文案 | 行为 |
|------|----------|------|
| EditMetaPopover.tsx | Save, Close | commitMeta, setMetaOpen(false) |
| ReplacePanel.tsx | Preview, Apply | handlePreviewUrl, handleReplaceByUrl |
| LinkCardEditDecorator.tsx | Open, To Link, Remove | handleOpen, handleConvertToLink, handleDelete |
| MentionEditRenderer.tsx | Open, Remove | handleOpen, handleDelete |
| VideoEditRenderer.tsx | Open, Remove | handleOpen, handleDelete |

### 2.2 模式 B：链接编辑操作栏（actions + actionButton）

**结构：**
```tsx
<div className={`${styles.actions} ${styles.semanticClassNames.actions}`}>
  <button className={`${styles.actionButton} ${styles.semanticClassNames.actionButton}`} ...>
    <ExternalLink /> Open
  </button>
  {renderExtraActions?.({ actionButtonClassName: `${styles.actionButton} ${styles.semanticClassNames.actionButton}` })}
  <button className={`${styles.actionButton} ... ${styles.actionButtonEnd}`} ...>
    <Unlink /> Unlink
  </button>
</div>
```

**特点：**
- 容器：`actions`
- 支持通过 `renderExtraActions` 注入额外按钮，传入 `actionButtonClassName`
- `actionButtonEnd` 用于 Unlink 靠右

**使用位置：** `FloatingLinkEditorPlugin.tsx`

**扩展机制：** 通过 `renderExtraActions` 传入 `actionButtonClassName`，供下游（如 ShiroEditor 的 `ConvertToLinkCardAction`）注入额外按钮，保持样式一致。

### 2.3 模式 C：Embed 操作栏（actions + actionButton + actionButtonDanger）

**结构：**
```tsx
<span className={`${styles.actions} ${styles.semanticClassNames.actions}`}>
  <button className={`${styles.actionButton} ${styles.semanticClassNames.actionButton}`} ...>
    <ExternalLink /> Open
  </button>
  <button className={`${styles.actionButton} ... ${styles.actionButtonDanger} ...`} ...>
    <Trash2 /> Delete
  </button>
</span>
```

**特点：**
- 图标按钮（无文案或仅图标）
- `actionButtonDanger`：hover 时红色（alertCaution）
- 固定 16×16 svg

**使用位置：** `EmbedLinkRenderer.tsx`

### 2.4 模式 D：KaTeX 编辑器（actionButton / footerButton）

**内联 actionButton（24×24）：**
```tsx
<div className={`${styles.inputActions} ${styles.semanticClassNames.inputActions}`}>
  <button className={`${styles.actionButton} ${styles.semanticClassNames.actionButton}`} ... />
  <button className={`${styles.actionButton} ${styles.semanticClassNames.actionButton}`} ... />
</div>
```

**底部 footerButton：**
```tsx
<div className={`${styles.footerActions} ${styles.semanticClassNames.footerActions}`}>
  <button className={`${styles.footerButton} ${styles.semanticClassNames.footerButton}`} ...>Cancel</button>
  <button className={`${styles.footerButton} ${styles.footerButtonPrimary} ...`} ...>Save</button>
</div>
```

**特点：**
- `actionButton`：小尺寸（24×24），用于输入框旁操作
- `footerButton`：文字按钮，Cancel 为次要，Save 为主按钮（accent 背景）

### 2.5 模式 E：对话框按钮（primaryButton / secondaryButton）

**结构：**
```tsx
<div className={styles.dialogActions}>
  <button className={styles.secondaryButton} ...>Cancel</button>
  <button className={styles.primaryButton} ...>Confirm</button>
</div>
```

**特点：**
- 较大尺寸（height: 36, padding 0.875rem）
- 有边框、实心背景
- primary：深色背景；secondary：浅色 + 边框

**使用位置：** image-upload 弹窗、nested-doc 对话框

---

## 3. 样式定义对比

### 3.1 editActionButton（image / video / mention / linkcard）

四个包的样式几乎一致，仅 linkcard 使用 `vars.borderRadius.sm` 而其他用 `'4px'`，linkcard 用 `vars.color.text` 而其他用 `color: 'inherit'`。

```css
/* 共性 */
display: inline-flex;
alignItems: center;
gap: 6px;
appearance: none;
border: none;
background: none;
fontSize: vars.typography.fontSizeSm;
fontWeight: 500;
cursor: pointer;
padding: 4px 8px;
borderRadius: 4px; /* linkcard: vars.borderRadius.sm */
transition: color 0.15s ease, background-color 0.15s ease;
whiteSpace: nowrap;
&:hover { backgroundColor: vars.color.fillSecondary; }
```

### 3.2 actionButton（link-edit）

与 editActionButton 高度相似，仅 fontSize 为 `'13px'`，borderRadius 为 `vars.borderRadius.sm`。

### 3.3 actionButton（embed）

偏图标按钮风格：
- `color: vars.color.textSecondary`
- `padding: 6`
- `borderRadius: 6`
- 无 fontSize/fontWeight
- 有 `:disabled` 样式
- `actionButtonDanger` 为 modifier，hover 变红

### 3.4 actionButton（katex）

小尺寸图标按钮：
- `width: 24px; height: 24px`
- `color: color-mix(...textSecondary 60%...)`
- 无 padding，固定尺寸

### 3.5 footerButton（katex）

- `color: vars.color.textSecondary`
- `padding: 4px 10px`
- `fontSize: fontSizeXs`
- `footerButtonPrimary`：`backgroundColor: vars.color.accent`，实心主按钮

### 3.6 primaryButton / secondaryButton（dialog）

- `height: 36`
- `padding: 0 0.875rem`
- `border: 1px solid`
- primary：深色背景；secondary：浅色 + 边框

---

## 4. semanticClassNames 约定

所有 Edit UI 均采用双 className 模式：

```tsx
className={`${styles.editActionButton} ${styles.semanticClassNames.editActionButton}`}
```

各包在 `styles.css.ts` 中导出：

```ts
export const semanticClassNames = {
  editActionButton: 'rr-image-edit-action-btn',      // 示例：image
  editActionButtonEnd: 'rr-image-edit-action-btn--end',
  // ...
}
```

用途：便于下游通过 CSS 选择器覆盖样式，不依赖具体 Vanilla Extract 生成的 hash。

---

## 5. 统一组件建议

### 5.1 建议放置位置

- **首选**：`@haklex/rich-editor-ui`（已有 Dialog、Popover、Dropdown 等基础组件）
- **备选**：`@haklex/rich-style-token` 仅提供 token，不提供组件；若需零 React 依赖，可考虑在 `@haklex/rich-editor` 内建样式 + 导出 className

### 5.2 建议抽象出的组件/样式

| 组件/样式 | 覆盖场景 | 变体 |
|-----------|----------|------|
| `EditActionBar` | 容器 | - |
| `EditActionButton` | 模式 A、B 的普通按钮 | - |
| `EditActionButtonEnd` | 模式 A、B 的靠右按钮 | 或通过 `pushEnd` prop |
| `EditActionButtonDanger` | 模式 C 的危险按钮 | modifier |
| `EditActionButtonIcon` | 模式 C、D 的图标按钮 | 24×24 或 16×16 |
| `DialogPrimaryButton` / `DialogSecondaryButton` | 模式 E | 或 `DialogButton variant="primary"` |

### 5.3 迁移优先级

1. **高**：`editActionButton` + `editActionButtonEnd`（4 个 renderer 包重复度最高）
2. **中**：`actionButton` + `actionButtonEnd`（link-edit）与 editActionButton 可合并
3. **中**：`actionButton` + `actionButtonDanger`（embed）可作 variant
4. **低**：`footerButton` / `primaryButton` / `secondaryButton`（使用场景较少，可后续统一）

### 5.4 API 设计草案

```tsx
// 方案 1：组合式
<EditActionBar>
  <EditActionButton onClick={...}>Save</EditActionButton>
  <EditActionButton end onClick={...}>Close</EditActionButton>
</EditActionBar>

// 方案 2：配置式
<EditActionBar
  actions={[
    { label: 'Save', onClick: commitMeta },
    { label: 'Close', onClick: close, end: true },
  ]}
/>

// 方案 3：仅样式（保持现有结构，只统一 className 来源）
import { editActionBar, editActionButton, editActionButtonEnd } from '@haklex/rich-editor-ui/styles'
```

---

## 6. 附录：完整文件清单

### 6.1 使用 editActionButton 的文件

- `packages/rich-renderer-image/src/EditMetaPopover.tsx`
- `packages/rich-renderer-image/src/ReplacePanel.tsx`
- `packages/rich-renderer-video/src/VideoEditRenderer.tsx`
- `packages/rich-renderer-mention/src/MentionEditRenderer.tsx`
- `packages/rich-renderer-linkcard/src/LinkCardEditDecorator.tsx`

### 6.2 使用 actionButton 的文件

- `packages/rich-plugin-link-edit/src/FloatingLinkEditorPlugin.tsx`
- `packages/rich-ext-embed/src/renderers/EmbedLinkRenderer.tsx`
- `packages/rich-renderer-katex/src/KaTeXEditDecorator.tsx`

### 6.3 使用 primaryButton / secondaryButton 的文件

- `packages/rich-editor/src/plugins/ImageUploadPlugin.tsx`
- `packages/rich-editor/src/components/decorators/nested-doc-dialog`（及引用处）
- `packages/rich-ext-nested-doc`（样式定义，使用处待确认）

### 6.4 样式定义文件

- `packages/rich-renderer-image/src/styles.css.ts`
- `packages/rich-renderer-video/src/styles.css.ts`
- `packages/rich-renderer-mention/src/styles.css.ts`
- `packages/rich-renderer-linkcard/src/styles.css.ts`
- `packages/rich-plugin-link-edit/src/styles.css.ts`
- `packages/rich-ext-embed/src/styles.css.ts`
- `packages/rich-renderer-katex/src/styles.css.ts`
- `packages/rich-editor/src/plugins/image-upload.css.ts`
- `packages/rich-editor/src/components/decorators/nested-doc-dialog.css.ts`
- `packages/rich-ext-nested-doc/src/styles.css.ts`
