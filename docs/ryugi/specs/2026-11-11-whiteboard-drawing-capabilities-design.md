# 白板绘制能力扩展：阴影、SVG 元素、富文本卡片

状态：已批准（2026-11-11）。讨论记录：Ryugi document `whiteboard-drawing-capabilities`（`.ryugi/artifacts/document/whiteboard-drawing-capabilities/`，链接 https://ryugi.innei.dev/a/B85MRQH75rYKWBGrUZTzv）。建立在 `2026-11-11-whiteboard-editor-design.md`（自研白板编辑器）之上，在同一分支开发。

## 1. 为什么做

希望白板能画出这种效果：干净的无衬线标题、手绘下划线、彩色圆角便利贴（粗标题 + 灰色副标题，带轻阴影）、带圆点的时间线、浅色分区底块、辣椒酱瓶这样的插画贴纸。参考图是用户贴的 Claude Whiteboards 宣传图，存于讨论文档的 `assets/reference.png`；其中的多人光标、头像、Share、Ask Claude 不在范围内。

这类白板主要由 AI 生成，人在编辑器里再调整。AI 现在已经直接写场景 JSON：

- LiteXML 的 `<excalidraw>` 块把整份 JSON 放在 CDATA 里（`rich-litexml/src/writers/custom.ts`、`readers/custom.ts`）。
- mx-core 后台写作 agent 把每块白板挂成 `/embeds/<id>.excalidraw` 文件，用 bash 改 JSON，保存时重新测量文字再提交审阅。

所以这次只补**场景 JSON 能表达什么、渲染能画到什么质量、编辑器能改什么**，不碰 AI 接入。

对照参考图，现有元素加 `roughness: 0` 和无衬线字体 `fontFamily: 2` 已经能画标题、下划线、底块、时间线、倾斜和网格。缺三样，对应三项新能力：

| 能力       | 场景 JSON 里的样子                     | 解决什么                 |
| ---------- | -------------------------------------- | ------------------------ |
| 阴影       | 图形上的 `shadow: true`                | 便利贴、卡片的轻阴影     |
| SVG 元素   | 新类型 `svg`，源码写在 `svg` 字段      | 贴纸、插画、图标         |
| 富文本卡片 | 新类型 `richtext`，内容是 Lexical JSON | 多样式文字、便利贴、卡片 |

## 2. 目标、非目标、反目标

**目标**

- AI 只写场景 JSON，就能画出参考图的效果（协作界面除外）。
- AI 写的每个元素，人都能在编辑器里继续改：移动、缩放、改颜色；卡片里的字能逐字编辑。
- 文章里的只读显示和编辑器里画得一样。
- 白板包里有一份给 AI 看的场景格式参考，照着写就能用上新能力。

**非目标**

- AI 接入：白板里不做 "Ask Claude" 入口，不改 rich-agent-core / rich-ext-ai-agent / mx-core 的 agent。
- excalidraw.com 兼容：新类型和新字段不保证能在 excalidraw.com 打开（用户定的）。
- 时间线、看板这类模板：AI 用基础元素自己拼。
- 多人光标、头像、分享。
- 人改 SVG 内部：不做换色，不做源码编辑。
- 同步 mx-core 的 excalidraw-editing skill：之后单独做。

**反目标**（做了就算失败）

- 人改不动 AI 写的东西。
- 只读显示和编辑器里画得不一样。
- SVG 能执行脚本或加载外部资源。
- 旧白板已有元素的读写结果变了。

## 3. 约束

- 数据仍是 Excalidraw 形状的场景 JSON；旧白板照常读写，现有 `text` 元素行为不变（手绘标注、箭头标签、容器文字继续用它）。
- 人手画新图形默认仍是手绘风；AI 写的元素自己指定干净风格。
- 只读入口（`static.ts`）不能引入编辑代码，`tests/static-entry.test.ts` 守着这条。卡片的只读渲染是白板包自己的轻量渲染器，直接遍历 Lexical JSON 输出 React，不需要 Lexical 运行时；卡片编辑器只在编辑端出现。
- 卡片不依赖宿主：编辑弹窗经 `presentDialog` 挂在应用根部（`WhiteboardEditRenderer.tsx`），拿不到文章编辑器的 Lexical 上下文、`NestedEditorPluginsProvider`、`NestedContentRendererProvider`。所以卡片的编辑器、格式条、渲染器都由白板包自带，宿主不用改。
- 新增 peer dependency `@lexical/rich-text`、`@lexical/list`、`@lexical/link`，版本跟 `lexical` 一致；宿主经由 rich-editor 本来就装了。（我的判断）
- 暗色模式沿用现有规则：整个场景反色，图片反向抵消保持原色。

## 4. 设计

### 4.1 阴影

- 新字段 `shadow?: boolean`，缺省等于 `false`。适用于矩形、菱形、椭圆、图片、`svg`、`richtext`；线、箭头、自由画、文字、frame 忽略它。
- 只有一种固定的柔和阴影：向下偏一点、模糊、低不透明度的黑色。具体数值由实现者对着参考图调。
- 暗色模式下阴影仍然是暗的，不能跟着场景反色变成亮光。
- 样式面板对支持的元素显示一行 "Shadow" 开关；多选时对所有支持的元素生效。
- 阴影不影响命中测试、选择框和导出边界。

### 4.2 SVG 元素

```json
{
  "angle": 0.12,
  "height": 96,
  "id": "sticker-bottle",
  "opacity": 100,
  "shadow": false,
  "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 48 96\">…</svg>",
  "type": "svg",
  "width": 48,
  "x": 840,
  "y": 260
}
```

- 通用字段与其他元素相同（`groupIds`、`frameId`、`locked`、`link`、`boundElements`、版本字段等），读入时缺的补默认值。
- 渲染为 `<image href="data:image/svg+xml;charset=utf-8,…">`，按 `xMidYMid meet` 适配元素框。走图片通道，浏览器不执行脚本、不加载外部资源；代价是 SVG 里的文字用不了页面字体。源码缺 `xmlns` 时读入阶段补上。（用户定的：当图片渲染）
- 暗色模式和图片一样不反色。
- `svg` 为空或解析失败时画虚线占位框，元素保留，数据不丢。
- 人能做的：选中、移动、缩放（默认锁宽高比，同图片）、旋转、透明度、阴影、层级、复制、删除、编组、放进 frame、被箭头吸附。（用户定的：只做整体变换）
- 人新建 SVG 元素：粘贴以 `<svg` 开头的文本时，在粘贴位置生成 `svg` 元素，尺寸取 SVG 的 `width`/`height` 或 `viewBox`，最长边上限 600。拖入 `.svg` 文件仍走图片。（我的判断）

### 4.3 富文本卡片

```json
{
  "angle": 0,
  "backgroundColor": "#f2bcd3",
  "content": {
    "root": {
      "type": "root",
      "children": [
        { "type": "paragraph", "children": [{ "type": "text", "text": "Brew", "format": 1 }] },
        {
          "type": "paragraph",
          "children": [{ "type": "text", "text": "Mila", "style": "color: #6b6b6b" }]
        }
      ]
    }
  },
  "height": 100,
  "id": "card-brew",
  "opacity": 100,
  "roughness": 0,
  "roundness": { "type": 3 },
  "shadow": true,
  "strokeColor": "transparent",
  "strokeStyle": "solid",
  "strokeWidth": 1,
  "type": "richtext",
  "width": 160,
  "x": 120,
  "y": 500
}
```

**外观**（用户定的：卡片外观归元素自己）

- 卡片底由元素自己的 `backgroundColor`、边框（`strokeColor` / `strokeWidth` / `strokeStyle`）、`roundness`、`shadow`、`opacity` 决定；边框也认 `roughness`（0 为干净直线）。一个元素就是一张便利贴。
- 内边距固定 12px；卡片内文字样式用 haklex 的样式变量（字号、行高、颜色），默认文字颜色取浅色主题，不跟随宿主文章的排版样式。（我的判断）

**尺寸**（用户定的：取较大值；读入时测量）

- 宽度就是 `width`，内容在其中换行。
- 读入场景时，用量现有文字元素的同一套方法（`model/measure.ts`）算出卡片内容高度，把 `height` 调成"写定的 `height`"和"内容高度 + 内边距"中较大的。编辑器、只读视图、服务端渲染读到的都是这个高度；箭头吸附、内容居中、命中区域因此一致。
- AI 写的 `height` 相当于最小高度；同一行便利贴写一样的 `height` 就能一样高。
- 渲染时用和测量相同的字号和行高；测量和浏览器实际排版差几像素时，内容可以溢出，不裁剪。
- 读入时的高度调整不进撤销历史，也不把白板标成"未保存"。编辑卡片内容后按同一规则重新计算。高度从不自动变小；人手动缩放时高度不能小于内容高度。（我的判断）

**存储与内容**（用户定的：Lexical JSON、只放文字类）

- `content` 是 Lexical `SerializedEditorState`，和文章正文同一种格式。
- 允许的节点：段落、标题、有序和无序列表、引用、链接，以及文字的粗体、斜体、下划线、删除线、行内代码、高亮、文字颜色。文字颜色的表示和 haklex 正文一致。
- 读到其他节点（图片、代码块等）时，数据原样保留；只读渲染显示其中的文字，进入编辑后这些节点转成纯文字。（我的判断）

**渲染**

- 放在 SVG 的 `foreignObject` 里，和其他图形照常分上下层、跟随缩放和旋转。
- 只读显示（文章里、编辑弹窗里没在编辑的卡片、服务端渲染）都用白板包自带的渲染器：只认上面允许的节点，直接把 Lexical JSON 转成 React；不认识的节点显示其中的文字。（用户定的方向）
- 暗色模式：卡片和其他图形一样随场景整体反色，内容按浅色主题渲染，让卡片底色和文字的对比与其他图形一致。（我的判断）

**编辑**（用户定的：格式条，白板自带）

- 双击卡片，或选中后按 Enter，进入原地编辑。卡片内是白板包自带的独立 Lexical 编辑器，只注册允许的节点，粘贴进来的其他节点转成纯文字。
- 选中文字时，在选区上方出现白板自带的小格式条：粗体、斜体、删除线、行内代码、文字颜色、高亮、标题、列表、链接。样式沿用编辑器现有浮层样式。
- 按 Esc 或点卡片外退出编辑；一次编辑记一条撤销历史。内容没变时不记历史，也不标成"未保存"。
- 编辑中白板的工具快捷键不生效（现有键盘焦点规则已跳过可输入目标）。

**人新建卡片**（我的判断）

- 工具栏加 "Card" 工具，快捷键 N。点一下放一张 200×120 的黄色卡片并直接进入编辑；拖动可画出任意大小。
- 样式面板显示：背景色、边框色、边框粗细、圆角、阴影、透明度、层级、操作。不显示字号和字体（这些在内容里用格式条改）。
- 卡片可被箭头吸附，可编组、放进 frame。

### 4.4 给 AI 的格式参考

- 位置：`packages/rich-ext-whiteboard/docs/scene-format.md`。（我的判断）
- 内容：场景结构、通用字段、每种元素（含新增三项）的字段和示例；"干净风格"写法（`roughness: 0`、`fontFamily: 2`）；卡片高度规则；箭头绑定写法；最后附完整示例，即验收白板。

### 4.5 验收白板

一份复刻参考图的场景 JSON（不含光标、头像），作为测试数据和验收页素材：

- 无衬线标题，加一条橙色自由画下划线；
- 辣椒酱瓶 SVG 贴纸，略微倾斜；
- 浅绿圆角底块，里面一条带 5 个圆点和日期的时间线；
- 5 张带阴影的彩色卡片，内容是粗标题加灰副标题；
- 1 张倾斜的空白浅黄卡片。

要求：往返读写不丢字段；只读渲染和编辑器渲染一致；在编辑器里能改卡片文字、移动贴纸。

## 5. 留给实现者

- 阴影的具体数值，以及暗色下保持暗阴影的做法。
- 卡片内容高度的测量实现：段落、标题、列表缩进、引用的字号和行高怎么对应到测量。
- 卡片编辑器在白板缩放下怎么处理光标、选区和格式条的位置。
- SVG 尺寸解析细节，比如没有 `viewBox` 时怎么定。
- 测试和任务切分。

## 6. 风险

- **Safari 的 `foreignObject`**：Safari 对带缩放变换的 `foreignObject` 有已知排版问题，可能文字错位。实现第一步先在 Safari 上做小样验证；不行就改成把卡片 HTML 叠在 SVG 上方，代价是卡片永远显示在其他图形上面——走到这一步先回来问用户。
- 白板里放几十张卡片，每张是一棵 React 子树，渲染开销上升；验收白板 6 张，先按这个量级验证。
- `foreignObject` 在服务端渲染的 HTML 里能输出，但旧邮件客户端、RSS 阅读器不支持；那些地方本来也不展示白板。

## 7. 视觉方向

AI 生成白板的目标效果是参考图：干净线条、无衬线字体、柔和彩色卡片、轻阴影、少量插画贴纸。界面改动只有一行 Shadow 开关、一个 Card 工具按钮和卡片格式条，沿用现有编辑器样式（36px 工具按钮、样式面板行、现有浮层），没开新的 artboard。（我的判断）
