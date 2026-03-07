import type { SerializedEditorState } from 'lexical'

import {
  alertQuote,
  banner,
  details,
  doc,
  footnote,
  FORMAT_BOLD,
  FORMAT_CODE,
  FORMAT_ITALIC,
  FORMAT_STRIKETHROUGH,
  heading,
  horizontalRule,
  image,
  katexBlock,
  katexInline,
  link,
  list,
  listItem,
  mention,
  mermaid,
  paragraph,
  quote,
  spoiler,
  table,
  tableCell,
  tableRow,
  text,
  video,
} from './helpers'

export interface DiffSample {
  key: string
  label: string
  description: string
  oldValue: SerializedEditorState
  newValue: SerializedEditorState
}

// ---------------------------------------------------------------------------
// Sample 1: Blog post revision — a realistic article editing workflow
// ---------------------------------------------------------------------------

const blogPostV1 = doc(
  heading('h1', text('使用 Lexical 构建富文本编辑器')),
  paragraph(
    text('Lexical 是 Meta 开源的一款文本编辑器框架，'),
    text('它的设计目标是轻量、可扩展、且对无障碍友好', FORMAT_ITALIC),
    text('。本文将介绍如何从零开始搭建一个功能完整的编辑器。'),
  ),
  heading('h2', text('为什么选择 Lexical')),
  paragraph(
    text('市面上的编辑器框架众多，包括 '),
    text('ProseMirror', FORMAT_CODE),
    text('、'),
    text('Slate', FORMAT_CODE),
    text('、'),
    text('TipTap', FORMAT_CODE),
    text(
      ' 等。Lexical 的独特之处在于其节点系统的设计——每个节点都有严格的类型约束，这使得序列化和反序列化变得可预测。',
    ),
  ),
  list(
    'bullet',
    listItem(text('轻量的核心包（~22KB gzipped）')),
    listItem(text('原生支持协作编辑')),
    listItem(text('完善的无障碍支持')),
  ),
  heading('h2', text('基本架构')),
  paragraph(text('Lexical 的架构分为三层：')),
  list(
    'number',
    listItem(text('Core'), text(' — 编辑器内核，管理状态树和更新调度')),
    listItem(text('Nodes'), text(' — 节点定义，描述内容的数据结构')),
    listItem(text('Plugins'), text(' — 插件系统，实现具体功能')),
  ),
  paragraph(
    text(
      '编辑器状态以不可变树的形式存在。每次修改都会产生新的状态快照，这类似于 React 的状态管理思路。',
    ),
  ),
  heading('h2', text('实现一个代码块节点')),
  paragraph(
    text('代码块是技术博客中最常用的节点类型。我们需要创建一个 '),
    text('DecoratorNode', FORMAT_CODE),
    text(' 的子类：'),
  ),
  {
    type: 'code-block',
    language: 'typescript',
    code: `export class CodeBlockNode extends DecoratorNode<ReactElement> {
  __language: string
  __code: string

  static getType(): string {
    return 'code-block'
  }

  decorate(): ReactElement {
    return <CodeBlockRenderer language={this.__language} code={this.__code} />
  }
}`,
    version: 1,
  } as any,
  paragraph(
    text(
      '这样就完成了最基础的代码块实现。接下来我们可以添加语法高亮、行号显示等功能。',
    ),
  ),
  heading('h2', text('总结')),
  paragraph(
    text(
      'Lexical 作为新一代编辑器框架，在性能和开发体验上都有不错的表现。如果你正在寻找一个可定制的编辑器方案，它值得一试。',
    ),
  ),
)

const blogPostV2 = doc(
  heading('h1', text('使用 Lexical 构建现代富文本编辑器')),
  paragraph(
    text('Lexical 是 Meta 开源的文本编辑器框架，'),
    text('设计目标是轻量、可扩展、对无障碍友好', FORMAT_ITALIC),
    text('。本文将从架构设计到实战案例，全面介绍 Lexical 的核心概念。'),
  ),
  alertQuote(
    'note',
    paragraph(text('本文基于 Lexical v0.39，部分 API 可能随版本更新而变化。')),
  ) as any,
  heading('h2', text('为什么选择 Lexical')),
  paragraph(
    text('市面上的编辑器框架众多，包括 '),
    text('ProseMirror', FORMAT_CODE),
    text('、'),
    text('Slate', FORMAT_CODE),
    text('、'),
    text('TipTap', FORMAT_CODE),
    text(' 等。Lexical 的独特之处在于其'),
    text('节点系统', FORMAT_BOLD),
    text(
      '——每个节点都有严格的类型约束和确定性的序列化行为，这使得跨端渲染和版本 diff 变得可靠。',
    ),
  ),
  list(
    'bullet',
    listItem(text('轻量的核心包（~22KB gzipped）')),
    listItem(text('原生支持协作编辑（基于 Yjs）')),
    listItem(text('完善的无障碍支持')),
    listItem(text('React 19 兼容，支持 Server Components 渲染')),
    listItem(text('TypeScript 优先，类型推导完善')),
  ),
  heading('h2', text('架构概览')),
  paragraph(text('Lexical 的架构分为三层：')),
  list(
    'number',
    listItem(
      text('Core'),
      text(' — 编辑器内核，管理 EditorState 不可变树和更新调度'),
    ),
    listItem(text('Nodes'), text(' — 节点定义，描述文档的结构与内容')),
    listItem(
      text('Plugins'),
      text(' — 插件系统，以 React 组件的形式实现具体功能'),
    ),
  ),
  paragraph(
    text('编辑器状态以不可变树的形式存在。每次修改都会产生新的 '),
    text('EditorState', FORMAT_CODE),
    text(
      ' 快照。这与 React 的状态管理思路一脉相承，也使得实现撤销/重做、协作编辑变得自然。',
    ),
  ),
  quote(
    paragraph(
      text(
        'Lexical is designed to be framework-agnostic, but its React bindings are the most mature.',
        FORMAT_ITALIC,
      ),
    ),
  ),
  heading('h2', text('实现一个代码块节点')),
  paragraph(
    text('代码块是技术博客中最常用的节点类型。我们需要创建一个继承自 '),
    text('DecoratorNode', FORMAT_CODE),
    text(' 的子类，并通过 '),
    text('decorate()', FORMAT_CODE),
    text(' 方法返回 React 组件：'),
  ),
  {
    type: 'code-block',
    language: 'typescript',
    code: `export class CodeBlockNode extends DecoratorNode<ReactElement> {
  __language: string
  __code: string

  static getType(): string {
    return 'code-block'
  }

  static clone(node: CodeBlockNode): CodeBlockNode {
    return new CodeBlockNode(node.__language, node.__code, node.__key)
  }

  decorate(): ReactElement {
    return (
      <CodeBlockRenderer
        language={this.__language}
        code={this.__code}
        showLineNumbers
      />
    )
  }

  exportJSON() {
    return {
      type: 'code-block',
      language: this.__language,
      code: this.__code,
      version: 1,
    }
  }
}`,
    version: 1,
  } as any,
  paragraph(
    text('注意 '),
    text('clone()', FORMAT_CODE),
    text(' 和 '),
    text('exportJSON()', FORMAT_CODE),
    text(
      ' 是 Lexical 节点的必需方法。前者用于节点复制（拖拽、协作同步），后者用于序列化到 JSON。',
    ),
  ),
  heading('h2', text('渲染器模式')),
  paragraph(
    text('Lexical 的一大优势是编辑器和渲染器可以共享同一套节点定义。通过将 '),
    text('editable', FORMAT_CODE),
    text(' 设为 '),
    text('false', FORMAT_CODE),
    text('，编辑器即可作为只读渲染器使用：'),
  ),
  {
    type: 'code-block',
    language: 'tsx',
    code: `<LexicalComposer initialConfig={{ ...config, editable: false }}>
  <RichTextPlugin contentEditable={<ContentEditable />} />
</LexicalComposer>`,
    version: 1,
  } as any,
  paragraph(
    text('这意味着你只需维护一套节点代码，即可同时支持编辑和阅读场景。'),
  ),
  heading('h2', text('总结与展望')),
  paragraph(
    text(
      'Lexical 作为新一代编辑器框架，在性能、类型安全和开发体验上都有出色的表现。',
    ),
    text('结合 React 19 的新特性', FORMAT_BOLD),
    text('，它在 Server Components 渲染、流式注水等场景中也展现出了潜力。'),
  ),
  paragraph(text('推荐阅读：')),
  list(
    'bullet',
    listItem(link('https://lexical.dev', text('Lexical 官方文档'))),
    listItem(link('https://github.com/facebook/lexical', text('GitHub 仓库'))),
  ),
)

// ---------------------------------------------------------------------------
// Sample 2: Technical changelog / release notes revision
// ---------------------------------------------------------------------------

const changelogV1 = doc(
  heading('h1', text('v2.4.0 Release Notes')),
  paragraph(
    text(
      'Released on 2025-12-01. This release focuses on performance and bug fixes.',
    ),
  ),
  heading('h2', text('Breaking Changes')),
  list(
    'bullet',
    listItem(
      text('Removed '),
      text('legacyMode', FORMAT_CODE),
      text(' option from '),
      text('createEditor()', FORMAT_CODE),
    ),
    listItem(text('Minimum Node.js version bumped to 18')),
  ),
  heading('h2', text('New Features')),
  list(
    'bullet',
    listItem(text('Added drag-and-drop support for block reordering')),
    listItem(
      text('New '),
      text('ImageNode', FORMAT_CODE),
      text(' with thumbhash placeholder'),
    ),
    listItem(text('Markdown import/export plugin')),
  ),
  heading('h2', text('Bug Fixes')),
  list(
    'bullet',
    listItem(text('Fixed cursor jumping in Safari when pressing Enter')),
    listItem(text('Fixed undo history being lost on hot reload')),
    listItem(text('Fixed table cell selection across merged cells')),
  ),
  heading('h2', text('Performance')),
  paragraph(
    text(
      'Reduced reconciler overhead by ~30% through batched DOM updates. See ',
    ),
    link('https://github.com/example/issue/1234', text('#1234')),
    text(' for benchmarks.'),
  ),
  heading('h2', text('Migration Guide')),
  paragraph(text('To migrate from v2.3.x:')),
  list(
    'number',
    listItem(text('Remove any usage of '), text('legacyMode', FORMAT_CODE)),
    listItem(text('Update Node.js to version 18 or above')),
    listItem(text('Run '), text('npx @lexical/codemod v2.4', FORMAT_CODE)),
  ),
)

const changelogV2 = doc(
  heading('h1', text('v2.4.0 Release Notes')),
  paragraph(
    text(
      'Released on 2025-12-15. This release brings new features, performance improvements, and important bug fixes.',
    ),
  ),
  alertQuote(
    'warning',
    paragraph(
      text('This release contains '),
      text('breaking changes', FORMAT_BOLD),
      text('. Please read the migration guide before upgrading.'),
    ),
  ) as any,
  heading('h2', text('Breaking Changes')),
  list(
    'bullet',
    listItem(
      text('Removed '),
      text('legacyMode', FORMAT_CODE),
      text(' option from '),
      text('createEditor()', FORMAT_CODE),
      text(' — use '),
      text('compatMode', FORMAT_CODE),
      text(' instead'),
    ),
    listItem(text('Minimum Node.js version bumped to 18.17')),
    listItem(
      text('EditorState', FORMAT_CODE),
      text('.toJSON()', FORMAT_CODE),
      text(' now returns a frozen object'),
    ),
  ),
  heading('h2', text('New Features')),
  list(
    'bullet',
    listItem(text('Added drag-and-drop support for block reordering')),
    listItem(
      text('New '),
      text('ImageNode', FORMAT_CODE),
      text(' with thumbhash placeholder and click-to-zoom'),
    ),
    listItem(text('Markdown import/export plugin with GFM extensions')),
    listItem(
      text('New '),
      text('RichDiff', FORMAT_CODE),
      text(' component for document comparison'),
    ),
    listItem(
      text('Added '),
      text('ColorSchemeContext', FORMAT_CODE),
      text(' for theme-aware rendering'),
    ),
  ),
  heading('h2', text('Bug Fixes')),
  list(
    'bullet',
    listItem(text('Fixed cursor jumping in Safari when pressing Enter')),
    listItem(
      text('Fixed undo history being lost on hot reload', FORMAT_STRIKETHROUGH),
      text(' — backported to v2.3.3'),
    ),
    listItem(text('Fixed table cell selection across merged cells')),
    listItem(
      text('Fixed memory leak in '),
      text('OnChangePlugin', FORMAT_CODE),
      text(' when using debounce'),
    ),
    listItem(text('Fixed heading anchor IDs conflicting with page anchors')),
  ),
  heading('h2', text('Performance')),
  paragraph(
    text(
      'Reduced reconciler overhead by ~40% through batched DOM updates and skip-equal optimization. See ',
    ),
    link('https://github.com/example/issue/1234', text('#1234')),
    text(' for benchmarks.'),
  ),
  table(
    tableRow(
      tableCell(1, paragraph(text('Metric', FORMAT_BOLD))),
      tableCell(1, paragraph(text('v2.3', FORMAT_BOLD))),
      tableCell(1, paragraph(text('v2.4', FORMAT_BOLD))),
      tableCell(1, paragraph(text('Change', FORMAT_BOLD))),
    ),
    tableRow(
      tableCell(0, paragraph(text('Initial render'))),
      tableCell(0, paragraph(text('48ms'))),
      tableCell(0, paragraph(text('29ms'))),
      tableCell(0, paragraph(text('-40%', FORMAT_BOLD))),
    ),
    tableRow(
      tableCell(0, paragraph(text('Keystroke latency'))),
      tableCell(0, paragraph(text('12ms'))),
      tableCell(0, paragraph(text('8ms'))),
      tableCell(0, paragraph(text('-33%', FORMAT_BOLD))),
    ),
    tableRow(
      tableCell(0, paragraph(text('Serialization (1k nodes)'))),
      tableCell(0, paragraph(text('6ms'))),
      tableCell(0, paragraph(text('3ms'))),
      tableCell(0, paragraph(text('-50%', FORMAT_BOLD))),
    ),
  ) as any,
  heading('h2', text('Migration Guide')),
  paragraph(text('To migrate from v2.3.x:')),
  list(
    'number',
    listItem(
      text('Replace '),
      text('legacyMode', FORMAT_CODE),
      text(' with '),
      text('compatMode', FORMAT_CODE),
    ),
    listItem(text('Update Node.js to version 18.17 or above')),
    listItem(text('Run '), text('npx @lexical/codemod v2.4', FORMAT_CODE)),
    listItem(
      text('If using '),
      text('toJSON()', FORMAT_CODE),
      text(', note the return value is now frozen'),
    ),
  ),
  horizontalRule(),
  paragraph(
    text('Full changelog: '),
    link('https://github.com/example/releases/v2.4.0', text('v2.3.0...v2.4.0')),
  ),
)

// ---------------------------------------------------------------------------
// Sample 3: Short note — minimal edits to a brief personal note
// ---------------------------------------------------------------------------

const noteV1 = doc(
  heading('h2', text('周末计划')),
  paragraph(
    text('这周末打算去附近的山里徒步，天气预报说周六是晴天。需要准备的东西：'),
  ),
  list(
    'bullet',
    listItem(text('登山鞋')),
    listItem(text('水和干粮')),
    listItem(text('防晒霜')),
    listItem(text('充电宝')),
  ),
  paragraph(text('路线还没确定，等小王回复。')),
  horizontalRule(),
  paragraph(text('如果下雨的话，备选方案是去市区的博物馆看新展。')),
)

const noteV2 = doc(
  heading('h2', text('周末徒步记录')),
  paragraph(text('周六去了西山徒步，天气晴朗，体验很好。')),
  heading('h3', text('装备清单')),
  list(
    'bullet',
    listItem(text('登山鞋'), text(' ✓', FORMAT_BOLD)),
    listItem(text('水和干粮'), text(' ✓', FORMAT_BOLD)),
    listItem(text('防晒霜'), text(' ✓', FORMAT_BOLD)),
    listItem(text('充电宝'), text(' ✓', FORMAT_BOLD)),
    listItem(text('登山杖'), text('（临时买的，很有用）', FORMAT_ITALIC)),
  ),
  heading('h3', text('路线')),
  paragraph(
    text(
      '最终选了小王推荐的北坡路线，全程约 12 公里，爬升 600 米。比南坡路线风景好很多，沿途有溪流。',
    ),
  ),
  quote(paragraph(text('到山顶的时候刚好赶上日落，值了。'))),
  horizontalRule(),
  paragraph(text('下次想试试南坡的野营路线，需要提前预约营地。')),
)

// ---------------------------------------------------------------------------
// Sample 4: Technical documentation with KaTeX, Mermaid, and nested structures
// ---------------------------------------------------------------------------

const techDocV1 = doc(
  heading('h1', text('机器学习算法速查')),
  paragraph(text('本文介绍几种常用的机器学习算法，包括数学原理和实现细节。')),
  heading('h2', text('线性回归')),
  paragraph(
    text('线性回归的目标是找到最优参数 '),
    text('θ', FORMAT_ITALIC),
    text(' 使得：'),
  ),
  katexBlock(
    'J(\\theta) = \\frac{1}{2m}\\sum_{i=1}^{m}(h_\\theta(x^{(i)}) - y^{(i)})^2',
  ),
  paragraph(
    text('其中假设函数为 '),
    text('hθ(x) = θ₀ + θ₁x', FORMAT_CODE),
    text('，通过梯度下降迭代更新参数。'),
  ),
  details(
    '梯度下降推导',
    false,
    paragraph(text('对代价函数求偏导：')),
    katexBlock(
      '\\frac{\\partial J}{\\partial \\theta_j} = \\frac{1}{m}\\sum_{i=1}^{m}(h_\\theta(x^{(i)}) - y^{(i)})x_j^{(i)}',
    ),
  ),
  heading('h2', text('神经网络')),
  paragraph(text('神经网络由多层神经元组成：')),
  mermaid(`graph TD
    A[Input Layer] --> B[Hidden Layer 1]
    B --> C[Hidden Layer 2]
    C --> D[Output Layer]`),
  paragraph(text('激活函数常用 ReLU：')),
  katexBlock('f(x) = \\max(0, x)'),
)

const techDocV2 = doc(
  heading('h1', text('机器学习算法速查手册')),
  banner(
    'tip',
    paragraph(
      text('本文持续更新，最后修订于 2025 年 12 月。如有疑问请联系 '),
      mention('github', 'ml-team', 'ML Team'),
    ),
  ) as any,
  paragraph(
    text('本文系统介绍常用机器学习算法，涵盖'),
    text('数学原理', FORMAT_BOLD),
    text('、'),
    text('代码实现', FORMAT_BOLD),
    text('和'),
    text('工程实践', FORMAT_BOLD),
    text('。'),
  ),
  heading('h2', text('线性回归')),
  paragraph(
    text('线性回归的目标是找到最优参数 '),
    text('θ', FORMAT_ITALIC),
    text(' 使得代价函数最小：'),
  ),
  katexBlock(
    'J(\\theta) = \\frac{1}{2m}\\sum_{i=1}^{m}(h_\\theta(x^{(i)}) - y^{(i)})^2',
  ),
  paragraph(
    text('其中假设函数为 '),
    text('hθ(x) = θᵀx', FORMAT_CODE),
    text('，支持多特征输入。通过梯度下降或正规方程求解。'),
  ),
  details(
    '梯度下降与正规方程对比',
    true,
    table(
      tableRow(
        tableCell(1, paragraph(text('方法', FORMAT_BOLD))),
        tableCell(1, paragraph(text('时间复杂度', FORMAT_BOLD))),
        tableCell(1, paragraph(text('适用场景', FORMAT_BOLD))),
      ),
      tableRow(
        tableCell(0, paragraph(text('梯度下降'))),
        tableCell(0, paragraph(text('O(kmn)'))),
        tableCell(0, paragraph(text('大规模数据'))),
      ),
      tableRow(
        tableCell(0, paragraph(text('正规方程'))),
        tableCell(0, paragraph(text('O(n³)'))),
        tableCell(0, paragraph(text('n < 10⁴'))),
      ),
    ) as any,
  ) as any,
  heading('h2', text('神经网络')),
  paragraph(text('神经网络由多层神经元组成，信息前向传播：')),
  mermaid(`graph TD
    A[Input Layer<br/>784 neurons] --> B[Hidden Layer 1<br/>256 neurons]
    B --> C[Hidden Layer 2<br/>128 neurons]
    C --> D[Output Layer<br/>10 classes]
    
    style A fill:#e1f5fe
    style D fill:#fff3e0`),
  paragraph(text('激活函数发展历程：')),
  list(
    'bullet',
    listItem(
      text('Sigmoid: '),
      katexInline('\\sigma(x) = \\frac{1}{1+e^{-x}}') as any,
    ),
    listItem(
      text('Tanh: '),
      katexInline('\\tanh(x) = \\frac{e^x - e^{-x}}{e^x + e^{-x}}') as any,
    ),
    listItem(
      text('ReLU: '),
      katexInline('f(x) = \\max(0, x)') as any,
      text(' ← 当前主流'),
    ),
    listItem(
      text('GELU: '),
      katexInline('x \\cdot \\Phi(x)') as any,
      text(' ← Transformer 常用'),
    ),
  ),
  heading('h2', text('实践建议')),
  alertQuote(
    'important',
    paragraph(text('训练前务必进行数据归一化，否则梯度可能爆炸或消失。')),
  ) as any,
  paragraph(
    text('更多细节参考 '),
    link(
      'https://scikit-learn.org/stable/modules/linear_model.html',
      text('scikit-learn 文档'),
    ),
    text('。'),
    footnote('sklearn') as any,
  ),
)

// ---------------------------------------------------------------------------
// Sample 5: Movie/Show review with spoilers, images, and banners
// ---------------------------------------------------------------------------

const movieReviewV1 = doc(
  heading('h1', text('《奥本海默》观影随笔')),
  paragraph(text('诺兰新作，3 小时的史诗级传记片。')),
  image({
    src: 'https://example.com/oppenheimer-poster.jpg',
    altText: 'Oppenheimer poster',
    caption: '《奥本海默》官方海报',
  }) as any,
  heading('h2', text('剧情简介')),
  paragraph(
    text(
      '影片讲述了"原子弹之父"罗伯特·奥本海默的故事，从他在剑桥的学习经历，到曼哈顿计划的领导，再到战后安全听证会上的审判。',
    ),
  ),
  heading('h2', text('演员阵容')),
  list(
    'bullet',
    listItem(text('基里安·墨菲 饰 奥本海默')),
    listItem(text('艾米莉·布朗特 饰 凯蒂')),
    listItem(text('小罗伯特·唐尼 饰 刘易斯')),
  ),
  horizontalRule(),
  paragraph(text('评分：★★★★☆')),
)

const movieReviewV2 = doc(
  heading('h1', text('《奥本海默》：光影中的原子时代')),
  banner(
    'note',
    paragraph(
      text('本文首发于 '),
      mention('twitter', 'filmcritic', '影评人专栏'),
      text('，转载请注明出处。'),
    ),
  ) as any,
  paragraph(
    text(
      '克里斯托弗·诺兰用 3 小时构建了一座人类良知的纪念碑。这是他最成熟的作品',
    ),
    text('——', FORMAT_ITALIC),
    text('也是最令人不安的。'),
  ),
  image({
    src: 'https://example.com/oppenheimer-poster-hd.jpg',
    altText: 'Oppenheimer poster in high definition',
    width: 800,
    height: 1200,
    caption: '《奥本海默》国际版海报（2023）',
  }) as any,
  heading('h2', text('叙事结构')),
  paragraph(
    text(
      '影片采用非线性叙事，交错呈现 "Fission"（裂变）和 "Fusion"（聚变）两条线索：',
    ),
  ),
  mermaid(`graph LR
    A[Fission: 奥本海默视角] --> B[曼哈顿计划]
    B --> C[三位一体核试验]
    C --> D[广岛长崎]
    E[Fusion: 刘易斯视角] --> F[战后听证会]
    F --> G[政治审判]
    D --> G`),
  heading('h2', text('演员表现')),
  list(
    'bullet',
    listItem(
      text('基里安·墨菲 饰 奥本海默'),
      text(' —— 演技巅峰，静默中的恐惧', FORMAT_BOLD),
    ),
    listItem(text('艾米莉·布朗特 饰 凯蒂'), text(' —— 坚韧而复杂的女性形象')),
    listItem(
      text('小罗伯特·唐尼 饰 刘易斯·施特劳斯'),
      text(' —— 从配角到暗线的精妙布局', FORMAT_BOLD),
    ),
    listItem(text('马特·达蒙 饰 格罗夫斯将军')),
  ),
  heading('h2', text('剧透讨论')),
  alertQuote(
    'warning',
    paragraph(text('以下内容涉及关键剧情，请谨慎阅读。')),
  ) as any,
  details(
    '点击展开剧透内容',
    false,
    paragraph(
      text('听证会戏份是全片最震撼的部分。奥本海默在'),
      spoiler(text('得知广岛惨状后') as any) as any,
      text(
        '，面对记者的微笑成为影史最令人心碎的瞬间。诺兰用 IMAX 画幅捕捉了墨菲眼中的空洞——那不是愧疚，而是',
      ),
      spoiler(text('意识到自己打开了潘多拉魔盒后的虚无') as any) as any,
      text('。'),
    ),
    quote(paragraph(text('"Now I am become Death, the destroyer of worlds."'))),
    paragraph(text('这句话在影片中出现了两次：第一次是念诵，第二次是看见。')),
  ) as any,
  heading('h2', text('技术层面')),
  table(
    tableRow(
      tableCell(1, paragraph(text('项目', FORMAT_BOLD))),
      tableCell(1, paragraph(text('评价', FORMAT_BOLD))),
    ),
    tableRow(
      tableCell(0, paragraph(text('摄影'))),
      tableCell(0, paragraph(text('IMAX 65mm，实景为主'))),
    ),
    tableRow(
      tableCell(0, paragraph(text('配乐'))),
      tableCell(0, paragraph(text('路德维希·葛兰森，小提琴主导'))),
    ),
    tableRow(
      tableCell(0, paragraph(text('剪辑'))),
      tableCell(0, paragraph(text('Jennifer Lame，节奏紧凑'))),
    ),
  ) as any,
  horizontalRule(),
  paragraph(text('评分：★★★★★ （年度最佳）')),
  paragraph(
    text('相关推荐：'),
    link('https://example.com/tenet-review', text('《信条》解析')),
    text(' | '),
    link('https://example.com/dunkirk-review', text('《敦刻尔克》影评')),
  ),
)

// ---------------------------------------------------------------------------
// Sample 6: API documentation with code blocks, tables, and nested details
// ---------------------------------------------------------------------------

const apiDocV1 = doc(
  heading('h1', text('Shiro Editor API')),
  paragraph(text('富文本编辑器的核心 API 文档。')),
  heading('h2', text('RichEditor')),
  paragraph(text('主编辑器组件，支持完整的编辑功能。')),
  details('Props', false, paragraph(text('待补充...'))) as any,
  heading('h2', text('RichRenderer')),
  paragraph(text('只读渲染器，用于内容展示。')),
  heading('h2', text('插件系统')),
  list(
    'bullet',
    listItem(text('SlashMenuPlugin')),
    listItem(text('FloatingToolbarPlugin')),
    listItem(text('MarkdownShortcutPlugin')),
  ),
)

const apiDocV2 = doc(
  heading('h1', text('Shiro Editor API Reference')),
  banner(
    'important',
    paragraph(
      text('v3.0 引入了破坏性变更，请查阅 '),
      link('https://docs.shiro.app/migration/v3', text('迁移指南')),
      text('。'),
    ),
  ) as any,
  paragraph(
    text('完整的富文本编辑器 API 文档，涵盖组件、Hooks、节点类型和插件系统。'),
  ),
  heading('h2', text('组件')),
  heading('h3', text('RichEditor')),
  paragraph(text('功能完整的编辑器组件，支持所有自定义节点和插件。')),
  details(
    'Props 接口',
    true,
    table(
      tableRow(
        tableCell(1, paragraph(text('属性', FORMAT_BOLD))),
        tableCell(1, paragraph(text('类型', FORMAT_BOLD))),
        tableCell(1, paragraph(text('默认值', FORMAT_BOLD))),
        tableCell(1, paragraph(text('说明', FORMAT_BOLD))),
      ),
      tableRow(
        tableCell(0, paragraph(text('initialState'))),
        tableCell(0, paragraph(text('SerializedEditorState'))),
        tableCell(0, paragraph(text('-'))),
        tableCell(0, paragraph(text('初始编辑器状态'))),
      ),
      tableRow(
        tableCell(0, paragraph(text('variant'))),
        tableCell(0, paragraph(text("'article' | 'note' | 'comment'"))),
        tableCell(0, paragraph(text("'article'"))),
        tableCell(0, paragraph(text('编辑器变体'))),
      ),
      tableRow(
        tableCell(0, paragraph(text('editable'))),
        tableCell(0, paragraph(text('boolean'))),
        tableCell(0, paragraph(text('true'))),
        tableCell(0, paragraph(text('是否可编辑'))),
      ),
      tableRow(
        tableCell(0, paragraph(text('onChange'))),
        tableCell(0, paragraph(text('(state) => void'))),
        tableCell(0, paragraph(text('-'))),
        tableCell(0, paragraph(text('状态变化回调'))),
      ),
      tableRow(
        tableCell(0, paragraph(text('rendererConfig'))),
        tableCell(0, paragraph(text('RendererConfig'))),
        tableCell(0, paragraph(text('-'))),
        tableCell(0, paragraph(text('自定义渲染器配置'))),
      ),
    ) as any,
  ) as any,
  heading('h3', text('RichRenderer')),
  paragraph(text('只读渲染器，无编辑依赖，适合 SSR 和静态页面。')),
  alertQuote(
    'tip',
    paragraph(
      text(
        'RichRenderer 自动 tree-shake 所有编辑 UI 依赖，包体积比 RichEditor 小 ~40%。',
      ),
    ),
  ) as any,
  heading('h2', text('自定义节点')),
  paragraph(text('所有节点继承自 Lexical 的 DecoratorNode：')),
  list(
    'bullet',
    listItem(text('ImageNode'), text(' — 图片节点，支持 thumbhash 和 caption')),
    listItem(text('CodeBlockNode'), text(' — 代码块，支持 Shiki 高亮')),
    listItem(text('MermaidNode'), text(' — Mermaid 图表')),
    listItem(text('KaTeXBlockNode'), text(' — 块级数学公式')),
    listItem(text('AlertQuoteNode'), text(' — GitHub 风格提示框')),
    listItem(text('DetailsNode'), text(' — 可折叠内容块')),
    listItem(text('MentionNode'), text(' — 社交平台提及')),
    listItem(text('FootnoteNode'), text(' — 脚注引用')),
    listItem(text('VideoNode'), text(' — 视频嵌入')),
    listItem(text('BannerNode'), text(' — 横幅公告')),
  ),
  heading('h2', text('插件系统')),
  details(
    '内置插件列表',
    false,
    heading('h4', text('SlashMenuPlugin')),
    paragraph(text('斜杠命令菜单，支持自定义命令项。')),
    heading('h4', text('FloatingToolbarPlugin')),
    paragraph(text('悬浮工具栏，选中文本时显示。')),
    heading('h4', text('MarkdownShortcutPlugin')),
    paragraph(text('Markdown 快捷键支持。')),
    heading('h4', text('AutoLinkPlugin')),
    paragraph(text('自动识别并转换 URL 为链接。')),
    heading('h4', text('OnChangePlugin')),
    paragraph(text('状态变化监听，支持防抖。')),
  ) as any,
  heading('h2', text('版本历史')),
  table(
    tableRow(
      tableCell(1, paragraph(text('版本', FORMAT_BOLD))),
      tableCell(1, paragraph(text('日期', FORMAT_BOLD))),
      tableCell(1, paragraph(text('主要变更', FORMAT_BOLD))),
    ),
    tableRow(
      tableCell(0, paragraph(text('v3.0'))),
      tableCell(0, paragraph(text('2025-12'))),
      tableCell(0, paragraph(text('Static/Edit 节点分离，优化包体积'))),
    ),
    tableRow(
      tableCell(0, paragraph(text('v2.5'))),
      tableCell(0, paragraph(text('2025-09'))),
      tableCell(0, paragraph(text('新增 Mermaid、KaTeX 支持'))),
    ),
    tableRow(
      tableCell(0, paragraph(text('v2.0'))),
      tableCell(0, paragraph(text('2025-06'))),
      tableCell(0, paragraph(text('迁移至 Lexical v0.39'))),
    ),
  ) as any,
)

// ---------------------------------------------------------------------------
// Sample 7: Multi-media content with video, image grid, and complex formatting
// ---------------------------------------------------------------------------

const multimediaV1 = doc(
  heading('h1', text('2025 旅行记录')),
  paragraph(text('今年去了几个很棒的地方。')),
  image({
    src: 'https://example.com/travel-1.jpg',
    altText: 'Mountain view',
    caption: '山顶风景',
  }) as any,
  heading('h2', text('日本')),
  paragraph(text('樱花季的京都非常美丽。')),
)

const multimediaV2 = doc(
  heading('h1', text('2025 旅行记录：跨越四季的风景')),
  banner(
    'tip',
    paragraph(text('所有照片使用 Sony A7IV + 24-70mm f/2.8 GM II 拍摄。')),
  ) as any,
  paragraph(
    text(
      '这一年，走过四个国家，跨越了春夏秋冬。从日本的樱花到冰岛的极光，每一次出发都是对未知的期待。',
    ),
  ),
  heading('h2', text('春 · 日本京都')),
  image({
    src: 'https://example.com/kyoto-sakura.jpg',
    altText: 'Kyoto cherry blossoms at Philosopher Path',
    width: 1200,
    height: 800,
    caption: '哲学之道的樱花（2025年4月）',
    accent: '#FFB7C5',
  }) as any,
  paragraph(
    text(
      '四月初的京都，樱花正值满开。清晨六点的哲学之道，游客稀少，粉色花瓣随风飘落，铺满整条小径。',
    ),
  ),
  list(
    'bullet',
    listItem(text('清水寺'), text(' — 俯瞰京都全景')),
    listItem(text('伏见稻荷大社'), text(' — 千本鸟居的震撼')),
    listItem(text('岚山竹林'), text(' — 清晨最佳')),
  ),
  heading('h2', text('夏 · 冰岛')),
  video({
    src: 'https://example.com/iceland-midnight-sun.mp4',
    poster: 'https://example.com/iceland-poster.jpg',
    width: 1920,
    height: 1080,
  }) as any,
  paragraph(
    text('午夜的太阳永不落下。在冰岛的环岛公路上，我们追逐着极昼的光芒。'),
  ),
  quote(
    paragraph(
      text('The midnight sun turns everything golden.'),
      text(' — Travel Journal', FORMAT_ITALIC),
    ),
  ),
  heading('h2', text('秋 · 加拿大')),
  image({
    src: 'https://example.com/canada-fall.jpg',
    altText: 'Moraine Lake in autumn',
    width: 1200,
    height: 800,
    caption: '梦莲湖的秋色（2025年10月）',
    accent: '#E67E22',
  }) as any,
  details(
    '枫叶大道自驾路线',
    false,
    paragraph(text('推荐 7 天行程：')),
    list(
      'number',
      listItem(text('多伦多'), text(' — 起点，城市探索')),
      listItem(text('阿冈昆省立公园'), text(' — 枫叶核心区域')),
      listItem(text('渥太华'), text(' — 首都文化')),
      listItem(text('蒙特利尔'), text(' — 法式风情')),
      listItem(text('魁北克城'), text(' — 终点，历史古城')),
    ),
  ) as any,
  heading('h2', text('冬 · 瑞士')),
  paragraph(
    text(
      '少女峰的雪景如童话世界。滑雪、温泉、巧克力——冬日的瑞士满足了所有想象。',
    ),
  ),
  alertQuote(
    'caution',
    paragraph(text('冬季自驾需备雪链，部分山口可能封闭。')),
  ) as any,
  horizontalRule(),
  paragraph(text('旅行统计：')),
  table(
    tableRow(
      tableCell(1, paragraph(text('目的地', FORMAT_BOLD))),
      tableCell(1, paragraph(text('天数', FORMAT_BOLD))),
      tableCell(1, paragraph(text('照片数', FORMAT_BOLD))),
      tableCell(1, paragraph(text('最佳回忆', FORMAT_BOLD))),
    ),
    tableRow(
      tableCell(0, paragraph(text('日本'))),
      tableCell(0, paragraph(text('14'))),
      tableCell(0, paragraph(text('2,340'))),
      tableCell(0, paragraph(text('清晨的哲学之道'))),
    ),
    tableRow(
      tableCell(0, paragraph(text('冰岛'))),
      tableCell(0, paragraph(text('10'))),
      tableCell(0, paragraph(text('1,856'))),
      tableCell(0, paragraph(text('午夜阳光'))),
    ),
    tableRow(
      tableCell(0, paragraph(text('加拿大'))),
      tableCell(0, paragraph(text('12'))),
      tableCell(0, paragraph(text('1,923'))),
      tableCell(0, paragraph(text('阿冈昆的枫叶'))),
    ),
    tableRow(
      tableCell(0, paragraph(text('瑞士'))),
      tableCell(0, paragraph(text('8'))),
      tableCell(0, paragraph(text('1,102'))),
      tableCell(0, paragraph(text('少女峰日出'))),
    ),
  ) as any,
)

// ---------------------------------------------------------------------------
// Export all samples
// ---------------------------------------------------------------------------

export const diffSamples: DiffSample[] = [
  {
    key: 'blog-revision',
    label: '博客文章修订',
    description:
      '技术文章从初稿到发布版本的典型修订过程，含新增章节、段落改写、代码块扩展、引用和链接的增补',
    oldValue: blogPostV1,
    newValue: blogPostV2,
  },
  {
    key: 'changelog',
    label: 'Release Notes 更新',
    description:
      '版本发布日志的迭代，含新增条目、表格数据、alert 提示、删除线标注、链接引用',
    oldValue: changelogV1,
    newValue: changelogV2,
  },
  {
    key: 'note-edit',
    label: '笔记 → 记录',
    description:
      '从计划笔记演变为事后记录，标题改变、内容从待办变为已完成、新增子章节和引用',
    oldValue: noteV1,
    newValue: noteV2,
  },
  {
    key: 'tech-doc',
    label: '技术文档修订',
    description:
      '机器学习算法文档的完善过程，含 KaTeX 公式、Mermaid 图表、嵌套 Details、表格对比',
    oldValue: techDocV1,
    newValue: techDocV2,
  },
  {
    key: 'movie-review',
    label: '影评内容丰富',
    description:
      '从简单随笔到完整影评，含图片、Banner、剧透折叠、Mermaid 叙事图、评分表格',
    oldValue: movieReviewV1,
    newValue: movieReviewV2,
  },
  {
    key: 'api-doc',
    label: 'API 文档迭代',
    description:
      '从简单说明到完整 API 参考，含嵌套 Details、Props 表格、版本历史、Alert 提示',
    oldValue: apiDocV1,
    newValue: apiDocV2,
  },
  {
    key: 'multimedia',
    label: '多媒体游记',
    description:
      '从简单记录到丰富的多媒体游记，含图片、视频、Banner、嵌套列表、统计表格',
    oldValue: multimediaV1,
    newValue: multimediaV2,
  },
]
