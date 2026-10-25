# Quiet Ink — haklex 编辑器设计语言重刷

日期：2026-10-25
视觉参考：https://claude.ai/artifact/UoqgZosiDXN4opci43qosN （Foundations / Article prose / Blocks / Variants / Editor chrome 五块画板 + D0 对照画板）

## 1. 意图

haklex 编辑器的视觉从未系统调校过，且在下游（尤其 mx-core 后台）出现**具体元素样式被宿主改坏**的问题，最明显的是字体：弹层与工具栏继承了宿主 `body` 的 Inter、`font-feature-settings: 'ss01','cv11'`、14px 等。

本项目做两件事：

1. **隔离**：编辑器渲染的任何东西（内容区、编辑态、portal 到 body 的弹层 / 工具栏 / tooltip）在任意宿主里都长得一样，除非宿主**通过受支持的 token 接口**主动改它。
2. **重刷**：全部组件改用 D0「Quiet Ink」设计语言（Vercel / Geist 系：中性灰、1px 细线、半透明交互填充、近黑主按钮、单一蓝色强调色）。

用户已确定：采用 D0；接受 Shiroi / Yohaku 线上观感随之变化；后台把 `--rc-*` 映射到后台自己的暖灰。

## 2. 现状（已核实）

- haklex 全部样式为 Vanilla Extract 产物，**未分层**（无 `@layer`）。约 90 个 `*.css.ts`，共约 14.5k 行。
- mx-core 后台：Tailwind v4（preflight 位于 `@layer base`），`src/index.css` 在 `body` 上设置 Inter、`font-size: .875rem`、`font-feature-settings: 'ss01','cv11'`、`-webkit-font-smoothing: antialiased`；`@layer base` 内有 `* { border-color: neutral-200 }`、`body a {...}`、`button` 重置；token 位于 `src/styles/tokens.css`（stone 暖灰）。
- 因 haklex 未分层，**haklex 声明过的属性总会赢过 Tailwind 分层规则**；泄漏来自 haklex **没声明**的属性：
  - 26 个样式文件完全未设 `font-family`，包括 `rich-plugin-floating-toolbar`、`rich-plugin-block-handle`、`rich-plugin-table`、`rich-editor-ui` 的 dropdown-menu / tooltip / combobox / animated-tabs / segmented-control / badge / alert / status-dot / scroll-area / spinner，以及 `rich-diff`、`rich-ext-nested-doc`、`rich-ext-gallery`、`rich-ext-steps`、`rich-renderer-banner`、`rich-renderer-ruby` 等。
  - `PortalThemeWrapper`（`rich-style-token/src/portal-theme.tsx`）只挂主题 class（仅定义 `--rc-*` 变量）和 `data-theme`，不设任何排版属性；且 `className` 为空时根本不渲染包裹层。
  - Tailwind preflight 的 `img, svg, video { display: block }`、`* { border-color }` 等对未显式声明的 haklex 元素生效。
- 约 100 处写死的色值 / 字体散落在 `rich-style-token` 以外的 ~28 个文件（最多：`rich-ext-chart/palette`、`rich-plugin-image-editor`、`rich-editor-ui` color-picker / status-dot / alert / badge、`rich-renderer-image`、`rich-agent-chat`、`rich-renderer-video`、`rich-renderer-codeblock`）。
- 变体主题 class（`articleTheme` / `noteTheme` / `commentTheme` / `chatTheme`）在**元素自身**上重新赋值全部颜色变量，因此宿主在 `:root` 上覆盖 `--rc-*` 对颜色无效。
- Yohaku（`../Yohaku`）：
  - 引入 `@haklex/rich-compose/style/foundation.css` 及若干模块 CSS；代码块、代码片段、链接卡片、投票、引用、表格、提示块、横幅、嵌套文档、标题、折叠块、列表项由 Yohaku 自己 override。
  - 段落、列表符号、行内代码、删除线、高亮、分隔线、脚注、提及、注音以及全部 token 默认值仍来自 haklex，会随本项目变化（已接受）。
  - 通过行内 style 设置 `--rc-font-family`（`apps/web/src/components/modules/note/NoteFontFab.tsx`），并读取 `--rc-accent`、`--rc-space-lg`。
  - 后台通过行内 style 设置 `--rc-max-width: none`。

## 3. 目标

1. **G1 宿主隔离**：在一个「敌意宿主」页面（Tailwind v4 preflight + 后台 `body` 那组样式 + 暖灰背景）里，编辑器内容区与所有 portal 弹层的计算样式与在干净页面里一致（字体族、字号、行高、字距、font-feature-settings、图标 display、边框色）。
2. **G2 D0 token**：`rich-style-token` 的取值换成画板 Foundations 的 D0 值（见 §6），亮 / 暗两套。
3. **G3 无裸值**：组件 `*.css.ts` 只读 `vars.*`；`rich-style-token` 之外不出现裸色值、裸字体栈。例外见 §5。
4. **G4 组件重刷**：内容节点、编辑器 chrome、UI primitives、渲染器与扩展按画板逐一对齐（见 §7）。
5. **G5 宿主映射接口**：宿主能在**一处**把任意 `--rc-*` 颜色 token 重映射，作用于内容区、编辑态与 portal chrome，亮暗两种模式都生效。后台用它接入自己的暖灰。

## 4. 非目标 / 反目标

- 非目标：改动节点结构、Lexical 行为、static/edit 拆分、编辑交互逻辑。
- 非目标：React Native / Metro 端样式。
- 非目标：重写 Yohaku 自己 override 的组件。
- 非目标：引入 Tailwind 或运行时 CSS-in-JS。
- **反目标（做了就算失败）**：
  - 破坏现有 `--rc-*` 变量名或其语义（Yohaku、后台依赖 `--rc-font-family`、`--rc-accent`、`--rc-space-lg`、`--rc-max-width`）。
  - 隔离基线写成字面值，导致宿主通过 `--rc-font-family` 等变量的覆盖失效。
  - 为了隔离给 haklex 样式加 `!important` 或包进 `@layer`（包进 layer 会让宿主的未分层全局规则反过来盖掉 haklex）。
  - hover / 选中态在暖灰或任意非白背景上发脏（实色填充）。

## 5. 约束

- token 契约**只增不改名**；已有名称保持语义，仅更新取值。
- 隔离基线中的每个排版属性都读 `vars.*`，不写字面值。
- 例外允许裸值的地方：`rich-style-token` 本身；`rich-ext-chart` 的数据可视化调色板（数据色不是 UI 色，可保留为独立 token 组但需亮暗两套）；color-picker 的预设色板（用户数据）；代码高亮主题（shiki 主题决定）。
- 工作区里 `packages/rich-ext-chart/package.json` 与 `src/ChartEditNode.ts` 有用户未提交的改动，不要碰这两个文件。
- 遵循 AGENTS.md：React 19 `use(Context)`；context value 必须 `useMemo`；中性灰用 neutral 系，不用 slate / zinc。
- 只对改动文件跑 lint / typecheck；不跑全量 build。
- 不自动 commit。
- 发布走 `release-orchestrator`：所有 `@haklex/*` 同版本，建议 minor（0.56.0，当前为 0.55.0），因为视觉有可感知变化。后台映射在 haklex 发布成功、后台升级依赖之后再做。

## 6. D0 token 取值（已定）

颜色（light / dark）：

| token                                           | 用途                 | light                                             | dark                                              |
| ----------------------------------------------- | -------------------- | ------------------------------------------------- | ------------------------------------------------- |
| text                                            | 正文、标题           | `#171717`                                         | `#ededed`                                         |
| textSecondary                                   | 引用、次级文字       | `#404040`                                         | `#c4c4c4`                                         |
| textTertiary                                    | 元信息、图注         | `#737373`                                         | `#8f8f8f`                                         |
| textQuaternary                                  | 仅图标 / 占位 / 禁用 | `#a3a3a3`                                         | `#5c5c5c`                                         |
| bg                                              | 画布                 | `#ffffff`                                         | `#0a0a0a`                                         |
| bgSecondary                                     | 代码块、表头         | `#fafafa`                                         | `#121212`                                         |
| bgTertiary                                      | 行内代码、引用底     | `#f5f5f5`                                         | `#1a1a1a`                                         |
| border                                          | 边框、分隔           | `#e5e5e5`                                         | `#262626`                                         |
| borderSubtle                                    | 行线                 | `#f0f0f0`                                         | `#1c1c1c`                                         |
| accent / link                                   | 链接、焦点、光标     | `#2563eb`                                         | `#60a5fa`                                         |
| accentLight                                     | 选区、激活态         | accent 10%                                        | accent 16%                                        |
| 告警 info / tip / important / warning / caution | 仅限提示块           | `#2563eb` `#15803d` `#7c3aed` `#b45309` `#dc2626` | `#60a5fa` `#4ade80` `#a78bfa` `#fbbf24` `#f87171` |

交互填充改为半透明墨色（现有名称保留，语义不变）：`fill` 选中 ≈ 黑 7–8% / 白 9–10%，`fillSecondary` hover ≈ 黑 4–5% / 白 5–7%，`fillTertiary`、`fillQuaternary` 依次更淡。具体百分比由实现方在敌意宿主页上目测定稿。

新增 token：`ring`（弹层外轮廓，黑 8% / 白 10%）。如实现需要，可新增 hover / active 的别名，但不得删除旧名。

阴影：

- e0：1px ring
- e1（menu）：`0 0 0 1px ring, 0 4px 12px rgb(0 0 0/.06), 0 12px 32px -8px rgb(0 0 0/.12)`
- e2（modal）：`0 0 0 1px rgb(0 0 0/.06), 0 16px 48px -12px rgb(0 0 0/.25)`
- 暗色加深透明度。

圆角：sm 4（chip、行内代码）、md 8（块、菜单项）、lg 12（弹层）。**同心规则**：内圆角 = 外圆角 − padding。

字号（article 16px 基准）：

| 级别    | 字号 / 行高   | 字重 | 字距     |
| ------- | ------------- | ---- | -------- |
| H1      | 30 / 38       | 700  | −0.015em |
| H2      | 24 / 32       | 650  | −0.01em  |
| H3      | 20 / 28       | 600  |          |
| H4      | 17 / 26       | 600  |          |
| 正文    | 16，行高 1.75 |      |          |
| small   | 14 / 22       |      |          |
| caption | 13 / 20       |      |          |
| mono    | 0.875em       |      |          |

- H5 / H6 由实现方按比例延续。
- 标题改用 em 表达，保证 comment / chat 变体自动缩放。
- 变体（note serif 1.85、comment 14 / 1.6、chat 15 / 1.65）保持现有家族与行高。

间距：4px 网格（4 / 8 / 12 / 16 / 24 / 32 / 48）。

动效：弹层进入 120ms ease-out，退出 80ms ease-in，scale .97→1，位移不超过 4px。

## 7. 组件改动（按画板）

内容（`rich-editor/src/styles/*`）：

- 行内代码：去掉描边，只留 bgTertiary 底色。
- 高亮：accentLight 底。
- 删除线：降为 textTertiary。
- 引用：2px inset 细线，用 border 色，textSecondary。
- 列表：项间 0.375em。
- 待办：已完成项降为 textTertiary 并加删除线。
- 文章分隔线：60px 居中短线。
- 脚注：14px textSecondary。
- 表格：表头 13px / 600 / textSecondary，底线用 border，行线用 borderSubtle，数字等宽。
- 提示块：accent 6% 底 + 18% ring，标题行用对应语义色，**不用左侧色条**。
- 代码块：bgSecondary 底 + borderSubtle ring，36px 头部栏放语言名与复制按钮。
- 折叠块、链接卡片：border ring，无填充。

Chrome（`rich-editor-ui` 的 menu / popover / dropdown / select / combobox / tooltip / dialog，以及 `rich-plugin-*` toolbar / floating-toolbar / slash-menu / block-handle / link-edit / mention / table）：

- 弹层：lg 12 + padding 4 + 菜单项 md 8，e1 阴影。
- 工具栏按钮：32px，radius 8；浮动工具栏按钮 28px，radius 6。
- hover 用半透明 fill；激活态用更深的 fill，不用强调色。
- 主按钮：近黑底（text 色）+ bg 色字。
- 焦点：accent 1px ring + accentLight 3px 光晕。

其余渲染器 / 扩展（image、video、file、mermaid、katex、linkcard、mention、banner、ruby、gallery、embed、excalidraw、code-snippet、nested-doc、poll、steps、dynamic、chat、chart、agent-chat、ai-agent、diff、image-editor）：套用同一套 token、圆角、阴影、填充规则；去掉裸值。没有画板的组件由实现方按 §6 的规则自行推导。

## 8. 隔离方案（方向已定，细节交给实现方）

1. **根排版基线**：一份共享 style。所有「编辑器根」都要挂上，包括 `richContent`、编辑器根、**每个 portal 弹层根**：
   - 显式设置：`font-family`（内容用 `vars.typography.fontFamily`，chrome 用 `fontFamilySans`）、`font-size`、`line-height`、`letter-spacing: normal`、`font-feature-settings: normal`、`font-variant: normal`、`font-weight: 400`、`font-style: normal`、`text-transform: none`、`color`。
   - 不设 `-webkit-font-smoothing`（属宿主层面，**此为设计方决定**）。
   - 实现方可以让 `PortalThemeWrapper` 总是渲染并承载基线，也可以把基线并入 `popupBase` 等弹层基类，或两者兼用，前提是**所有 portal 出口都被覆盖**（含 tooltip、toolbar 下拉、slash menu、mention、link-edit、表格菜单、image-editor sheet、agent chat 弹层）。
2. **preflight 回补（此为设计方决定）**：**不使用**作用于后代的通配回补规则（如 `:where(.root) svg`、`:where(.root) *`）。原因：haklex 样式未分层，这类规则会赢过宿主的 Tailwind utility，破坏 Yohaku 在 `.rich-content` 内用 Tailwind 写的 override 渲染器（边框色、`hidden`/`md:hidden`、图标 display）。改为：凡是 haklex 自有 class 渲染 `img` / `svg` / `video` 或带边框的元素，自身显式声明 `display` 与 `border-color`（或完整 `border` 简写）。根基线只设置可继承的排版属性。
3. **宿主映射接口（建议方案，此为设计方决定，实现方可改进但须满足 G5）**：
   - 颜色 token 的取值改为 `var(--rc-host-<name>, <D0 默认值>)` 回退链，亮暗两套默认值各自回退到**同一个** host 变量。
   - 字体族 token（`fontFamily`、`fontFamilySans`、`fontFamilySerif`、`fontFamilyKai`、`fontMono`）同样走 `--rc-host-*` 回退链（此为设计方决定）。否则基线落地后 Yohaku 的 tooltip / 弹层会从继承 `--app-font-sans` 变成系统字体且无法改回。现有通过行内 style 设置 `--rc-font-family` 的方式（Yohaku `NoteFontFab`、`createThemeStyle`）必须继续有效。
   - 宿主在 `:root` 定义 `--rc-host-*`，并负责自己的亮暗切换，即可同时作用于内容、编辑态与 portal。
   - 变体主题 class 继续可以设置非颜色 token。是否仍在元素上赋值颜色由实现方决定，但不得阻断 host 变量。
   - 在 `rich-style-token` 的 README 或 AGENTS.md 中写明这套接口。

## 9. 验证

- 在 `demo/` 增加一个「敌意宿主」页面或开关：
  - 引入 Tailwind v4 preflight 等价规则（可以直接内联一份）。
  - 加上后台 `body` 那组样式：Inter、`ss01` / `cv11`、14px、antialiased、`* { border-color }`、`body a` 规则、`button` 重置、stone 背景。
  - 并排或可切换显示干净页面。
- 用浏览器自动化截图对比内容区与每类弹层，并用 `getComputedStyle` 抽查 §3 G1 列出的属性。
- 再加一个开关演示 `--rc-host-*` 映射，用后台暖灰取值，验证 G5（亮 + 暗，含 portal）。
- 对改动文件跑 eslint 与 typecheck；跑现有 vitest。不跑全量 build。

## 10. 交给实现方的部分

- 交互填充的具体透明度、H5 / H6 的取值、无画板组件的细节。
- 基线挂载的具体机制、`:where()` 回补的具体选择器。
- 是否增加 lint 规则或脚本，禁止 `*.css.ts` 出现裸色值（推荐，可作为 G3 的守护）。
- 包的处理顺序。建议：token + 基线 + host 接口 → 核心内容样式 → editor-ui primitives 与 plugins → 渲染器与扩展 → agent / diff / chat → 敌意宿主验证。

## 11. 范围终点（用户已选「宽」）

完成的定义，按顺序：

1. haklex 改动通过敌意宿主验证（§9），改动文件的 lint / typecheck 与 vitest 通过。
   1.5. **检查点**：停下，由用户在 demo / docs 中目测效果。用户确认无问题后才进入第 2 步。
2. 提交 haklex 改动，经 `release-orchestrator` 发布 0.56.0，等 `.github/workflows/release.yml` 成功。用户已授权本项目内的 commit 与 release。
3. mx-core 后台升级 `@haklex/*` 到 0.56.0，并完成下面的映射。
4. Yohaku 升级到 0.56.0，回归检查文章页、笔记页（含 `NoteFontFab` 切换字体）、tooltip / 弹层字体、Yohaku override 组件，亮暗两种模式都要看。

## 12. 后台映射（haklex 发布之后）

在 `mx-core/apps/admin/src/styles/tokens.css` 中把 `--rc-host-*` 映射到后台的 `--color-fg` / `--color-fg-muted` / `--color-fg-subtle` / `--color-surface-*` / `--color-border*` / `--color-accent*`，亮暗都要覆盖，`.auth-light` 也要处理。
