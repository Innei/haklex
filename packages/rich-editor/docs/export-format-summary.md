# Rich Editor 节点导出格式汇总

本文档汇总 `@haklex/rich-editor` 中所有节点在 **Markdown 导出** 时的格式。  
导出基于 `@lexical/markdown` 的 `$convertToMarkdownString(transformers)`，使用的 transformer 列表为 `ALL_TRANSFORMERS`（见 `src/transformers/index.ts`）。

**说明**：项目内未使用 `@lexical/html` 做 HTML 导出，内容以 **Lexical 序列化 JSON（EditorState）** 形式存储与交换；若需 HTML，需自行接入 `@lexical/html` 并为各节点实现 export 逻辑。

---

## 一、Markdown 导出格式（按节点类型）

### 1. 自定义 Block / Inline（本包 Transformer 定义）

| 节点 | 类型 | Markdown 导出格式 | 示例 |
|------|------|-------------------|------|
| **AlertQuoteNode** | Block | `> [!TYPE]\n> 第一行\n> 第二行` | `> [!NOTE]\n> 这是说明` |
| **BannerNode** | Block | `::: type\n内容\n:::` | `::: note\n提示内容\n:::` |
| **DetailsNode** | Block | `::: details{summary="标题"}\n内容\n:::` | `::: details{summary="点击展开"}\n隐藏内容\n:::` |
| **FootnoteNode** | Inline | `[^id]` | `[^1]` |
| **FootnoteSectionNode** | Block | `[^id]: 定义内容`（多条换行） | `[^1]: 脚注说明` |
| **KaTeXInlineNode** | Inline | `$公式$` | `$E=mc^2$` |
| **KaTeXBlockNode** | Block | `$$公式$$` | `$$\n\\sum x\n$$` |
| **MentionNode** | Inline | `[显示名]{platform@handle}` 或 `{platform@handle}` | `[小明]{twitter@xiaoming}` |
| **SpoilerNode** | Inline | `\|\|内容\|\|` | `\|\|剧透文字\|\|` |
| **Insert（下划线格式）** | 文本格式 | `++文字++` | `++下划线++` |

- **AlertQuoteNode** 的 `TYPE`：`NOTE` | `TIP` | `IMPORTANT` | `WARNING` | `CAUTION`（与 Git 风格一致）。
- **BannerNode** 的 `type`：`note` | `tip` | `important` | `warning` | `caution`；容器解析时 `info`→`note`，`success`→`tip`，`error`/`danger`→`caution`。
- **DetailsNode** 的 `summary` 在导出时放在 `details{summary="..."}` 中。

### 2. Lexical 内置（TRANSFORMERS + CHECK_LIST）

来自 `@lexical/markdown` 的默认 `TRANSFORMERS` 与 `CHECK_LIST`，用于标题、引用、列表、代码、链接和文本格式：

| 节点/格式 | Markdown 导出格式 | 示例 |
|-----------|-------------------|------|
| **HeadingNode** | `#` / `##` / `###`（1–3 级） | `## 二级标题` |
| **QuoteNode** | 每行前加 `> ` | `> 引用行一\n> 引用行二` |
| **ListNode（无序）** | `- 项` | `- 列表项` |
| **ListNode（有序）** | `1. 项` | `1. 第一项` |
| **Check list** | `- [ ]` / `- [x]` | `- [ ] 待办`、`- [x] 已完成` |
| **CodeNode（块）** | 围上 ` ``` ` + 可选语言 | ` ```js\ncode\n``` ` |
| **LinkNode** | `[文本](url)` | `[链接](https://...)` |
| **粗体** | `**文本**` 或 `__文本__` | `**粗体**` |
| **斜体** | `*文本*` 或 `_文本_` | `*斜体*` |
| **删除线** | `~~文本~~` | `~~删除~~` |
| **行内代码** | `` `代码` `` | `` `code` `` |

---

## 二、补充 Block Transformer（自定义导出）

以下节点已在 `ALL_TRANSFORMERS` 中补充 `export`（见 `src/transformers/rich-blocks.ts`）：

| 节点 | Markdown 导出格式 | 说明 |
|------|-------------------|------|
| **ImageNode** | `![alt](src "caption")` | caption 可选；未设置时省略 title |
| **VideoNode** | `<video src="..." poster="..." width=... height=... controls></video>` | 以 HTML video 标签导出媒体参数 |
| **CodeBlockNode** | 围栏代码块（按内容自动选择围栏长度） | 语言来自节点的 `language` |
| **LinkCardNode** | `[title](url)` 或 `<url>` | 有 title 时导出标准链接 |
| **MermaidNode** | ```` ```mermaid\n...\n``` ```` | Mermaid fenced block |
| **GridContainerNode** | `::: grid{cols=... gap="..."} ... :::` | 每个 cell 导出为 `::: cell ... :::` |
| **HorizontalRuleNode** | `---` | 显式导出分割线 |
| **TableNode / TableRowNode / TableCellNode** | 管道表格 | 第一行作为表头并生成分隔行 |

> 注：以上补充的是 `export` 变换，导入（`replace`）当前仍走现有 transformer 逻辑；新增语法若需完整 round-trip，可继续补齐对应的 import 规则。

---

## 三、Transformer 顺序（ALL_TRANSFORMERS）

当前顺序（见 `src/transformers/index.ts`）为：

1. **Inline**：Spoiler → Mention → Footnote → Insert（下划线）→ KaTeX Inline  
2. **Block**：Footnote Section → Container（Banner/Details）→ Git Alert → Check List → KaTeX Block → Image / Video / CodeBlock / LinkCard / Mermaid / Grid / HorizontalRule / Table → Lexical 默认 TRANSFORMERS  

顺序会影响解析与导出时的优先级。

---

## 四、HTML 导出

- 项目内**未使用** `@lexical/html` 的 `$convertToHtml` / `$convertFromHtml`。
- 富文本内容以 **SerializedEditorState (JSON)** 存储；如需 HTML 导出，需：
  - 引入 `@lexical/html`；
  - 为所有需要导出的自定义节点实现 `exportDOM` / `exportHTML`（若使用 Lexical 的 HTML 导出 API）。

---

## 五、参考代码位置

| 内容 | 路径 |
|------|------|
| 所有 Transformers 列表 | `packages/rich-editor/src/transformers/index.ts` |
| Alert | `packages/rich-editor/src/transformers/alert.ts` |
| Container（Banner/Details）| `packages/rich-editor/src/transformers/container.ts` |
| Footnote | `packages/rich-editor/src/transformers/footnote.ts` |
| KaTeX | `packages/rich-editor/src/transformers/katex.ts` |
| Mention | `packages/rich-editor/src/transformers/mention.ts` |
| Spoiler | `packages/rich-editor/src/transformers/spoiler.ts` |
| Insert（下划线）| `packages/rich-editor/src/transformers/insert.ts` |
| Lexical 默认 | `@lexical/markdown` 的 `TRANSFORMERS`、`CHECK_LIST` |
