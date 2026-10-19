import type { ChartSpec } from '@haklex/rich-ext-chart';

export type ChartSampleGroup = 'bar' | 'line' | 'area' | 'pie' | 'state';

export interface ChartSample {
  defaultView?: 'chart' | 'table';
  description: string;
  frame?: 'narrow' | 'dark';
  group: ChartSampleGroup;
  key: string;
  label: string;
  value: unknown;
}

const renderCount: ChartSpec = {
  version: 1,
  type: 'bar',
  title: '编辑器首屏渲染次数',
  subtitle: '加载一篇 3,200 字的文章，React Profiler 统计的 commit 次数',
  x: 'component',
  xLabel: '组件',
  series: [
    { key: 'before', label: '重构前' },
    { key: 'after', label: '重构后' },
  ],
  data: [
    { component: 'RichEditor', before: 48, after: 12 },
    { component: 'Toolbar', before: 36, after: 9 },
    { component: 'BlockHandle', before: 64, after: 14 },
    { component: 'SlashMenu', before: 22, after: 8 },
    { component: 'FloatingToolbar', before: 30, after: 11 },
    { component: 'TablePlugin', before: 18, after: 6 },
  ],
  source: 'demo/ · Chrome 141 · M3 Pro · 5 次取中位数',
};

const renderCountHighlight: ChartSpec = { ...renderCount, highlight: 'after' };

const bundleDelta: ChartSpec = {
  version: 1,
  type: 'bar',
  title: '各包 gzip 体积变化',
  subtitle: 'v0.46.5 → v0.47.0，负数表示变小',
  x: 'pkg',
  series: [{ key: 'delta', label: '体积变化' }],
  format: { unit: 'KB', signed: true },
  data: [
    { pkg: 'rich-compose', delta: -42.1 },
    { pkg: 'rich-editor', delta: -18.4 },
    { pkg: 'renderer-codeblock', delta: -12.6 },
    { pkg: 'ext-excalidraw', delta: -3 },
    { pkg: 'rich-editor-ui', delta: 1.4 },
    { pkg: 'renderer-mermaid', delta: 6.2 },
  ],
  note: 'mermaid 改用 Pele 渲染后多了 6.2 KB',
};

const evalScores: ChartSpec = {
  version: 1,
  type: 'bar',
  title: '评测得分',
  subtitle: '同一套 200 题，三个维度',
  x: 'model',
  series: [
    { key: 'coding', label: '编码' },
    { key: 'reasoning', label: '推理' },
    { key: 'tools', label: '工具调用' },
  ],
  format: { unit: '%' },
  data: [
    { model: 'Opus 5.5', coding: 91, reasoning: 88, tools: 93 },
    { model: 'Sonnet 5.5', coding: 86, reasoning: 81, tools: 89 },
    { model: 'Haiku 5.5', coding: 72, reasoning: 66, tools: 78 },
  ],
};

const bundleStack: ChartSpec = {
  version: 1,
  type: 'bar',
  stacked: true,
  title: 'rich-compose 产物体积',
  subtitle: 'gzip 后，按模块拆分',
  x: 'version',
  series: [
    { key: 'core', label: 'core' },
    { key: 'ui', label: 'editor-ui' },
    { key: 'renderers', label: 'renderers' },
  ],
  format: { unit: 'KB' },
  data: [
    { version: 'v0.43', core: 138, ui: 64, renderers: 212 },
    { version: 'v0.44', core: 141, ui: 66, renderers: 218 },
    { version: 'v0.45', core: 129, ui: 61, renderers: 196 },
    { version: 'v0.46', core: 118, ui: 58, renderers: 171 },
    { version: 'v0.47', core: 104, ui: 52, renderers: 156 },
  ],
};

const days = [
  '10-06',
  '10-07',
  '10-08',
  '10-09',
  '10-10',
  '10-11',
  '10-12',
  '10-13',
  '10-14',
  '10-15',
  '10-16',
  '10-17',
  '10-18',
  '10-19',
];
const opus = [2.1, 2.6, 2.4, 3.2, 3.9, 1.2, 0.9, 3.6, 4.4, 4.9, 4.6, 5.3, 1.8, 4.8];
const sonnet = [3.4, 3.1, 3.8, 3.5, 3.2, 1.6, 1.3, 3, 2.8, 2.6, 2.9, 2.4, 1.1, 2.2];
const haiku = [0.6, 0.7, 0.9, 0.8, 1.1, 0.4, 0.3, 1.2, 1.4, 1.3, 1.6, 1.5, 0.6, 1.7];

const tokens: ChartSpec = {
  version: 1,
  type: 'line',
  title: '每日 token 用量',
  subtitle: '近 14 天，按模型',
  x: 'day',
  series: [
    { key: 'opus', label: 'Opus 5.5' },
    { key: 'sonnet', label: 'Sonnet 5.5' },
    { key: 'haiku', label: 'Haiku 5.5' },
  ],
  data: days.map((day, i) => ({
    day,
    opus: opus[i] * 1e6,
    sonnet: sonnet[i] * 1e6,
    haiku: haiku[i] * 1e6,
  })),
};

const quota: ChartSpec = {
  version: 1,
  type: 'line',
  title: '本周额度已用',
  subtitle: '累计 token，周一 00:00 重置',
  x: 'day',
  series: [{ key: 'used', label: '已用' }],
  refs: [{ y: 30e6, label: '周配额' }],
  data: [
    { day: '周一', used: 4.1e6 },
    { day: '周二', used: 9.6e6 },
    { day: '周三', used: 14.2e6 },
    { day: '周四', used: 19.8e6 },
    { day: '周五', used: 26.3e6 },
    { day: '周六', used: 27.9e6 },
    { day: '周日', used: 29.1e6 },
  ],
  note: '周五起接近上限，周末只剩 0.9M',
};

const latency: ChartSpec = {
  version: 1,
  type: 'line',
  title: 'p95 延迟',
  subtitle: '部署前后各 12 小时',
  x: 'hour',
  series: [
    { key: 'p95', label: 'p95' },
    { key: 'p50', label: 'p50' },
  ],
  highlight: 'p95',
  format: { unit: 'ms' },
  data: ['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22'].map((hour, i) => ({
    hour: `${hour}:00`,
    p95: [412, 398, 405, 420, 446, 431, 214, 198, 205, 192, 201, 188][i],
    p50: [138, 131, 135, 140, 152, 147, 92, 88, 90, 86, 89, 84][i],
  })),
  note: '12:00 部署 render 缓存',
};

const cost: ChartSpec = {
  version: 1,
  type: 'area',
  stacked: true,
  title: '每周模型调用成本',
  subtitle: '按模型堆叠',
  x: 'week',
  series: [
    { key: 'opus', label: 'Opus 5.5' },
    { key: 'sonnet', label: 'Sonnet 5.5' },
    { key: 'haiku', label: 'Haiku 5.5' },
  ],
  format: { unit: '$' },
  data: [
    [182, 96, 14],
    [204, 102, 18],
    [196, 118, 21],
    [241, 109, 19],
    [268, 98, 26],
    [252, 121, 31],
    [297, 115, 28],
    [318, 104, 34],
    [286, 92, 37],
    [341, 88, 41],
  ].map(([o, s, h], i) => ({ week: `W${33 + i}`, opus: o, sonnet: s, haiku: h })),
};

const deps: ChartSpec = {
  version: 1,
  type: 'area',
  title: '依赖数量',
  subtitle: '直接 + 间接依赖，清理前后',
  x: 'commit',
  series: [{ key: 'count', label: '依赖数' }],
  data: [
    { commit: 'a1f3', count: 1284 },
    { commit: 'b72c', count: 1301 },
    { commit: 'c09e', count: 1296 },
    { commit: 'd4a1', count: 1112 },
    { commit: 'e8b0', count: 941 },
    { commit: 'f21d', count: 876 },
    { commit: '0c3a', count: 868 },
  ],
};

const failures: ChartSpec = {
  version: 1,
  type: 'pie',
  title: '评测失败原因',
  subtitle: '200 道题中失败的 64 道',
  x: 'reason',
  series: [{ key: 'count', label: '题数' }],
  data: [
    { reason: '输出格式错误', count: 24 },
    { reason: '超时', count: 14 },
    { reason: '工具调用参数错', count: 11 },
    { reason: '事实错误', count: 9 },
    { reason: '其他', count: 6 },
  ],
};

const modules: ChartSpec = {
  version: 1,
  type: 'pie',
  donut: true,
  title: 'node_modules 体积构成',
  subtitle: '依赖清理之后',
  x: 'group',
  series: [{ key: 'mb', label: '体积' }],
  format: { unit: 'MB' },
  data: [
    { group: '@excalidraw', mb: 48 },
    { group: 'lexical', mb: 22 },
    { group: 'shiki', mb: 31 },
    { group: 'katex', mb: 12 },
    { group: '其他', mb: 27 },
  ],
};

const broken = {
  version: 1,
  type: 'column',
  title: '编辑器首屏渲染次数',
  x: 'component',
  series: [
    { key: 'before', label: '重构前' },
    { key: 'p95', label: 'p95' },
  ],
  data: [
    { component: 'RichEditor', before: 48, after: 12 },
    { component: 'Toolbar', before: 36, after: 9 },
    { component: 'BlockHandle', before: 64, after: 14 },
    { component: 'SlashMenu', before: '22 ms', after: 8 },
  ],
};

export const chartSamples: ChartSample[] = [
  {
    key: 'bar-grouped',
    group: 'bar',
    label: 'Grouped bar',
    description: 'Before/after comparison, two series.',
    value: renderCount,
  },
  {
    key: 'bar-highlight',
    group: 'bar',
    label: 'Grouped bar · highlight',
    description: '`highlight: "after"` — other series turn gray.',
    value: renderCountHighlight,
  },
  {
    key: 'bar-negative',
    group: 'bar',
    label: 'Single series · negative values',
    description: 'Signed format, bars grow down from zero.',
    value: bundleDelta,
  },
  {
    key: 'bar-three',
    group: 'bar',
    label: 'Grouped bar · three series',
    description: 'Percent unit, three series per group.',
    value: evalScores,
  },
  {
    key: 'bar-stacked',
    group: 'bar',
    label: 'Stacked bar',
    description: 'Totals on top, 2px gaps between segments.',
    value: bundleStack,
  },
  {
    key: 'line-multi',
    group: 'line',
    label: 'Multi-series line',
    description: 'Hover for crosshair + tooltip; end labels instead of a legend.',
    value: tokens,
  },
  {
    key: 'line-ref',
    group: 'line',
    label: 'Line · reference line',
    description: '`refs` draws a dashed quota line.',
    value: quota,
  },
  {
    key: 'line-highlight',
    group: 'line',
    label: 'Line · highlight',
    description: 'Unit "ms"; p50 muted.',
    value: latency,
  },
  {
    key: 'area-stacked',
    group: 'area',
    label: 'Stacked area',
    description: 'Tooltip lists every layer plus the total.',
    value: cost,
  },
  {
    key: 'area-single',
    group: 'area',
    label: 'Area',
    description: 'Single series, compact numbers (1.3k).',
    value: deps,
  },
  {
    key: 'pie',
    group: 'pie',
    label: 'Pie',
    description: 'Hover a slice or a legend row.',
    value: failures,
  },
  {
    key: 'donut',
    group: 'pie',
    label: 'Donut',
    description: 'Center shows the total, or the hovered slice.',
    value: modules,
  },
  {
    key: 'state-empty',
    group: 'state',
    label: 'Empty data',
    description: '`data: []`',
    value: { ...renderCount, data: [] },
  },
  {
    key: 'state-error',
    group: 'state',
    label: 'Invalid data',
    description: 'Every problem listed with its path and a fix.',
    value: broken,
  },
  {
    key: 'state-json-error',
    group: 'state',
    label: 'Invalid JSON',
    description: 'Raw CDATA body that does not parse.',
    value: '{ "type": "bar", "x": "a", }',
  },
  {
    key: 'state-table',
    group: 'state',
    label: 'Table view',
    description: 'Same data as a real <table>; select and copy works.',
    value: renderCount,
    defaultView: 'table',
  },
  {
    key: 'state-narrow',
    group: 'state',
    label: 'Narrow · 360px',
    description: 'Container query swaps to the compact SVG.',
    value: renderCountHighlight,
    frame: 'narrow',
  },
  {
    key: 'state-narrow-line',
    group: 'state',
    label: 'Narrow · line',
    description: 'Compact line: legend on top, labels thinned out.',
    value: tokens,
    frame: 'narrow',
  },
  {
    key: 'state-dark',
    group: 'state',
    label: 'Forced dark',
    description: 'Inside `data-theme="dark"` regardless of the page theme.',
    value: tokens,
    frame: 'dark',
  },
];
