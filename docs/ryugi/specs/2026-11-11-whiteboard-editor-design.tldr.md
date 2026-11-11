# TL;DR：自研白板编辑器

完整设计：`2026-11-11-whiteboard-editor-design.md`

## 要做什么

`@haklex/rich-ext-excalidraw` 改名为 `@haklex/rich-ext-whiteboard`，编辑弹窗里的 Excalidraw 换成自研的 SVG 编辑器，数据仍是 Excalidraw JSON。haklex、demo、mx-core admin、Yohaku 都删掉 `@excalidraw/excalidraw`。

## 你会看到的

1. 文章里点白板的「Edit」，弹出全屏弹窗；工具在标题栏中间，画布是点阵纸
2. 画矩形、箭头、文字等；箭头会吸附图形，折线箭头自动绕开图形
3. 选中元素：细实线框加圆形控制点，右上角浮出只含相关属性的样式面板
4. 手机上工具在底部，样式面板从工具条上方弹出
5. 保存回文章；手写字体变成霞鹜文楷，笔迹带粗细变化

## 决定

| 项       | 结果                                              |
| -------- | ------------------------------------------------- |
| 范围     | 完整档：含吸附、容器文字、编组、图片、frame、折线 |
| 渲染     | SVG，复用展示端 Scene                             |
| 包名     | rich-ext-whiteboard，同版本切换，旧包 deprecated  |
| 节点类型 | 保留 `excalidraw`                                 |
| 字体     | 手写体统一文楷，默认从 jsDelivr 加载，可覆盖      |
| 图片     | `uploadFile` 上传，失败退回 base64                |
| 折线箭头 | 自动寻路                                          |
| 笔迹     | perfect-freehand                                  |
| 上线     | 分支开发，做完一次切换                            |
| 界面     | 选的都是推荐：q1-c、q2-b、q3-b、q4-b、q5-b        |

## 请检查这些（我的决定）

- frame 裁剪和图片 crop 也加进展示端，旧白板会更接近 Excalidraw 里的样子
- 保存时保留原 `appState` 和未知字段，`isDeleted` 元素保存时剔除
- `restoreElements` 改成 async，admin 加一个 await
- 编辑器 chunk 80 KB gzip 是目标，不是硬门槛
- rich-compose 模块和 RendererConfig 槽位也改名为 whiteboard

## 时间

约 10–12 个工作日：改名 1 天，model 层 2 天，编辑器核心 3 天，吸附加折线寻路 3–4 天，切换和下游 1–2 天。
