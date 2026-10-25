# UI polish — Quiet Ink applied to every chrome component

日期：2026-10-26
视觉参考：https://claude.ai/artifact/3hwQSmb4qzVMHuXrMduA6r 最下一行「UI polish」：`Polish · 0 Foundations`、`1 Overlays`、`2 Controls`、`3 Display`、`4 Editor chrome`。每个组件都有「改什么 / 现在的截图 / 亮暗两版目标稿」。画板就是验收标准，本文件写画板表达不了的部分。
前置：`2026-10-25-quiet-ink-design-refresh-design.md`（token 取值）、`2026-10-25-components-catalog-design.md`（demo 站 Components 目录，审查结果写在 `demo/src/site/reviews.ts`）。

## 1. 意图

Components 目录把 19 个 UI 组件和 8 个编辑器外围部件摆到了一起，问题一目了然：

- 菜单、弹窗里的字号用 em 计算，实际渲染成 10.5–12.25px。
- 焦点样式有 7 种写法，hover 填充有 6 种。
- 控件高度从 24 到 40 都有。
- 勾选框、`accent` 按钮把强调色当填充用。
- 暗色下弹层和页面同为纯黑，边界看不出来。

这次把画板上定下的样式落到包里，让所有 chrome 组件读同一套规则。用户在画板上逐条评审过（见 §5），这里不再讨论方向。

## 2. 目标

- **G1 共享基础**：在 `rich-style-token` 提供 chrome 专用的规则：px 字号、固定圆角与间距、焦点环、填充层级、弹层动效、`bg-elevated`。组件只读这一层，不再各写各的。
- **G2 19 个 UI 组件**：按画板 1–3 改完，包括画板上新增的状态（pressed、toggled、indeterminate、invalid 等）。
- **G3 新组件 Kbd**：一键一个键帽，平台感知；菜单、Tooltip、链接编辑器都改用它。
- **G4 编辑器外围**：Toolbar、Floating toolbar、Link editor 按画板 4 改；Block handle 按方案 D 重做；Slash menu、Mention menu、Table controls、Image editor 套用共享的菜单、输入框和弹窗规则。
- **G5 文档站同步**：Components 目录新增 Kbd 页（UI 变成 20 个），Anatomy 行改成新规格，`reviews.ts` 记录审查结果。

## 3. 非目标 / 反目标

- 非目标：内容节点（正文、标题、代码块正文、表格内容等）的样式。这次只动 chrome。
- 非目标：改 token 的取值，§4.1 列出的除外。
- **反目标（做了就算失败）**：
  - 组件里出现裸色值或 `color-mix(text …%)` 这类临时混色（阴影里的 rgb 除外）。
  - 非状态类组件用强调色做填充。强调色只出现在焦点环、链接、光标、选区和拖放线上。
  - chrome 尺寸随 variant 变化，例如 comment 编辑器里菜单内边距变成 2px。
  - 为了视觉改动破坏现有公开 API。只能新增 prop 或给旧值做别名，不能删除导出、不能改 prop 类型。

## 4. 已定的设计

### 4.1 Token 与共享规则（画板 0）

- **新增颜色 token** `bgElevated`（`--rc-bg-elevated`，带 host 回退）：亮色 `#ffffff`，暗色 `#171717`。所有浮层（菜单、弹出框、对话框、浮动工具栏、链接编辑器）的底色都改用它。
- **暗色 `ring` 从 0.1 调到 0.12**，让浮层边缘在暗色下能看清。
- **chrome 字号固定为 px**：
  - 12/16·500：分组标签、快捷键、徽标
  - 13/20：按钮、输入框、说明文字
  - 14/20：菜单项、弹出框标题
  - 16/24·600：对话框标题

  内容区的 em 字号不动。

- **chrome 圆角和间距固定**，不读 variant 的 spacing / radius：
  - 弹层：圆角 12，内边距 4；菜单项圆角 8
  - 弹出框：内边距 12
  - Tooltip：圆角 8，内边距 4 8
  - 徽标和键帽：圆角 4
- **控件高度**只有三档：24 / 28 / 32。菜单项、工具栏按钮都是 32。图标按钮做成固定尺寸的正方形。
- **状态阶梯**：
  - hover：`fillSecondary`
  - 按下 / 展开 / 选中：`fill`
  - 焦点：`0 0 0 1px accent, 0 0 0 3px accentLight`
  - 禁用：透明度 0.5
  - 主按钮：`text` 色底，`bg` 色字
- **分隔线**用 `borderSubtle`。**遮罩**：亮色 `rgb(0 0 0 / .32)`，暗色 `.56`。**占位文字**用 `textTertiary`。
- **动效**：
  - 弹层：进入 120ms ease-out，scale 从 .97 到 1，从锚点一侧展开；退出 80ms ease-in。
  - 状态切换：120ms。
  - 布局变化（指示条、滑块、折叠高度）：200ms。
  - 开启 `prefers-reduced-motion` 时只保留透明度变化，Spinner 改为减速而不是停止。

### 4.2 组件

每个组件的改动以画板上的「改什么」列表为准。下面列出画板之外需要写明的决定：

- **ActionButton**：`variant="accent"` 保留，但视觉上等同于 `solid`（主按钮），类型上标为 deprecated。新增按下态，以及 `aria-pressed` 的切换态（`fill`）。
- **Select / Combobox / DropdownMenu**：共用同一套弹层和菜单项。新增的槽位：
  - 快捷键槽位，内放 Kbd，用 muted 外观
  - 危险项样式
  - Combobox 输入框的样式（目前完全没有）
- **Tooltip**：反色外观（`text` 底，`bg` 字），不加投影；快捷键用 inverted 外观的 Kbd。
- **Checkbox**：选中后为 `text` 色底加 `bg` 色勾；去掉弹跳和涟漪动画；新增 indeterminate 状态；焦点环加在方框上，而不是整行。
- **Badge**：圆角 4（原来是胶囊形）；sm 高 18，md 高 20。
- **Alert**：
  - 背景用语义色 4%，描边用语义色 32%，图标用语义色。
  - action 按钮跟随语义色：语义色文字，12% 底，hover 时 18%。
  - 新增 `success` 和 `neutral` 两个 variant，以及可选的标题。
- **Dialog**：
  - 内边距：头部 `16 48 0 16`，底部 16；关闭按钮 28px，距角 12。
  - 标题用 chrome 无衬线字体，不再跟随内容字体（否则在 note variant 下会变成衬线）。
  - Sheet 的遮罩和动效同步修改。
- **Kbd（新组件）**：
  - API：`<Kbd keys={['mod', 'shift', 'z']} size="sm|md" tone="default|muted|inverted" />`。
  - 尺寸：md 20，sm 18，键帽之间间隔 2px。
  - 平台：`mod` 在 macOS 显示 ⌘，其它平台显示 Ctrl；修饰键在 macOS 用符号，其它平台用文字。
  - Backspace、Enter、Delete、方向键用图标，不用 ASCII 符号。
  - 判断平台的方法由实现方定，但 SSR 渲染不能出错。

### 4.3 编辑器外围（画板 4）

- **Toolbar**：
  - 平铺在页面上，高 40，底部一条 `borderSubtle` 线，不加投影。
  - 只占一行，放不下的按钮收进 ⋯ 菜单，不再换成多行。
- **Floating toolbar**：外框圆角 8、内边距 4；按钮 28，圆角 4，按钮之间间隔 2px；按下态用 `fill`。
- **Link editor**：
  - 查看态是一行，高 40：链接图标 + URL（13px 无衬线，中间截断，左侧内缩 12），然后是 Open、Edit、Copy、Unlink 四个图标按钮，各带 tooltip。
  - `renderExtraActions` 的额外动作（例如转换为 LinkCard）放进同一行。
  - 编辑态：输入框带焦点环，旁边是主按钮「Save」，按钮里带一个 Enter 键帽。
  - 弹层始终贴在链接下方，不超出编辑器边界。
- **Block handle（方案 D）**：
  - 去掉现在挨着握把的「+」。
  - 指针停在块上：在文本列左侧的 32px 槽位里、对齐首行显示握把，20×24。拖动握把移动当前块；点击握把打开现有的块菜单（Turn into / Duplicate / Delete 等），菜单套用新的菜单规则。
  - 指针停在块与块之间的空隙（含第一个块之上、最后一个块之下）150ms 后：显示一条 1px `textQuaternary` 插入线，左侧有一个 20 的「+」按钮（圆角 6，`bgElevated` 底，`shadow-xs`）。点击后在该位置插入空段落，并打开 slash 菜单。
  - 拖动时显示 2px 的 accent 拖放线。
  - 位置沿用现在的做法：两个控件都画在编辑器根节点左侧，编辑器不加左内边距，所以编辑时的文本列和只读渲染器保持对齐。宿主需要在编辑器左侧留出至少 32px，demo 的预览框也要留。（用户选择）
  - 键盘：`⌘⇧↑` / `⌘⇧↓` 移动当前块。
- **Slash / Mention / Table / Image editor**：只套用 §4.1 的规则（弹层、菜单项、输入框、对话框、Kbd），不改交互。

### 4.4 文档站

- 在 `site/component-data/ui.ts` 加上 Kbd（归 Display 类）。UI 数量从 19 变成 20，`components.test.ts` 和 `catalog.test.ts` 里的计数一起改。
- 所有 Anatomy 行改写成本次定下的规格。
- 每完成一个组件，在 `reviews.ts` 里把它记为 `passed`；如果暂时做不到，记为 `issues` 并写明原因。Dialog 的 portal container 那条 finding 不在本次范围内，保持 open。

## 5. 用户已确认的决定

画板评审期间的意见，全部已按如下方式落进画板：

- 弹窗内边距太大，收紧到 16。
- 暗色下弹窗没有边界，新增 `bg-elevated` 并把暗色 ring 调到 .12。
- 不要纯 ASCII 快捷键，新增 Kbd 组件。
- Alert 的 action 按钮跟随语义色；描边加深、底色变浅。
- Floating toolbar 圆角太大，改为 8/4；按钮之间要留 gap，定为 2px。
- 链接编辑器左侧视觉留白加大，内缩 12。
- 链接编辑器编辑态用「文字 + Kbd」的主按钮。
- Block handle 重新构思：「+」放在两个块之间的真实空隙里，握把只负责当前块。即方案 D，用户回复「D is ok」。

以下是设计方的默认决定，用户没有提出异议：Tooltip 反色、Badge 改为圆角 4、`accent` 按钮等同于主按钮、Checkbox 用 `text` 色而不是强调色、chrome 不再跟随 variant 的尺寸、遮罩改为 .32 / .56。

## 6. 约束

- 遵循 AGENTS.md 与用户全局规则：
  - Vanilla Extract；React 19 写法（`use()`，context value 用 `useMemo`）。
  - 默认不写注释；只有被公开导出的 API 可以写 JSDoc，`@deprecated` 也属于这一类。
  - 文件不超过 500 行，React 组件不超过 300 行。
- 静态 / 编辑拆分规则不变：Kbd 这类轻量组件可以放进 static 路径，但不能把 lucide 以外的重依赖带进 static 节点。
- 新增 token 要同时出现在三处：contract 的注释默认值、`themes.ts` 的亮暗取值、demo Tokens 页的颜色表。Tokens 页的覆盖测试会因为少一行而失败，属于预期行为。
- 只对改动过的文件跑 lint 和 typecheck；直接在 `main` 上工作；不自动 commit，每完成一个阶段问用户是否提交。

## 7. 验证

- Components 目录里每个组件页的 Light / Dark 两个预览框，都要和对应画板的目标稿对照截图。States 节里由 `Force` 强制出来的 hover / focus 状态也要对照。
- 状态阶梯的单测：新增或修改的样式函数，如果有纯逻辑（例如 Kbd 的按键到显示内容的映射、平台判断），写 vitest 测试。
- Block handle D 用浏览器验证四个状态：块上显示握把、空隙显示插入线、点击 + 后打开 slash 菜单、拖动显示拖放线；另外验证 `⌘⇧↑/↓`。
- 在 comment variant 下检查菜单内边距仍为 4、菜单项圆角仍为 8。
- 打开 reduced motion 后，确认弹层只做透明度变化。
- 全量 vitest 通过；改动文件 eslint 与 typecheck 通过。

## 8. 各组件改动清单（来自画板）

| 组件              | 改动                                                                                                                                                                       | 新增 API                                          |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Dialog            | 遮罩 .32/.56；标题 16/24·600 无衬线；描述 14/22 `textSecondary`；关闭按钮 28 方块 圆角 8；内边距 16；动效 120/80                                                           | 无                                                |
| Popover           | 内边距 12，宽 280；标题 14/20·600，描述 13/20；箭头描边 `ring`；动效从锚点侧                                                                                               | 无                                                |
| Dropdown Menu     | 共享菜单项（32 高，padding 0 8，gap 8）；标签 12/16；分隔线 `borderSubtle`；sideOffset 4，去掉定位器 2px 偏移                                                              | 快捷键槽位（Kbd）、危险项 `variant="destructive"` |
| Select            | 触发器 28；hover `fillSecondary`，展开 `fill`；弹层内边距 4；共享菜单项；选中项 500 字重；占位 `textTertiary`                                                              | 无                                                |
| Combobox          | 输入框 28 + `shadow-xs` + 焦点环；弹层宽度等于锚点宽度；空状态 8 12 内边距                                                                                                 | 无                                                |
| Tooltip           | 反色、无投影；12/16·500，内边距 4 8；退出 80ms                                                                                                                             | 快捷键槽位（Kbd inverted）                        |
| Action Button     | `accent` 等同 `solid`；焦点环；sm/md/lg = 24/28/32，全部圆角 8；图标按钮固定正方形；按下态 `fill`；禁用 .5                                                                 | `aria-pressed` 驱动的切换态（不加新 prop）        |
| Segmented Control | sm 28 / md 32；轨道 `fillSecondary`，滑块 `bg` + `shadow-xs`；焦点环；未选项 hover 变 `text`；滑块动画 200ms                                                               | 无                                                |
| Animated Tabs     | hover 变深为 `text`；13/20·500，36 高；底线 `borderSubtle`；焦点环                                                                                                         | 无                                                |
| Checkbox          | 选中 `text` 底 `bg` 勾；16 方框 圆角 4 1px `textQuaternary`；120ms，无弹跳涟漪；焦点环在方框上；标签 14/20，描述 13/20                                                     | `indeterminate` prop                              |
| Color Picker      | 面板内文字 12–13px，hex 用 `fontMono`；圆角归档（控件 8，轨道全圆）；选中色块 1.5px `text` 圆环；hex 输入框标准样式，无效用 `alertCaution`；Cancel/Apply 复用 ActionButton | 无                                                |
| Textarea          | 焦点环；`shadow-xs` 代替边框；14/20，单行 28；占位 `textTertiary`；hover / 禁用 / 无效态                                                                                   | 无效态读 `aria-invalid`（不加新 prop）            |
| Alert             | 语义色 4% 底、32% 描边、图标语义色；action 按钮跟随语义色                                                                                                                  | `variant` 增加 `success`、`neutral`；可选 `title` |
| Badge             | 圆角 4；sm 18 (11/16)、md 20 (12/16)；neutral 用 `fillSecondary` + `textSecondary`                                                                                         | 可选 `dot`                                        |
| Status Dot        | md 10；脉冲只在允许动效时出现                                                                                                                                              | 无                                                |
| Spinner           | 12/16/20；双色环（20% 轨道 + 实色弧）；0.7s                                                                                                                                | `size` 增加 `lg`                                  |
| Collapsible       | 触发器焦点环；13/20·500 `textSecondary`，hover `text`；箭头 16                                                                                                             | 无                                                |
| Scroll Area       | 只保留一条滚动条实现路径；6px 全圆滑块，`textQuaternary`，hover `textTertiary`                                                                                             | 无                                                |
| Code Block        | 复制按钮 hover `fillSecondary`、按下 `fill`；头部 32 高 12/16 `borderSubtle`；已复制态；复制与展开按钮焦点环                                                               | 无                                                |
| Kbd（新）         | 见 §4.2                                                                                                                                                                    | 新组件                                            |

除表中「新增 API」一列外，其余都只是样式改动。

## 9. Builder check 结果

用户已定：

- Block handle 的握把和「+」仍画在编辑器左侧（见 §4.3）。

设计方的决定（用户可推翻）：

- **链接编辑器的状态**：新建的或空的链接直接进入编辑态；点击已有链接进入查看态。编辑态失焦时仍然保存（保持现有行为）；Esc 取消编辑，回到查看态；Save 保存后回到查看态。
- **Toolbar 的「平铺」**：保留 sticky `top: 0`；宽度撑满宿主给的容器，去掉 `maxWidth`、外边距、圆角和投影。溢出的按钮进 ⋯ 菜单，和现有的插入菜单并存；`maxVisibleInsertItems` 继续控制插入菜单的条目数。
- **`⌘⇧↑/↓` 移动块**：
  - 在文本里或选中块时都生效；macOS 用 ⌘⇧，其它平台用 Ctrl+Shift。
  - 选中多个块时一起移动，和现有菜单里的 Move Up / Move Down 一致。
  - 已有的 Shift+Arrow 块选择行为不变。
- **「块」的定义**：只指编辑器根节点的直接子节点，和现在一致。列表项和引用、折叠块内部的块不单独算作块。
- **快捷键字符串**：现有的 `shortcut?: string` 类型不变。新增一个 `parseShortcut()`，把字符串解析成 Kbd 的 keys，字符串里的「Ctrl」「Cmd」统一映射为 `mod`。
- **链接编辑器的额外动作**：`actionButtonClassName` 改成 28 高的 ghost 按钮，允许带文字，不强制改成正方形图标。这样下游的「To Card」等按钮不用改。
- **审查状态**：Dialog 的 portal finding 还开着，按 `reviews.test.ts` 的规则保持 `issues`；其余完成的组件记为 `passed`。

## 10. 交给实现方的部分

- chrome 规则在 `rich-style-token/styles` 里的具体形态：常量、recipe 还是 mixin。前提是组件不再直接读 variant 的 spacing / radius。
- 实施顺序。建议按三个阶段推进：① token 与共享规则 + Kbd；② 19 个 UI 组件；③ 外围插件（含 Block handle D）。
- 现有 hover / pressed 动画的迁移方式（keyframes 还是 starting-style），前提是不再同时声明两套。
- Toolbar 溢出到 ⋯ 菜单的测量方式。
- Block handle 空隙检测的实现方式，前提是不能让每次 mousemove 都触发 Lexical 更新。
