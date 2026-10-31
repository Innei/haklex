# Agent 写入的流式显示（agent-stream-reveal）设计

日期：2026-11-01
讨论记录：ryugi document artifact `document/agent-stream-reveal`（`.ryugi/artifacts/document/agent-stream-reveal/doc.xml`，链接 https://ryugi.innei.dev/a/BYsG99O1RqKbmoarZRIed）；手感验证 spike：`demo/agent-stream-poc.html` + `demo/src/poc-agent-stream/`。本文已包含两者中的全部决定。

## 1. 为什么做

ryugi 和 mx-core 都有"agent 往文档里写内容"的功能，但"AI 在打字"的效果是两边各自拼的，而且都很糙：

- **ryugi**：服务端用 `@haklex/rich-collab-loro` 的 `streamAtVersion` / `planFrames` 把一次编辑切成最多 120 个 Loro update，按 `stepDelayMs` 随机间隔一个个推送（`ryugi/artifacts/src/server/document-session.ts`）。光标 `AgentCaret.tsx` 是 ryugi 自己写的。CRDT 历史里塞满了碎片记录；长段落最多 24 帧，每帧跳出一大截；嵌套 block 整块蹦出来。
- **mx-core**：agent 每次写入通过 `editDocAt` 一次性 `$reconcileRoot` 进去，只有 presence 里一个 block 级的光标（`caretAtBlock`），没有逐字效果。

目标：把效果收进 haklex，**对外暴露一个插件，下游挂上就能用，不做任何样式适配**。

## 2. 核心思路（已定）

**数据一次写完，editor 只负责动画。** agent 的写入照常一次性进入 Lexical / Loro，插件在本地把这次写入新增或改动的文字"逐字显现"出来，同时画一个跟着走的虚拟光标。

结果：

- CRDT 历史里每次 agent 编辑只有一条记录。
- 看同一篇文档的每个人各自在本地播放动画。
- 动画只是视觉效果，播放时数据已是最终状态，复制、保存、导出、打断都不会丢内容。

## 3. 目标 / 非目标 / 反目标

**目标**

- 新包 `@haklex/rich-plugin-agent-stream`，下游接入只需两步：挂上 `<AgentStreamPlugin />`，引入 `@haklex/rich-plugin-agent-stream/style.css`。
- ryugi 和 mx-core 的写入代码不用改，就能自动识别 agent 写入。
- 效果与 spike（`demo/agent-stream-poc.html`）一致，用户已确认"就是这个效果"。

**非目标**

- 图片、代码块、表格、mermaid、嵌套列表等非纯文本 block 的入场动画（直接出现）。
- `prefers-reduced-motion` 的特殊处理。
- ryugi 的 `PendingBlock`（"agent 接下来要写这里"的占位节点），属于 ryugi 业务。
- 静态 `RichRenderer` 的支持（只做编辑器）。
- mx-core 没有 draft 时的 review batch 路径（`DiffApplyPlugin` 插入 `AgentDiffNode`）：照旧直接出现。效果只在 CRDT 会话里出现（你定的）。

**反目标（做了等于白做）**

- 下游还需要自己写样式或光标组件。
- 动画落后真实数据太多（用户看到的长时间和数据不一致）。
- 打开一篇旧文档时把内容重新"打"一遍。

## 4. 已定的设计

### 4.1 识别 agent 写入

- `rich-collab-loro` 的 binding 在 `import(bytes)` 时识别 agent 写入：拿到这次**新导入**的 change（例如用 `doc.import` 返回的 `ImportStatus.success` 各 peer 的 counter span，再用 `doc.getChangeAt` 读 change），只要有一条 change 的 commit message 以 `agent:` 开头，就给 `pullFromDoc` 里那次 `editor.update` 在 `COLLAB_TAG` 之外再加上 `agent-write` tag。
- 两边现有 commit message 已经满足：ryugi 是 `agent: ${stats}`，mx-core 是 `agentCommitMessage()` 生成的 `agent:...`。
- 插件只监听 `agent-write` tag，本身不依赖 Loro。
- 不走 CRDT 的场景，下游用 `playAgentWrite(editor, fn)`，内部就是 `editor.update(fn, { tag: 'agent-write' })`。
- tag 常量从插件包导出（`AGENT_WRITE_TAG`），`rich-collab-loro` 侧定义同名字符串常量即可，不让 `rich-collab-loro` 依赖插件包。

### 4.2 哪些写入不播放

- 只播放插件挂载之后、实时收到的 agent 写入。
- binding 创建时的首次加载（`createLoroBinding` 里的初始 `pullFromDoc`）不打 `agent-write`。两边下游都是先加载文档、再创建 binding。
- 切换历史版本、撤销 / 重做不播放（它们不带 tag，天然不触发）。
- **重连 / 补拉不播放**（我的决定；窗口可通过 `createLoroBinding` 的 `agentLiveWindowSeconds` 调整，默认 15）：ryugi 每次 socket 重连会重新 import 整个 snapshot，mx-core 重连会 `sync.pull()`，期间错过的 agent 编辑都会作为"新导入"出现。binding 只给 timestamp 距今 15 秒以内的 `agent:` change 打 tag，更早的直接显示。ryugi（`document-session.ts`、`DocumentView.tsx`）和 mx-core（`crdt-draft-session.ts`）都已经 `setRecordTimestamp(true)`，所以不需要改下游；没有 timestamp 的 change（为 0）视为旧的，不播放。
- **"非 agent 更新打断播放"只看文字**（我的决定）：只有当非 agent 的更新改动了某个 block 尚未显示部分的文字时，才让那个 block 立即显示全文。只改 node 属性（例如 ryugi 服务端 autosave 约 300ms 后用 `stampBlockIds` 给新 block 补 `$.blockId`）不打断。实现上每帧按 key 重新读 block 文本，若与入队时的目标文本不一致就结束该段。

### 4.3 计算要显示哪些文字

插件在 update listener 里对比 `prevEditorState` 和 `editorState` 的顶层 block：

- **纯文本 block**（段落、标题、引用，即 `$isParagraphNode` / `$isHeadingNode` / `$isQuoteNode`）：
  - 新 block：整段逐字显示。
  - 已有 block 文本变了：算新旧文本的公共前缀 / 后缀，只逐字显示中间改动的部分，前后不变的部分保持可见。
  - 文本偏移按 `getAllTextNodes()` 拼接的文字算（不含换行节点），这样能直接映射到 DOM 的 text node。
- **其他 block**（decorator、代码块、表格、列表等）：新出现的按文档顺序排进队列，轮到它时直接出现；在那之前 `visibility: hidden` 占住位置。
- 同一 block 的 key 变了（reconcile 换了节点）按新 block 处理。

参考实现：`demo/src/poc-agent-stream/reveal.ts` 的 `plan()`。

### 4.4 显示方式

- 用 **CSS Custom Highlight API** 隐藏还没显示的字：`::highlight(agent-stream-hidden) { color: transparent; text-decoration-color: transparent }`。不改 Lexical 管理的 DOM。
- 段落一开始就占好最终高度，字在原位显现（已在 spike 里看过，接受）。
- **分档淡入**：分界处最新的约 6 个字，每 2 个字一档，透明度约 30% / 60% / 90%（最新的最淡），用三层 highlight 实现，颜色 `color-mix(in srgb, var(--rc-text) N%, transparent)`。
- 每一帧根据 block key + 文字偏移重新构造 Range（不要缓存 Range，Lexical 会替换 text node）。

### 4.5 虚拟光标

- 2px 竖条，强调色（`rich-style-token` 的 accent），上方小标签显示 agent 名字。
- 每一帧定位在**最后一个已显示字符**的 Range 的右边缘：取 `[boundary-1, boundary]` 的最后一个 client rect 的 `right`。这样换行时光标留在上一行行尾，不提前跳到下一行。分界在段首时用第一个字符的 `left`。
- 不加位置过渡（不能落后文字）。
- 直接出现的 block 轮到时，光标移到该 block 末尾。
- 播放时不闪；播放结束后停 600ms，再用 240ms 淡出。
- 名字来自插件属性 `agentName`，默认 `"AI"`。
- **播放状态回调**（我的决定）：插件属性 `onPlaybackChange?: (state: { playing: boolean; blockKey: NodeKey | null }) => void`，在开始、光标进入新 block、结束时调用。ryugi 顶栏的"<agent> 正在编辑 §<section>"改用它，而不是被删掉的光标事件链路；"正在编辑"状态也以本地播放为准，不再只看服务端的 `streaming`（服务端一次写完后这个标志只持续几毫秒）。

### 4.6 节奏

- 基础速度每秒 80 个字符（直接出现的 block 算 1 个字符）。
- 单次编辑最多播放 3 秒：速率 = `max(80, 本次总字符数 / 3)`。
- 多次编辑排队依次播放；新编辑入队时，如果"队列剩余时长 + 本次时长"超过 6 秒，之前没播完的部分直接全部显示，只播放最新这次。
- 三个数字作为插件可选属性（`charsPerSecond`、`maxSeconds`、`backlogSeconds`），默认即上述值。

### 4.7 用户操作与滚动

- 用户在编辑器里按键、粘贴或点击（`keydown` / `paste` / `pointerdown` 挂在 root element 上），立即结束全部播放，显示全文。
- 滚动跟随：光标快超出滚动容器底部时自动滚动；用户用滚轮 / 触摸滚动后，本次播放不再跟随，下次 agent 写入时恢复。
- 滚动容器：插件属性 `scrollContainer`（元素或 ref）；不传时向上查找最近的可滚动祖先。

### 4.8 包与接入

- 新包 `packages/rich-plugin-agent-stream`，结构照 `rich-plugin-link-edit`：`src/index.ts` 导出 `AgentStreamPlugin`、`playAgentWrite`、`AGENT_WRITE_TAG`；Vanilla Extract 写样式（`::highlight()` 用 `globalStyle`），颜色取 `rich-style-token` 变量；`exports` 带 `./style.css`。
- 不依赖 `@haklex/rich-editor-ui`、`lucide-react`。
- 按 AGENTS.md：如果要经由 `rich-compose` 提供样式，在 `packages/rich-compose/scripts/build-css.ts` 的 `MODULE_TO_PACKAGE` 登记。新包第一次发布要手动 publish + `scripts/release/trust-setup.sh`。

### 4.9 下游迁移（haklex 发版后，分别在两个仓库做）

- **ryugi**：
  - `DocumentEditor.tsx` 挂 `<AgentStreamPlugin agentName={agent} />`，引入样式。
  - 删掉 `AgentCaret.tsx` 和 `LoroSync` 里的 `onAgentCaret` / cursor 事件链路；顶栏的 section 标签和"正在编辑"状态改接 `onPlaybackChange`（`TopBar` / `agentActivity`）。
  - `document-session.ts` 不再调用 `streamAtVersion`，每次 agent 编辑用 `rich-collab-loro` 现有的 `editAtVersion` 一次写入，删掉 `stepDelayMs` 和逐帧推送；commit message 保持 `agent: ...`。
- **mx-core**：
  - write 编辑器（`apps/admin/src/vendor/rich-editor` 的挂载处）挂插件，引入样式。
  - agent turn 的每次写入必须用不同的 commit message（例如 `agent:<摘要> #<序号>`）或每次换一个 peer：`crdt-draft-session.ts` 一个 turn 复用同一个 peer，Loro 会把同 peer、同 message 的连续 change 合并，合并后的 change 保留第一次的 timestamp，约 15 秒后就不再被识别为实时写入（实现时用 loro 1.16.4 验证过）。ryugi 的 `editAtVersion` 每次 fork 一个随机 peer，不受影响。
  - presence 里 agent 的 block 级光标（`caretAtBlock` + `presence.setExtra(key, { focus })`）不再渲染光标，避免两个 agent 光标同时出现；presence 条目本身可留作"agent 在线"提示。
- **haklex**：`streamAtVersion` / `planFrames` 本版标记 `@deprecated`，下一个 minor 删除。

## 5. 测试

- vitest：
  - `plan`：新增段落、改写中间、改写带公共前后缀、新增 decorator、key 变化、空文本。
  - 播放队列（假时钟）：基础速率、3 秒上限加速、排队顺序、超过 6 秒直接显示积压、打断后全部显示。
  - binding：带 `agent:` commit 的 import 产生 `agent-write` tag；人类 commit、binding 创建时的首次加载、timestamp 超过 15 秒的 change 不带。
- 播放：只改 node 属性的非 agent 更新不打断；改了未显示文字的会打断该 block。
- 视觉：在 `demo/` 正式加一个 demo 页（替换 spike），用浏览器检查明暗两套主题。

## 6. 留给实现者决定

- `ImportStatus` / `getChangeAt` 的具体用法，或其他读取新导入 change 的 commit message 的方式。
- 插件内部的结构（类 / 闭包 / hook）和文件拆分（每个文件 ≤ 500 行）。
- 自动查找滚动容器的实现。
- 一页多个编辑器时 `CSS.highlights` 名字如何区分（例如带编辑器 key 后缀）；光标挂在编辑器的主题作用域内，而不是 spike 里的 `document.body`，以拿到正确的 CSS 变量；浏览器不支持 Highlight API 时直接不播放。
- spike 代码（`demo/src/poc-agent-stream/`、`demo/agent-stream-poc.html`）是一次性代码：可以参考，正式实现完成后删除或改成正式 demo 页。
