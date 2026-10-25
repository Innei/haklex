# Docs Site Layout — demo/ 改为左右布局

日期：2026-10-25
视觉参考：https://claude.ai/artifact/3hwQSmb4qzVMHuXrMduA6r
画板：`A · Docs sidebar + TOC`（Doc 模板，单节点页）、`A · Nodes overview`（Doc 模板，总览页）、`C · Nav + workbench inspector`（Workbench 模板）、`A + C · one shell, two templates`（页面归属）、`Token mapping`（chrome → `--rc-*`）。`B · Icon rail` 已被否决，仅作对照。
前置：`2026-10-25-quiet-ink-design-refresh-design.md`（Quiet Ink token，已随 0.56.0 发布）。

## 1. 意图

`demo/` 是 haklex 的文档 / 演示站。Quiet Ink 把编辑器本身的 token 梳理完了，但站点外壳仍是旧样子：顶部 8 个 tab、1200 居中、`Panel` 卡片堆叠、自己一套 `--demo-*` 色值。本项目做两件事：

1. **布局**：改为左侧常驻侧栏 + 右侧内容的左右布局。右侧按页面性质套两种模板之一：**Doc**（读、对比）和 **Workbench**（试、调）。
2. **token 应用**：站点 chrome 只读 Quiet Ink 的 `--rc-*`，不再有第二套色板。方向是现代扁平线条：1px 线分区、半透明填充表示交互、无卡片阴影。

用户已确定：A（文档侧栏）与 C（工作台）合在一个站里；Nodes / Extensions / Charts 都要有总览页 + 单项页。

## 2. 现状（已核实）

- 路由（`demo/src/App.tsx`）：`/editor` `/presets` `/comments` `/nodes` `/extensions` `/charts` `/ai` `/hostile`，`/` 与 `*` 重定向到 `/editor`。顶部 header 固定，`main` 用行内 style 定位，`FullWidthContext` 控制 1200 / 全宽。
- `demo/src/demo.css` 1223 行，定义 `--demo-*`（亮暗两套），仅 `--demo-selection-bg` 与一处 `background` 读了 `--rc-*`。
- **`--rc-*` 在 `.app` 上不可用**：颜色变量由变体主题 class（`articleTheme` 等，`rich-style-token/src/vars.css.ts`）挂在编辑器元素上；暗色由全局 `:root.dark, [data-theme="dark"]` 规则提供（只含颜色与阴影）。`.app` 已带 `data-theme`，所以暗色变量在 `.app` 上已经存在，亮色没有。
- 页面内部结构：
  - Editor（364 行）：顶部 toolbar 一排 `toolbar-group`（Variant、Colors 5 个预设 + 自定义 accent、Mention+ 5 个平台、View：Renderer / JSON / Import），下方 `Panel` 堆叠。
  - Presets（138 行）：自带 `presets-sidebar`，9 个预设（`fixtures/presets.ts` 的 `presets` 数组）。
  - Comments（125 行）：编辑器 + `CommentSidebar`。
  - Nodes（`NodeShowcase.tsx` 197 行）：筛选 pill + 卡片网格。样本来自 `fixtures/node-samples.ts`：37 个样本，每个有 `key` `label` `description` `category`。按节点类型归并为 23 种：inline 6（spoiler、katex-inline、ruby、mention、comment、footnote），block 12（image、video、code-block、code-snippet、mermaid、katex-block、link-card、table、task list、excalidraw、poll、chat），container 5（alert-quote、banner、details、gallery、grid-container）。
  - Extensions（`ExtensionsPage.tsx` 1416 行）：自带侧栏，10 个扩展，每个有 `name` `description`，内部用 `Panel` 分节。
  - Charts（95 行）：筛选 pill（All / Bar / Line / Area / Pie / States）+ 样本列表（`fixtures/chart-samples.ts`）。
  - AI（451 行）：全出血 `agent-split`，编辑器左、聊天右。
  - Hostile host（75 行）：toolbar（Variant、Hostile CSS、Stone mapping）+ Editor / Renderer 两个 `Panel`。
- `.claude/skills/demo-ui-direction`、`demo-ui-tokens`、`demo-ui-components` 描述的是旧系统（顶部 header、4 个 nav、`--demo-*` 色表）。

## 3. 目标

- **G1 外壳**：所有路由共用同一个 260px 左侧栏；右侧是 Doc 或 Workbench 模板。顶部 header 取消。
- **G2 Doc 模板**：Nodes、Extensions、Charts 各有一个总览页和逐项页。
- **G3 Workbench 模板**：Editor、Presets、Comments、AI、Hostile host 使用；页面原有的 toolbar 控件全部移入右侧面板。
- **G4 token**：站点 chrome 的颜色、线、填充只读 `--rc-*`；`demo.css` 里不再出现 chrome 用的裸色值。映射见 §6。
- **G5 文档同步**：三个 `demo-ui-*` skill 改写为新系统。

## 4. 非目标 / 反目标

- 非目标：改 `packages/` 下任何代码或 token 取值。若发现 token 不够用，记下来，另开项目。
- 非目标：新写文档内容（教程、API 文档、MDX 体系）。单项页的文字只用 fixtures 里已有的 `label` / `description`、真实元数据，以及 §8 的类型元数据表。
- 非目标：营销式首页。
- **反目标（做了就算失败）**：
  - 卡片 / 面板加阴影；阴影只给弹层（`boxShadow` 的 menu / e1）。
  - chrome 用彩色强调：accent 只用于焦点环和正文链接；选中态用 `fill`，不用 accent。
  - hover / 选中用实色填充（必须是半透明 `fillSecondary` / `fill`）。
  - 出现 slate / zinc 等带色相的灰。
  - 现有一级 URL 失效（`/editor` `/presets` `/comments` `/nodes` `/extensions` `/charts` `/ai` `/hostile` 必须仍能打开对应内容）。

## 5. 外壳与模板（已定）

### 5.1 侧栏（两种模板共用，宽 260）

- 顶部 56px 行：Logo（现有 `Logo.tsx`）+ `haklex` + 版本号 chip（读 `packages/rich-editor/package.json` 的 version）。
- 搜索入口：32px 高的按钮式输入框，右侧显示 `⌘K`，点击或按 ⌘K / Ctrl+K 打开命令面板（见 §8）。
- 三组导航，组标题 12px / 500 / `textTertiary`：
  - Playground：Editor、Presets、Comments
  - Reference：Nodes、Extensions、Charts
  - Labs：AI Agent、Hostile host
- 导航项：高 32、圆角 8、14px、`textSecondary`；hover `fillSecondary` + `text`；当前项 `fill` + `text` + 500；焦点 accent 1px 环 + `accentLight` 3px 光晕。条目可带右侧计数（12px `textTertiary`）。
- 当前分区展开为树（Nodes、Extensions、Charts、Presets）：左侧 1px `border` 竖线作引导；当前子项把同位置那段线改为 1px `text` 色，字色 `text` + 500。不加填充，不加颜色。Nodes 树顺序：Overview，然后按 INLINE / BLOCK / CONTAINER 分组（组标题 11px 大写 + 计数）。
- 底部：上方 1px 线，GitHub 链接 + 主题三段切换（System / Light / Dark，图标按钮）。主题是全局唯一入口。
- 侧栏与内容区之间用 1px `border` 分隔，侧栏无底色（与页面同为 `bg`）。

### 5.2 Doc 模板

**单项页**（画板 A）：H1、导语、元信息取自 §8 的类型元数据表。

- 正文列 ≤760，居中；右侧 200 的 "On this page" 目录。目录当前项与侧栏树同规则（线即指示）。
- 结构：面包屑（13px `textTertiary`）→ H1（30/38/700/−0.015em）→ 导语（16px / 1.75 / `textSecondary`）→ 元信息 chip（节点 type 用等宽 + `bgTertiary` 底；包名、static/edit 用 1px 边框）。
- 预览区：标签行（Preview / Edit / JSON，下划线式：当前项 1px `text` 底线），右侧 Variant 三段切换；下方 1px `border`、圆角 12 的框内渲染该类型的全部样本（例如 Alert 的 5 个）。
- 下方 "Serialized JSON" 小节：代码块样式与编辑器代码块一致（`bgSecondary` 底 + `borderSubtle` ring + 36px 头部栏，含语言名与 Copy）。
- 页尾上一页 / 下一页（1px 上边线，两端对齐）。

**总览页**（画板 Nodes overview）：

- 内容宽 ≤1080，无目录。
- 面包屑 → H1 → 导语（"23 node types with 37 samples…" 这类真实计数）→ 一行：左分类三段切换（带计数），右 Variant 切换。
- 按分类分节：节标题 17px/600 + 计数，下方 1px `border`；4 列网格。
- 磁贴：1px `border`、圆角 12；上部 104px 预览区（`bgSecondary`，下边 `borderSubtle`）；下部名称（14/500）+ 节点 type（11px 等宽 `textTertiary`）+ 样本数（多于 1 时显示）。hover 只把边框加深到 `textQuaternary`，无阴影、无位移。点击进入单项页。

**三处的页面单位**：

- Nodes：每种节点类型一页（23 页），一页内展示该类型全部样本。
- Extensions：每个扩展一页（10 页），原 `Panel` 分节改为正文内 H2 小节，节与节之间 1px 线分隔。
- Charts：每个类别一页（Bar / Line / Area / Pie / States），总览页展示全部样本。

### 5.3 Workbench 模板（画板 C）

- 中间：56px 顶栏（底部 1px 线）放标题、元信息和该页操作。下方舞台**不加外容器**（用户实现中途决定）：编辑器直接铺在舞台上；编辑器的 `ToolbarPlugin` 压平成通栏（无圆角、无阴影、底部 1px 线），吸附在顶栏下方；主编辑器不再套带标题的卡片，避免与顶栏标题重复。Renderer / JSON / Import 等次级面板放在编辑器下方带内边距的区域。
- 暗色下舞台作为内容区，底色比 chrome 高一级（用户实现中途决定）：通过 `--rc-host-bg*` 把舞台内的底色阶梯整体上移一级（bg→bgSecondary、bgSecondary→bgTertiary、bgTertiary→bgTertiary 再提亮 5%），编辑器内的代码块等表面随之上移。Hostile host 页不做上移，以免覆盖 Stone mapping 的验证。亮色不变。
- 右侧：一个面板位，左边 1px 线，顶部 56px 标题行。面板内各节以 1px 线分隔，节标题 12px / 500 / `textTertiary`。
- 每页右侧面板内容：
  - Editor：Inspector — Variant、Colors（5 个预设为单选列表 + 自定义 accent）、Mention+（平台 chip 多选）、Panels（Renderer / JSON / Import 开关，以及全宽开关）。Renderer / JSON / Import 打开后在舞台中、编辑器下方按开关顺序出现。
  - Presets：9 个预设移到侧栏树；Inspector — Variant、Edit / Render 模式、JSON 开关。
  - Comments：评论列表（现有 `CommentSidebar`）。
  - AI Agent：聊天面板，宽 380。
  - Hostile host：Inspector — Variant、Hostile CSS、Stone mapping。
  - 宽度：300（AI 为 380）。
- 主按钮：`text` 底 + `bg` 字，圆角 8。

### 5.4 尺寸

| 项                                         | 值                   |
| ------------------------------------------ | -------------------- |
| 侧栏                                       | 260                  |
| 顶部行（侧栏 / Workbench 顶栏 / 面板标题） | 56                   |
| 导航项                                     | 32，圆角 8           |
| Doc 正文                                   | ≤760                 |
| 总览内容                                   | ≤1080，4 列，间距 16 |
| 目录                                       | 200                  |
| Workbench 右面板                           | 300（AI 380）        |
| 间距                                       | 4px 网格             |

## 6. token 映射（已定）

站点 chrome 只读 `--rc-*`。对应关系：

| 角色               | 现在                            | 改读                                               |
| ------------------ | ------------------------------- | -------------------------------------------------- |
| 页面、侧栏底色     | `--demo-bg #fafafa`             | `bg`                                               |
| 卡片 / 面板        | `--demo-surface`                | 取消填充，改用 `bg` + 1px 线                       |
| 预览舞台、代码     | `--demo-surface-alt`            | `bgSecondary`                                      |
| 主文字             | `--demo-text`                   | `text`                                             |
| 导航文字、正文     | `--demo-text-secondary #525252` | `textSecondary`                                    |
| 组标题、元信息     | `--demo-text-muted #a3a3a3`     | `textTertiary`                                     |
| 闲置图标、占位     | —                               | `textQuaternary`（不用于可读文字）                 |
| 结构线             | `--demo-border`                 | `border`                                           |
| 列表内行线、代码头 | `--demo-border-light`           | `borderSubtle`                                     |
| hover              | `--demo-hover #f5f5f5`（实色）  | `fillSecondary`                                    |
| 选中               | `--demo-accent-bg`              | `fill`                                             |
| 主按钮             | `--demo-accent`                 | `text` 底 / `bg` 字                                |
| 焦点、正文链接     | —                               | `accent` / `accentLight`                           |
| 代码面板           | `--demo-code-bg #1a1a2e`        | `bgSecondary` + `borderSubtle`，与编辑器代码块一致 |

要求：

- `.app` 根上必须能解析全部 `--rc-*`（亮暗都要）。实现方式交给实现方（例如在 `.app` 挂 `articleTheme` class；暗色已由 `[data-theme="dark"]` 全局规则覆盖）。
- `--demo-*` 可以先作为 `var(--rc-*)` 的别名过渡，完成时 chrome 规则里不再出现 `--demo-*` 的裸色值。是否最终删除别名由实现方决定。
- 字体：chrome 用 `--rc-font-family-sans`，等宽用 `--rc-font-mono`。

## 7. 约束

- 遵循 AGENTS.md：React 19 `use(Context)`；context value 为对象时必须 `useMemo`；中性灰只用 neutral 系。
- 用户全局规则：默认不写注释；单文件 ≤500 行，React 组件 ≤300 行。`ExtensionsPage.tsx`（1416 行）在拆成逐项页时必须拆成多个文件。
- 继续使用 `react-router-dom`，沿用现有 `createBrowserRouter`。
- 只对改动文件跑 eslint / prettier / typecheck；不跑全量 build；不自动 commit。
- 窄屏：<1200 隐藏目录；<768 侧栏收为抽屉（顶部出现菜单按钮）。具体断点值交给实现方，行为必须满足：手机宽度无横向滚动，导航可达。

## 8. 用户已定的补充

- **⌘K 全站跳转**：命令面板可搜所有一级页面、23 种节点、10 个扩展、图表类别、9 个预设，回车跳转。面板是弹层：圆角 12、`boxShadow` menu、条目高 32 / 圆角 8，hover / 当前项用 `fillSecondary` / `fill`。侧栏树、上下页、计数、命令面板共用同一份「站点目录」数据，不各自维护。窄屏抽屉里同样可用。
- **节点类型元数据表**：在 `demo/src/fixtures/` 新增一张 23 行的表：类型 key（真实 `getType()` 值）、显示名、一句话简介、所属包、是否有 edit 变体。单项页的 H1、导语、元信息 chip 读这张表；样本仍来自 `node-samples.ts`，按类型归并。一句话简介由实现方起草，交用户过目后定稿（这是本项目唯一允许的新增文字）。

## 9. 验证

- `pnpm dev` 起 demo，每个一级路由与每个单项页至少打开一次，亮暗各截一张图，与画板对照。
- 侧栏当前项、树指示线、目录指示线在路由切换时正确跟随。
- 搜 `demo/src` 的 chrome 样式里没有残留裸色值（fixtures、预设色板这类用户数据除外）。
- 改动文件的 eslint 与 typecheck 通过；现有 vitest 通过。

## 10. 交给实现方的部分

- 路由形态（例如 `/nodes/:type`、`/extensions/:key`、`/charts/:kind`）和旧查询参数的兼容方式，前提是满足 §4 的 URL 反目标。
- `demo.css` 是继续写普通 CSS 还是部分改为 Vanilla Extract（demo 不在「编辑器包不用 Tailwind / 必须 VE」的约束范围内，两者都可以，保持一致即可）。
- 组件拆分方式、文件组织。
- `demo-ui-*` 三个 skill 的具体改写。

## 11. Builder check 结果

已由设计方定（我的决定，用户可推翻）：

- **Hostile host 的 Stone mapping 会让站点 chrome 一起变成暖灰**：接受。Stone mapping 本来就是在 `:root` 模拟宿主映射，chrome 跟着变正说明映射覆盖了整页。§4「不出现带色相的灰」不适用于这个开关打开时的状态。实现方不需要为 chrome 做屏蔽。
- **Extensions 与 Charts 的页面形态**：
  - Extensions 单项页：面包屑 → H1（扩展 `name`）→ 导语（扩展 `description`）→ 包名 chip → 该扩展原有的演示分节，每节一个 H2，节间 1px 线。扩展自带的控件（Diff 的样本选择与变体、Excalidraw 的模式等）留在各自小节里。不套 Nodes 的 Preview / Edit / JSON 标签行。
  - Charts 类别页：面包屑 → H1（类别名）→ 该类别全部样本纵向排列，每个样本带小标题（样本 `label`）。不加 Variant 切换。
  - 三处总览页的磁贴预览一律用静态线稿，不渲染真实组件，避免 Excalidraw、Diff、Mermaid 等重组件进总览。线稿风格参照画板 Nodes overview。
