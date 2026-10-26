# Editor Recycler POC

入口：`demo/editor-recycler-poc.html`。当前生产构建页面：<http://127.0.0.1:5197/editor-recycler-poc.html>。

```sh
pnpm --filter @haklex/rich-editor-demo dev --host 127.0.0.1 --port 5198 --strictPort
```

开发页面：<http://127.0.0.1:5198/editor-recycler-poc.html>。旧阅读态 POC 保留作对照；本轮没有给 RichRenderer 增加虚拟化 API。

## 实际接入与保留管理器

实际 Editor 页：<http://127.0.0.1:5198/editor>，Inspector → Performance → Virtual scrolling，默认关闭。开启时关闭独立只读预览，避免预览仍全文渲染而干扰编辑器性能判断。

核心通过通用的 Surface 注册、视图插件注入和活跃 editor 接口完成装配，不再选择 recycler 分支。`@haklex/rich-editor/virtualization` 提供完整插件入口；props 只是同一个插件的便利装配。发布构建的静态依赖图已确认不包含 recycler、LRU、高度索引与文档桥接实现，这些代码位于按需加载的 chunk。

Keep mounted 是首选：PreserveNodeManager 持有稳定的 Portal 宿主，将离屏宿主停放到 DocumentFragment。节点的 DOM、Lexical editor 和 React 装饰器仍然挂载，文档中没有对应占位节点。默认最多保留 32 个离屏节点；超限按 LRU 淘汰，保存最新视图状态并进入类型回收池。`preserveCapacity: 0` 强制走状态恢复路径。预算不包含可见、正在输入/IME 或显式 retain 的节点。离屏视图的 DOM 插件暂停，节点自身的后台副作用仍由组件处理。

实验页新增 0 / 4 / 32 的预算控制和 `preserved`、`preserveHits`、`evictions` 统计。已在真实浏览器确认预算内返回复用同一个计数器 Shadow DOM；强制淘汰后仍恢复计数和内外层 details。也验证了离屏期间计数由 2 变成 3，再经 LRU 淘汰，返回恢复 3，证明保存的是淘汰前最新状态。

## 接入与数据边界

- 不传配置、不注入插件时，保留单个完整编辑器。
- `RichEditor` / `RichEditorShell` 接受 `virtualization={true | options | false}`；`VirtualizationPlugin` 注册独立视图实现。显式 props 优先。
- `scrollContainer` 接受 HTMLElement、DOM ref 或返回 HTMLElement 的函数；容器必须包含编辑器。只传 ScrollView 实际滚动 viewport，不能传其 content 元素。未指定时寻找最近滚动祖先，最后使用 window。
- 主 editor 保留全文 Lexical 模型，负责全文 `onChange`、外部修改与历史；开启 recycler 时它不绑定 DOM，`onEditorReady` 得到的主 editor 的 `getRootElement()` 因而返回 null。
- 有限 slot 按节点类型复用真实 Lexical 编辑实例和兼容原生节点，使用 transform 定位。段落及动态组件等有换绑适配；未知节点的内容体重新挂载。不存在每个逻辑块一个占位 DOM。
- 编辑只替换全文模型中的所属块。Enter 拆出的连续块暂时留在同一实例，维持输入选区；边界 Backspace/Delete 可纳入相邻块再交给 Lexical 合并。焦点、composition 和显式保留的交互界面固定实例。
- 保留池命中时直接使用原 DOM 和组件状态。LRU 回退后，原生 details 按逻辑块恢复展开状态；恢复期间禁用内容及箭头过渡。
- DynamicHostRenderer 使用可选 `getState/setState` 协议支撑 LRU 回退，按逻辑块和节点路径隔离。虚拟化模式下缺少这对方法会报错；普通编辑器不要求它们。动态设置弹层打开时保留实例。定制组件可通过 `useEditorBlock()` 获取逻辑状态容器、当前编辑器和 `retain()`。

## 已验证

2026-10-27，本机桌面 Chrome。

- 原生键盘输入写回全文，`onChange` 仍含 2000 块；滚远再回来内容保留。焦点块离屏期间保留，失焦后可回收。
- Enter 拆块后继续输入；边界 Backspace 把相邻段落合并，块数从 360 降到 359，文字顺序与块 ID 保持正确。
- 连续输入可以一次撤销；全文撤销/重做通过主 editor 路由。
- 折叠面板展开状态恢复，未操作的另一个面板保持默认关闭；计数器 A 的值恢复，B 保持 0。段落原生 DOM、动态 host 和外层 slot 的对象身份复用检查通过。
- props、插件两种入口均能开启；默认关闭时恢复单个编辑根和完整块 DOM。
- 指定外层 ScrollView 和自动寻找滚动祖先均通过。编辑器前方有 115px 内容偏移时，跳转落点与 viewport 顶部误差小于 1px。
- 早期纯回收模式的 20000 块测试曾观察到最多 13 个 slot；启用保留管理器后，驻留实例数量包含有限离屏缓存，不应直接与该数值比较。应同时观察活跃 DOM、保留预算及淘汰次数。
- 页面「检查布局」断言每个活跃逻辑块的实际顶部与高度索引中的落点一致。测量通过 Lexical 节点映射取 DOM，避开装饰器前后的零尺寸选区边界元素。

## 普通编辑态与虚拟编辑态的布局对照

修复了共享内容容器 padding 遗漏、每个窗口误触首尾 margin 清零，以及跨窗口无法原生折叠相邻 margin 的问题。窗口仍按类型回收，间距由测得的块边界与折叠 margin 计入高度索引；没有为全文创建占位 DOM。文档位置标记还保留标题/分隔线后的间距规则，以及 note 首段放大、后续段落缩进。

桌面 Chrome 在 1440px、1100px 两种窗口宽度下，对 Article / Note / Comment 的主页 44 个块逐一比较坐标、尺寸、margin、padding、首字字号、缩进及总高度，六组均无差异。另验证首尾为带 margin 的装饰器、连续标题、分隔线和 details 的 8 块文档，坐标和总高度也一致。图片及远程卡片按同一加载完成状态比较；骨架与实际内容本身存在高度差，不能混为布局回归。

对照数据：`/tmp/haklex-virtualization-poc/layout-{article,note,comment}-{1440,1100}.json`；截图：同目录 `layout-after-normal.png`、`layout-after-virtual.png`。新增 margin 折叠行为测试：`packages/rich-editor/tests/virtualized-spacing.test.ts`。

原始单轮记录：`/tmp/haklex-virtualization-poc/editor-scroll-20000.json`。自动化接口为 `window.editorRecyclerPoc`：`stats()`、`snapshot()`、`saved()`、`focus(index)`、`goTo(index)`、`checkLayout()`。

## 当前限制

这版采用编辑窗口投影。实际页面的工具栏、浮动插件和媒体插件已通过通用接口接入，输入、格式和全文撤销已验证。跨实例的原生拖选/全选、跨块复制剪切、协作、搜索及任意第三方插件仍未完整桥接。DOM 插件使用 `EditorSurfacePlugins` 或模块的 `surfacePlugins`，不能挂到无 DOM 的主 editor 上。

当前焦点/连续编辑范围不会在内部继续虚拟化；一个超大表格或连续拆出的许多块仍可能产生较多 DOM。初次解析、结构更新和全文序列化仍与文档长度相关。切换配置导致重建时会重置临时 UI 状态。真实输入法、触摸惯性滚动、任意第三方组件及嵌套编辑器尚未逐项验证；冷估高校正仍需人工观察。

模型与换绑回归：`pnpm exec vitest run packages/rich-editor/tests/virtualized-document.test.ts`。其余相关包测试、类型检查及构建结果以本轮命令输出为准。
