# @shiro/rich-renderer-codeblock

Enhanced CodeBlock renderer for `@shiro/rich-editor`.

## Features

- Shiki highlighting
- Language badge + accent color
- Copy button with feedback
- Optional line numbers
- Long-code collapse

## Usage

```tsx
import { CodeBlockRenderer } from '@shiro/rich-renderer-codeblock'
import '@shiro/rich-renderer-codeblock/style.css'

<RichRenderer
  value={state}
  rendererConfig={{
    CodeBlock: CodeBlockRenderer,
  }}
/>
```
