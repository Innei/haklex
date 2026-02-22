# @haklex/rich-style-token

设计令牌和 CSS 变量，基于 Vanilla Extract 实现零运行时样式。

## 安装

```bash
pnpm add @haklex/rich-style-token
```

## 使用

```tsx
import { vars } from '@haklex/rich-style-token'
import { style } from '@vanilla-extract/css'

export const container = style({
  color: vars.color.text,
  padding: vars.spacing.md,
  borderRadius: vars.borderRadius.md,
})
```

## 运行时颜色覆写

主题契约生成标准 CSS 自定义属性（`--rc-*`），使用方可在运行时覆写。

### 方式一：`createThemeStyle`（类型安全）

```tsx
import { createThemeStyle } from '@haklex/rich-style-token'

const style = createThemeStyle({
  color: {
    accent: '#0ea5e9',
    text: '#0c4a6e',
    bg: '#f0f9ff',
  },
})

// CSS 变量向下级联，所有子组件自动生效
<div style={style}>
  <RichEditor />
</div>
```

`ThemeTokens` 类型自动从 `vars` 契约推导，支持 `color`、`spacing`、`typography`、`borderRadius` 四组的任意子集覆写。

### 方式二：纯 CSS

```css
.my-theme {
  --rc-accent: #0ea5e9;
  --rc-text: #0c4a6e;
  --rc-bg: #f0f9ff;
}
```

### 可覆写的 CSS 变量

| 分组 | 变量 |
|------|------|
| **Color** | `--rc-text`, `--rc-text-secondary`, `--rc-bg`, `--rc-bg-secondary`, `--rc-border`, `--rc-accent`, `--rc-accent-light`, `--rc-link`, `--rc-code-text`, `--rc-code-bg`, `--rc-quote-border`, `--rc-quote-bg`, `--rc-alert-info`, `--rc-alert-warning`, `--rc-alert-tip`, `--rc-alert-caution`, `--rc-alert-important` |
| **Spacing** | `--rc-space-xs`, `--rc-space-sm`, `--rc-space-md`, `--rc-space-lg`, `--rc-space-xl` |
| **Typography** | `--rc-font-family`, `--rc-font-mono`, `--rc-font-size-base`, `--rc-font-size-small`, `--rc-font-size-large`, `--rc-line-height`, `--rc-line-height-tight` |
| **Border Radius** | `--rc-radius-sm`, `--rc-radius-md`, `--rc-radius-lg` |

## 导出

```ts
// CSS 变量契约
export { vars } from './vars.css'

// 运行时覆写工具
export { createThemeStyle } from './create-theme-style'
export type { ThemeTokens } from './create-theme-style'

// 主题配置
export { articleLayout, commentLayout, noteLayout } from './themes'
export { serifFonts, sharedFonts } from './themes'
export { darkColors, lightArticleColors, lightCommentColors } from './themes'

// Portal 主题
export { PortalThemeProvider, PortalThemeWrapper, usePortalTheme } from './portal-theme'
```

## 变量结构

### vars.color

```ts
vars.color.text          // 主文本色
vars.color.textSecondary // 次要文本
vars.color.bg            // 背景色
vars.color.bgSecondary   // 次要背景
vars.color.border        // 边框色
vars.color.accent        // 强调色
vars.color.accentLight   // 浅强调色
vars.color.link          // 链接色
vars.color.codeText      // 代码文本
vars.color.codeBg        // 代码背景
vars.color.quoteBorder   // 引用边框
vars.color.quoteBg       // 引用背景
vars.color.alertInfo     // 提示色
vars.color.alertWarning  // 警告色
vars.color.alertTip      // 建议色
vars.color.alertCaution  // 注意色
vars.color.alertImportant // 重要色
```

### vars.spacing

```ts
vars.spacing.xs  // article: 4px, comment: 2px
vars.spacing.sm  // article: 8px, comment: 4px
vars.spacing.md  // article: 16px, comment: 10px
vars.spacing.lg  // article: 24px, comment: 16px
vars.spacing.xl  // article: 32px, comment: 20px
```

### vars.typography

```ts
vars.typography.fontFamily     // 字体族
vars.typography.fontMono       // 等宽字体
vars.typography.fontSizeBase   // 基础字号
vars.typography.fontSizeSmall  // 小字号
vars.typography.fontSizeLarge  // 大字号
vars.typography.lineHeight     // 行高
vars.typography.lineHeightTight // 紧行高
```

### vars.borderRadius

```ts
vars.borderRadius.sm  // article: 4px, comment: 3px
vars.borderRadius.md  // article: 8px, comment: 6px
vars.borderRadius.lg  // article: 12px, comment: 8px
```

## 预设主题

```ts
import {
  lightArticleColors,
  darkColors,
  articleLayout
} from '@haklex/rich-style-token'

// 浅色文章主题
lightArticleColors.text      // '#1a1a1a'
lightArticleColors.accent    // '#33A6B8'

// 深色主题
darkColors.text              // '#e5e5e5'
darkColors.accent            // '#F596AA'

// 布局配置
articleLayout.typography.fontSizeBase  // '16px'
articleLayout.typography.lineHeight    // '1.7'
```

## 依赖

```json
{
  "@vanilla-extract/css": "^1.17.1",
  "react": ">=19"
}
```

## License

MIT
