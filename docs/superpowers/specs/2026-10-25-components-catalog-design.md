# Components 目录 — Design tokens / UI / Editor chrome

日期：2026-10-25
视觉参考：https://claude.ai/artifact/3hwQSmb4qzVMHuXrMduA6r 第三行画板：`Components · Design tokens page`、`UI · Overview`、`UI · Dropdown Menu page`、`Editor chrome · Overview`、`Editor chrome · Slash menu page`。
前置：`2026-10-25-docs-site-layout-design.md`（左右布局、Doc 模板、站点目录 `demo/src/site/catalog.ts`，已实现，未提交，分支 `feat/docs-site-layout`）。

## 1. 意图

demo 站目前只展示内容节点（Nodes / Extensions / Charts），没有展示编辑器自己的 UI：弹层、菜单、按钮、工具栏这些。用户要：

1. 在文档站里**单独展示内建 UI 组件的目录**，包括基础组件（Modal、Dropdown 等）和编辑器外围组件（工具栏、slash 菜单等）。
2. 这个目录同时是**样式审查的工作台**：后面要逐个找出样式不好的组件并调整，每页要能看出问题、记下问题。
3. 加一个 **Design tokens 页**，作为这一组的第一页。

## 2. 现状（已核实）

- `@haklex/rich-editor-ui` 的 `src/components/` 下有 21 个目录。`index.ts` 从 `.` 导出全部组件（Dialog、Popover、DropdownMenu、Select、Combobox、Tooltip 等都在内）。
  - `viewport-gate` 是逻辑组件，`quote-attribution` 是编辑器插件，这两个不进 UI 目录。
  - 其余 19 个按画板分组：
    - **Overlays 6**：Dialog、Popover、Dropdown Menu、Select、Combobox、Tooltip
    - **Controls 6**：Action Button、Segmented Control、Animated Tabs、Checkbox（`AnimatedCheckbox`）、Color Picker、Textarea（`AutoResizeTextArea`）
    - **Display 7**：Alert、Badge、Status Dot、Spinner、Collapsible、Scroll Area、Code Block
- 已核实的变体：
  - Badge：`variant` 为 neutral / success / error / warning / info，`size` 为 sm / md
  - Alert：`variant` 为 info / warning / error
  - StatusDot：`status` 为 idle / active / success / error / warning，另有 `pulse`、`size`
  - ActionButton：`variant` 为 ghost / solid / outline / accent，`size` 为 sm / md / lg，另有 `danger`、`icon`、`rounded`
  - Spinner：`size` 为 sm / md
  - SegmentedControl：`size` 为 sm / md，另有 `fullWidth`
- 弹层类组件通过 Base UI 的 Portal 挂到 `document.body`，再由 `PortalThemeWrapper` 从 `PortalThemeProvider`（`@haklex/rich-style-token`）读取主题 class 和 `data-theme`。所以只要给每个预览框外包一层各自的 `PortalThemeProvider`，弹层就能分别按亮色或暗色渲染，**不需要改包**。
- Editor chrome 共 8 个，来自以下包：
  - `rich-plugin-toolbar`、`rich-plugin-floating-toolbar`
  - `rich-plugin-slash-menu`、`rich-plugin-mention`
  - `rich-plugin-block-handle`、`rich-plugin-link-edit`、`rich-plugin-table`、`rich-plugin-image-editor`
  - 分组：Bars（Toolbar、Floating toolbar）、Menus（Slash menu、Mention menu）、In-place（Block handle、Link editor、Table controls、Image editor）。
  - demo 的 `LexicalEditor` 已经挂载了其中大部分。
- Slash 菜单的实测规格：
  - 菜单宽 288，padding 4。分组标题 padding 8 10 4，分组之间有 1px 分隔线。
  - 条目 padding 6 8，图标 28×28，带描述行。
  - 无结果时显示「No matching commands」。
  - 内建分组有 BASIC BLOCKS、LISTS，节点自己注册的条目分在 INLINE / MEDIA / ADVANCED / LAYOUT。
- Token：`rich-style-token` 导出 `lightArticleColors`、`darkColors`、`fonts`，以及 `articleLayout`、`noteLayout`、`commentLayout`、`chatLayout`。**不导出** `darkBoxShadow`。

## 3. 目标

- **G1 导航**：侧栏新增 **Components** 分组，位于 Reference 和 Labs 之间，依次为 Design tokens、UI（19）、Editor chrome（8）。三者都进入站点目录（`catalog.ts`），树、上一页 / 下一页、计数和 ⌘K 都自动覆盖。
- **G2 Design tokens 页**：按画板展示 Color、Typography、Spacing、Radius、Shadow、Host interface 六节。
- **G3 UI 总览 + 19 个组件页**。
- **G4 Editor chrome 总览 + 8 个页面**。
- **G5 审查状态**：每个组件有审查状态和问题记录，总览页可以按状态筛选，组件页显示状态和问题。

## 4. 非目标 / 反目标

- 非目标：本项目**不修改任何组件样式**，也不修改 `packages/` 下的代码。样式调整是下一个项目，由这里的审查结果驱动。
- 非目标：组件 API 的完整文档（属性逐个说明、使用教程）。Parts 表只列导出名和值得知道的关键属性。
- **反目标（做了就算失败）**：
  - 预览、状态、in-context 演示中用**仿制品**代替真实组件。审查的意义就在于看到真实样式；只有总览磁贴可以用静态线稿。
  - Token 页**写死数值**。一旦与包内取值不一致，这一页就成了错误信息源。
  - 暗色预览靠 CSS filter 或者手写一套颜色来模拟，而不是通过真实的 `data-theme` / `PortalThemeProvider`。

## 5. 页面设计（已定）

### 5.1 路由

| 路由          | 页面               |
| ------------- | ------------------ |
| `/tokens`     | Design tokens      |
| `/ui`         | UI 总览            |
| `/ui/:id`     | 组件页             |
| `/chrome`     | Editor chrome 总览 |
| `/chrome/:id` | Editor chrome 页   |

未知 id 重定向到对应总览页（与现有 Nodes 页的做法一致）。

### 5.2 Design tokens 页（Doc 模板，wide）

- 面包屑 Components / Design tokens，H1，导语，包名 chip。
- **Color**：按 Text、Surface、Fill、Line、Accent、Semantic 分组成表。
  - 每行：双色块（左为白底上的亮色值，右为黑底上的暗色值）、`--rc-*` 名、亮色值、暗色值、用途。
  - 数值**从包里读**：颜色用 `lightArticleColors` / `darkColors`；导出里没有的（暗色阴影、`accentLight` 计算后的值），从一个亮色帧和一个暗色帧上 `getComputedStyle` 读取。
  - 用途文案按画板。
- **Typography**：article 字号阶梯用真实样例渲染（H1 … Mono），右侧标注字号 / 行高 / 字重；再加一张 variant 表（article、note、comment、chat）。数值取自 `*Layout` 导出。
- **Spacing**：xs–xl 用色条展示；flow 四项（paragraph、list、block、heading）列成表。
- **Radius**：sm、md、lg 三个样块，外加同心规则示例（12 − 4 = 8）。
- **Shadow**：xs、menu、modal 三种，分别放在亮、暗两个框里。
- **Host interface**：`--rc-host-*` 的用法代码块，带 Copy 按钮。

### 5.3 UI 总览（Doc 模板，wide）

- 分类分段筛选（All / Overlays / Controls / Display，带计数），再加一个审查状态筛选。
- 按分类分节，每节一组磁贴网格。磁贴沿用 Nodes 总览的 `Tile`：静态线稿 + 组件名 + 导出目录名。线稿按画板。
- 磁贴上显示审查状态的小圆点：未审为灰色，有问题为 caution 色，通过为 tip 色。

### 5.4 组件页（Doc 模板，wide，不显示 TOC）

章节顺序固定，即用户确认过的：**Preview → States → Anatomy → Parts → Style review**。

- **页头**：面包屑 Components / UI / 分类，H1 右侧放审查状态 chip，导语，导出目录名 chip 和包名 chip。
- **Preview**：「Light」「Dark」两个并排的框，内容是同一份真实组件实例。
  - 每个框用 `data-theme` 加对应主题 class 包住；弹层类再各包一层 `PortalThemeProvider`。
  - 弹层类组件在预览中默认**展开**（受控的 `open`），两个框可以同时展开。
- **States**：同一组件的各种状态并排列出：idle / hover 或 highlighted / selected 或 checked / disabled / keyboard focus，再加该组件特有的变体，例如 Badge 的 5 个 variant、ActionButton 的 4 个 variant × 3 个 size。必须用真实组件渲染。
- **Anatomy**：部件 | 规格 | token 三列表。内容按 Quiet Ink 规范（`2026-10-25-quiet-ink-design-refresh-design.md` §6、§7）写**应有**的规格，作为审查的对照标准。
- **Parts**：导出名和关键属性。
- **Style review**：问题列表，每条为「问题 + 违反的 token 或规格 + 状态（open / fixed）」。没有问题时显示占位文字。
- 页尾有上一页 / 下一页。

### 5.5 Editor chrome 总览与页面

- 总览：按 Bars / Menus / In-place 分组，磁贴线稿把组件画在编辑器上下文里，按画板。
- 页面结构：「In the editor」（亮、暗两个**可交互**的 LexicalEditor 并排，只挂载演示该部件需要的插件）→ States（冻结的快照，例如 slash 菜单的「无查询 / 已过滤 / 无结果」）→ Keyboard（有快捷键的部件才有）→ Anatomy → Style review。
- 能程序化打开的部件（例如 slash 菜单、mention 菜单），页面加载时预先打开，与画板一致；做不到的显示一行提示（「在这里输入 /」）。

### 5.6 审查数据

- 新增 `demo/src/site/reviews.ts`：按组件 id 记录 `status: 'unreviewed' | 'issues' | 'passed'` 和 `findings: { title; rule; state: 'open' | 'fixed' }[]`。初始全部为 `unreviewed`、问题列表为空。
- 总览筛选、状态圆点、页头 chip、Style review 节都读这一处。

### 5.7 数据与代码组织

- 新增 `demo/src/site/components.ts`：UI 与 chrome 的注册表，每项包括 id、label、category、package、exports、description、anatomy 行。`catalog.ts` 从这里生成导航树和搜索条目。
- 每个组件的预览、状态和演示放在 `demo/src/pages/ui/demos/<id>.tsx` 和 `demo/src/pages/chrome/demos/<id>.tsx`，经注册表按 id 映射（与 `pages/extensions/details` 的做法一致）。
- 预览框（亮暗并排、主题包裹）抽成一个共享组件，供 UI 页和 chrome 页共用。

## 6. 约束

- 沿用 `demo-ui-*` skill 的约定：只读 `--rc-*`，不出现裸色值；不用阴影卡片；选中态用 fill。
- 遵循 AGENTS.md 与用户全局规则：React 19 `use()`；context value 用 `useMemo`；默认不写注释；文件 ≤500 行，组件 ≤300 行。
- 不改 `packages/`。如果某个组件不改包就做不到亮暗并排或展开预览，记录下来，退而只展示一个主题，并在页面上注明。
- 新增的纯逻辑（注册表与目录的一致性、审查状态统计、搜索条目）要写 vitest 测试，放在 `demo/src/site/*.test.ts`。
- 只对改动文件跑 lint / typecheck；不自动 commit。工作区里 `packages/rich-diff*` 有别的会话未提交的改动，不要碰。

## 7. 验证

- `pnpm dev`：每个新路由至少打开一次，亮、暗各截一张图，与画板对照。
- 每个 Overlays 组件页：两个预览框里的弹层要能同时展开，并且分别是亮色和暗色。
- ⌘K 能搜到 tokens 页、19 个 UI 组件和 8 个 chrome 部件。
- 写一个测试：Design tokens 页渲染出来的颜色值与 `lightArticleColors` / `darkColors` 一致。
- 改动文件的 eslint 与 typecheck 通过；全量 vitest 通过。

## 8. 交给实现方的部分

- 每个组件的演示内容（示例文案、选哪些状态和变体），前提是覆盖该组件所有公开的 variant 和 size。
- 两个框同时展开弹层的具体做法（受控 `open`、`modal={false}` 等），前提是不改包。
- hover / highlighted 等指针状态怎么在 States 里静态呈现。前提是用真实组件和它的真实 CSS，例如利用 Base UI 设置的 `data-highlighted` 等属性，不允许仿制。
- 各组件 Anatomy 行的具体内容，前提是以 Quiet Ink 规范为准。
- 磁贴线稿的细节。

## 9. Builder check 结果

已由设计方定（我的决定，用户可推翻）：

- **站点暗色时 Light 框会变暗**：`rich-style-token` 注册了 `[data-theme="dark"] .articleTheme`，祖先 `.app` 上的 `data-theme="dark"` 会让 Light 框里所有非 portal 内容一起变暗。处理方式：共享预览框给 Light 框设置 `--rc-host-*`，取值来自导出的 `lightArticleColors`；Dark 框同理用 `darkColors`。这用的是官方 host 接口，数值来自包，不属于「手写一套颜色」。阴影不走 host 接口，暗色站点下 Light 框的阴影仍是暗色阴影，这个限制在页面上注明。「亮区不能嵌在暗色祖先里」本身作为第一条 finding 记入 `reviews.ts`（归属 `rich-style-token`），供下一个项目处理。Token 页的 `getComputedStyle` 读数同样在这两个框里进行。
  用户已定：

- **审查记录方式**：页面只读。发现的问题通过直接编辑 `demo/src/site/reviews.ts` 记录，刷新即可看到，记录随 git 保存。不做页面内编辑。
- **语义色**：审查标准允许状态类组件使用语义色（info / tip / warning / caution），包括 Badge、StatusDot、Alert 和审查状态点。其他 UI（按钮、菜单、选中态等）仍只用中性色和 fill。Anatomy 按这条写。

- **Editor chrome 的 States**：
  - Slash menu 用导出的 `SlashMenuList` 渲染冻结状态（无查询、已过滤、无结果）。
  - Mention menu 用真实的 `MentionMenuItem` 拼出冻结列表，外层容器用插件自己的 class。实现时如发现做不到，退化为下一条。
  - 其余 6 个（Toolbar、Floating toolbar、Link editor、Block handle、Table controls、Image editor）不做冻结状态，States 节改为「如何触发」说明，指向上方的 live 编辑器。
  - 不做「运行时拷贝 DOM」的方案，太脆。
