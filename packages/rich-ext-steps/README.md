# @haklex/rich-ext-steps

A numbered list of steps. Each step has a plain-text title and its own rich content.

## Installation

```bash
pnpm add @haklex/rich-ext-steps
```

## Usage

### Register nodes

Edit (read + write):

```ts
import { stepsEditNodes } from '@haklex/rich-ext-steps/edit';

const editorConfig = { nodes: [...stepsEditNodes] };
```

Static / read-only:

```ts
import { stepsNodes } from '@haklex/rich-ext-steps/static';
```

### Override the renderer

The node renders through the `Steps` RendererConfig slot and falls back to the built-in `StepsRenderer`.

```tsx
import type { StepsRendererProps } from '@haklex/rich-ext-steps/node';

function MySteps({ steps }: StepsRendererProps) {
  // steps: Array<{ id, title, content }>
}

<RichRenderer rendererConfig={{ Steps: MySteps }} />;
```

To restyle without replacing the component, target the class names `rich-steps`, `rich-steps-item`, `rich-steps-marker`, `rich-steps-title` and `rich-steps-content`.

## Data

```ts
{
  type: 'steps',
  version: 1,
  steps: [{ id: 's_x1y2z3w4', title: 'Install', content: SerializedEditorState }],
}
```
