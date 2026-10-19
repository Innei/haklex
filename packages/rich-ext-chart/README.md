# @haklex/rich-ext-chart

Bar, line, area and pie charts for Haklex, rendered as static SVG from a library-independent `ChartSpec`.

```tsx
import { ChartRenderer } from '@haklex/rich-ext-chart/static';
import '@haklex/rich-ext-chart/style.css';

<ChartRenderer
  value={{
    version: 1,
    type: 'bar',
    title: 'Render count',
    x: 'component',
    series: [
      { key: 'before', label: 'Before' },
      { key: 'after', label: 'After' },
    ],
    highlight: 'after',
    data: [
      { component: 'Toolbar', before: 36, after: 9 },
      { component: 'BlockHandle', before: 64, after: 14 },
    ],
  }}
/>;
```

`value` may be a `ChartSpec` object or its JSON string. Invalid input renders an error card listing every problem with its path.

- Types: `bar` (grouped / `stacked`, negative values), `line`, `area` (`stacked`), `pie` (`donut`)
- `highlight` keeps one series (or pie slice) in color and grays out the rest
- `format`: `unit`, `compact` (default `true`: 1.2k / 3.4M), `decimals`, `signed`
- `refs`: horizontal reference lines such as quotas
- Wide and compact SVGs are both rendered; a container query picks one, so SSR and client output match
- Colors come from `--rc-chart-1…6` and follow `data-theme="dark"`
