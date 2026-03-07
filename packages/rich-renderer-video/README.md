# @haklex/rich-renderer-video

视频播放器渲染器。

## 安装

```bash
pnpm add @haklex/rich-renderer-video @haklex/rich-editor
```

## 导出

```ts
export { VideoRenderer } from './VideoRenderer'
export { VideoEditRenderer } from './VideoEditRenderer'
```

## 功能

- 自定义控制栏
- 进度条
- 音量控制
- 全屏

## 使用

```tsx
import { VideoRenderer } from '@haklex/rich-renderer-video'
import type { RendererConfig } from '@haklex/rich-editor'

const config: RendererConfig = {
  Video: VideoRenderer,
}
```

## License

MIT
