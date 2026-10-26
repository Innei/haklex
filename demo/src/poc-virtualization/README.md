# 长文虚拟化 POC

编辑器实验入口：<http://127.0.0.1:5197/editor-recycler-poc.html>，支持 props、插件及指定 ScrollView。接入边界与验证记录见 [EDITOR-RESULTS.md](./EDITOR-RESULTS.md)。下面保留阅读态对照实验。

## 新版：按类型复用的 Recycler

新入口：`demo/recycler-poc.html`，默认 2000 块复杂节点。当前已构建并启动的页面：<http://127.0.0.1:5197/recycler-poc.html>。使用下面的 Vite 命令时，打开 <http://127.0.0.1:5196/recycler-poc.html>。

- 只有一个总高度 canvas，少量绝对定位槽位通过 `transform` 移动。不存在每块一个占位 DOM，也没有先完整渲染全文再回收。
- 段落、面板、表格等按兼容类型分池；动态组件进一步按模块 URL 分池。保持 `slotId` 与 React key，换绑 `blockId`，容量按当前视窗需求增长，空闲槽位总量受限。
- 全文 JSON/无头 Lexical 树和高度索引保留在内存；只对槽位内的块调用正式静态渲染引擎。高度使用前缀索引更新，实测前后以视口实际命中的块补偿位置。
- 展开状态按 `blockId + 面板路径` 保存。动态 mount handle 新增可选的 `getState/setState`；测试 counter/quiz 实现此协议，`setState(undefined)` 重置到新块初始状态。换绑时保存旧块状态、更新输入、恢复新块状态，实例及 Shadow DOM 继续复用。没有此能力的动态组件在本页明确报错。
- 槽位换绑和重新激活时，面板内容及箭头先无动画恢复，完成一次绘制后启用正常过渡。用户手动展开/收起仍有动画；状态自检会检查恢复过程中没有重播过渡。
- 有 360 / 2000 / 20000 块、六类场景、明暗切换、720 / 420px 栏宽、离屏图片更新。底部显示活跃/空闲槽位、累计创建/复用/淘汰、真实 DOM 与 Shadow DOM 数量。

建议先手动快速滚动，再点「验证状态往返」和「运行滚动探针」。状态自检同时检查 A 块恢复与 B 块状态隔离；滚动探针含 120 帧滚动/跳转和 120 帧停留，显示落点漂移及缺失锚点，逐帧数据可导出。自动化入口：`window.recyclerPoc.stats()`、`goTo(index)`、`checkState()`、`scrollProbe()`、`result()`。结果见 [RECYCLER-RESULTS.md](./RECYCLER-RESULTS.md)。

```sh
pnpm exec vitest run --config demo/src/poc-virtualization/vitest.config.mjs
```

边界：这是阅读态 POC。初始化解析和全局改宽仍有 O(N) 内存/计算；单个超大 block 内部没有虚拟化；高度缓存、局部状态只在本页会话有效。冷跳转仍会校正估高，滚动条总长度可能变化。主线程探针不能证明合成线程没有闪白，缺失锚点也不计为零漂移。尚未验证编辑器、IME、选区、撤销和全文原生搜索。任意第三方组件是否适合换绑仍需各自验证。

## 旧版：逐块占位对照

独立入口：`demo/virtualization-poc.html`。使用真实的 `RichRenderer`、静态图片 renderer 和 Lexical JSON，通过已有 `blockAnchor` 接入实验；不修改正式包、路由或编辑器。

```sh
pnpm --filter @haklex/rich-editor-demo dev --host 127.0.0.1 --port 5196 --strictPort
```

打开 <http://127.0.0.1:5196/virtualization-poc.html>，选择场景手动滚动，或运行 24 组矩阵并导出逐帧 JSON。360 / 1000 / 2000 块可选，默认展示复杂节点。

## 对比内容

- 完整渲染：同样的盒模型，保留所有内容。
- CSS 估高：`content-visibility: auto` 与 `contain-intrinsic-block-size: auto 180px`。
- 实测回收：首次完整排版，单个 ResizeObserver 测量包含间距的 flow-root 内容盒，IntersectionObserver 保留前后两屏缓冲。普通块离屏卸载；折叠面板与动态组件保留实例、离屏隐藏内容并保持实测占位。未知尺寸图片及当前持有焦点的块固定保留。
- 过期缓存：故意不处理尺寸失效、不补偿锚点的负对照。

六种输入：不同长度的中英文段落、横图与竖图混排、无尺寸图片延迟切换真实资源、滚动途中将栏宽改为 420px、将离屏横图更新为竖图，以及复杂交互节点混排。图片保存在本地，避免外部网络不稳定；延迟图片模拟 500–1520ms 的资源可用时间，不是限速下载。

图片来源：<https://picsum.photos/seed/haklex-virtual-landscape/1200/700>、<https://picsum.photos/seed/haklex-virtual-portrait/700/1100>。

## 测量方法

每组含 134 个 rAF 样本：42 次向下 900px、18 帧停留、42 次反向、8 次约 75% 文档长度的跳转、24 帧落地观察。修改栏宽或离屏图片发生在停留阶段。结果面板高度固定，以保持各组滚动容器尺寸一致。

- `maxDrift` / `p95Drift`：滚动前文字锚点的实际位移，加主动滚动距离。它可能追踪已经离开视口的文字；不同位置之间有图片变高时，不等于当前可见文字的抖动。
- `maxLandingDrift`：主动滚动后，视口内锚点在随后一帧的额外位移。远距离跳转也跟踪落点，不比较已经卸载的出发点。
- 锚点保存为稳定块 ID 与文字偏移，重建 React 子树后继续追踪同一处文字。未能追踪记为缺失，不能记成零位移；覆盖率不足会中止矩阵。
- `maxRestoreError`：回收内容恢复后的真实高度与缓存高度之差。
- `heightSwing`：采样期间 scrollHeight 的变化范围。动态图片或改栏宽本来就会改变总高度；不能单独用它判断阅读抖动。
- `placeholderSamples`：采样时视口落点还在空占位盒中的次数。零次也不能证明合成线程内没有短暂空白。
- 所有模式显式关闭原生 scroll anchoring，实测模式自己补偿，避免原生与应用重复补偿。

矩阵自检要求普通文字基线漂移不超过 1px，过期缓存负对照必须检出超过 100px 的恢复误差与轨迹位移。浏览器测试同时检查每组 134 个有效样本、无锚点丢失。负对照失败表示探针没有校准，不能据此报告方案稳定。

## POC 的边界

- 完整初始化和全局宽度变化时恢复全文再测量，没有优化首次全文布局；重测可能造成长帧。
- Observer 回调仍扫描内存记录，作为实验保留；生产实现需考虑候选集合、调度和取消。
- 文本锚点的几何读取会影响被测布局。本页用于证伪几何稳定性，不用于证明纯粹的 FPS 或 CPU 收益。
- 只覆盖 Web 静态渲染。没有验证 Lexical 输入、IME、选区、撤销、协作、浮动绕排或嵌套编辑器。
- 整块卸载会影响原生搜索、选择与复制；本实验不是可以直接投产的阅读组件。
- rAF 是主线程采样，不能覆盖触控惯性滚动或合成线程的所有中间帧，需要结合真实滚轮/设备录像。

自动化入口在 `window.virtualizationPoc`：`runMatrix()`、`runCase(mode, scenario, count)`、`results()`、`running()`。完整逐帧数据可从页面导出。

## 复杂节点与状态往返

`complex` 场景使用真实 `DynamicNode` / `DynamicSSRRenderer` / Shadow DOM mount 协议，加载 demo 已有的 `counter.mjs` 与 `quiz.mjs`；同时加入内外层 details、默认展开的面板、面板内图片、表格、多级列表、引用和代码块。

运行该组合时，先完成行为自检，再跑 134 帧几何探针：

1. 展开外层和内层面板，并将另一个默认展开的面板收起。
2. 计数器点击三次，在答题组件选择正确答案，读取实际交互结果。
3. 滚到约 70% 文档位置，确认目标块确实离屏、且实测/负对照模式已将它停用。
4. 返回后逐项检查展开、收起、计数、答题结果，并记录原生 details 和动态组件 DOM 的身份是否保留。

完整渲染、CSS 和实测模式必须保留状态；直接卸载的 `stale` 负对照必须丢失状态，否则自检失败。`stateCheck.before/after` 保存实际读数。交互阶段的高度恢复误差与补偿单独记录在 `stateCheck.interactionMaxRestoreError/interactionMaxCorrection`，不混入随后 134 帧的滚动统计。

**保留状态的代价**：动态协议没有通用状态序列化方法，不能可靠地“卸载再恢复任意组件”。因此本 POC 保留这类子树，离屏只设置内容 `display: none`，实例、Shadow DOM 和副作用继续存在。`retainedBodies` 是保留的离屏内容盒数量，不是已经释放的组件数量。切换场景会重置会话；尚未保证替换整份文档 JSON 后的局部视图状态。

这也不保证缓存高度一直有效：隐藏期间的异步布局变化和 details 过渡动画可能在恢复时产生高度差，需要单独观察，不能把状态保留成功等同于滚动体验通过。

## 原生滚轮补充验证

浏览器已由 agent-browser 打开此 POC 后，可运行：

```sh
node demo/src/poc-virtualization/native-wheel.mjs <session> <page-url> /tmp/native-wheel.json
```

脚本通过同一浏览器的 CDP 在滚动区域指定坐标发送 24 次原生滚轮输入（每次 1400px，向下后返回），并断言页面确实滚动。当前 agent-browser 的低级 `mouse wheel` 在本环境将事件发到了 `(0, 0)` 页头，因此不能把命令成功当作滚动成功；此脚本绕过了该问题。

可同时用 agent-browser `record start ... --fps 15` 录制。录像和 DOM 采样必须一起看：已经实测到 DOM 占位采样为 0 时，合成线程录像仍出现了空白或占位帧。不能由 `placeholderSamples: 0` 推导没有空白闪现。
