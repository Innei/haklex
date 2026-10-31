# TL;DR：Agent 写入的流式显示

完整设计：`docs/ryugi/specs/2026-11-01-agent-stream-reveal-design.md`

## 要做什么

新包 `@haklex/rich-plugin-agent-stream`。agent 写入的数据照旧一次写完，插件在本地把新文字逐字显现，并画一个跟着走的光标。效果和 demo `http://localhost:5288/agent-stream-poc.html` 一样。

## 你会看到什么

1. agent 写入时，新文字按每秒约 80 个字逐字出现，最新的几个字是淡入的
2. 带名字标签的光标停在最后一个可见字后面
3. 图片、代码块等轮到时直接出现
4. 你一打字或点击，动画立即结束，直接显示全文
5. 重连或打开旧文档时不播放

## 决定

| 项             | 决定                                     | 谁定的   |
| -------------- | ---------------------------------------- | -------- |
| 放在哪         | haklex editor 插件，下游不做样式         | 你       |
| 方式           | 数据一次写入，只做动画                   | 你       |
| 非文本 block   | 直接出现                                 | 你       |
| reduced-motion | 不处理                                   | 你       |
| mx-core 范围   | 只做 CRDT 会话                           | 你       |
| 光标位置       | 最后一个可见字的右边缘                   | 你提的   |
| 识别 agent     | commit message 前缀 `agent:`             | 同意推荐 |
| 节奏           | 80 字/秒，单次 ≤3 秒，积压 >6 秒直接显示 | 同意推荐 |

## 请检查这几条（我的决定）

1. **重连 / 补拉不播放**：只播放 15 秒内的 agent change，更早的直接显示。两边已记录 timestamp，下游不用改。
2. **只改属性不打断**：ryugi autosave 约 300ms 后会补 blockId，这种更新不打断动画；只有改了未显示文字才打断。
3. **新增 `onPlaybackChange` 回调**：ryugi 顶栏的"正在编辑 §章节"改接它。

## 时间估计

- haklex 插件 + binding 改动 + 测试 + 正式 demo：约 1 天
- ryugi 迁移（删服务端逐帧推送、`AgentCaret`，接回调）：约半天
- mx-core 迁移（挂插件、去掉旧光标）：约 2 小时
