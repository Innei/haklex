import type { EmbedType, SerializedEmbedNode } from '@haklex/rich-ext-embed/static';
import type { SerializedEditorState } from 'lexical';

import {
  doc,
  FORMAT_BOLD,
  FORMAT_CODE,
  FORMAT_HIGHLIGHT,
  FORMAT_ITALIC,
  FORMAT_STRIKETHROUGH,
  FORMAT_SUBSCRIPT,
  FORMAT_SUPERSCRIPT,
  FORMAT_UNDERLINE,
  heading,
  horizontalRule,
  lineBreak,
  link,
  list,
  listItem,
  paragraph,
  quote,
  table,
  tableCell,
  tableRow,
  text,
} from './helpers';
import type { Preset } from './presets';

// task list helpers
function taskList(...children: any[]) {
  return {
    type: 'list',
    listType: 'check',
    tag: 'ul',
    start: 1,
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  };
}

function taskItem(checked: boolean, value: number, label: string) {
  return {
    type: 'listitem',
    checked,
    value,
    children: [paragraph(text(label))],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  };
}

function alertQuote(alertType: string, ...children: any[]) {
  return {
    type: 'alert-quote',
    alertType,
    content: {
      root: {
        children,
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    },
    version: 1,
  };
}

function banner(bannerType: string, ...children: any[]) {
  return {
    type: 'banner',
    bannerType,
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  };
}

function details(summary: string, ...children: any[]) {
  return {
    type: 'details',
    summary,
    open: false,
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  };
}

function grid(cols: number, gap: number, ...children: any[]) {
  return {
    type: 'grid-container',
    cols,
    gap,
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  };
}

function codeBlock(language: string, code: string) {
  return { type: 'code-block', language, code, version: 1 };
}

function katexBlock(equation: string) {
  return { type: 'katex-block', equation, version: 1 };
}

function katexInline(equation: string) {
  return { type: 'katex-inline', equation, version: 1 };
}

function image(
  src: string,
  altText = '',
  caption?: string,
  width?: number,
  height?: number,
  thumbhash?: string,
) {
  return {
    type: 'image',
    src,
    altText,
    caption,
    ...(width != null && { width }),
    ...(height != null && { height }),
    ...(thumbhash != null && { thumbhash }),
    version: 1,
  };
}

function video(src: string) {
  return { type: 'video', src, version: 1 };
}

function linkCard(url: string, title?: string, description?: string) {
  return { type: 'link-card', url, title, description, version: 1 };
}

function embed(url: string, source: EmbedType | null = null): SerializedEmbedNode {
  return { type: 'embed', url, source, version: 1 };
}

function mention(platform: string, handle: string, displayName?: string) {
  return {
    type: 'mention',
    platform,
    handle,
    ...(displayName ? { displayName } : {}),
    version: 1,
  };
}

function footnote(identifier: string) {
  return { type: 'footnote', identifier, version: 1 };
}

function spoiler(...children: any[]) {
  return { type: 'spoiler', children, version: 1 };
}

function gallery(
  images: {
    src: string;
    alt?: string;
    width?: number;
    height?: number;
    thumbhash?: string;
  }[],
  layout: 'grid' | 'masonry' | 'carousel' = 'grid',
) {
  return { type: 'gallery', images, layout, version: 1 };
}

function indentedListItem(indent: number, label: string) {
  return { ...listItem(paragraph(text(label))), indent };
}

const IMG_BASE = 'https://xcimg.szwego.com/img/f71fe4b2';

export const markdownTestPreset: Preset = {
  key: 'markdown-test',
  label: 'Shiroi Markdown 渲染测试',
  description: '覆盖所有 Shiroi Markdown 渲染功能的完整测试',
  data: doc(
    // ==============================
    // # 基础语法
    // ==============================
    heading('h1', text('Shiroi Markdown 渲染测试')),

    heading('h2', text('基础语法')),
    heading('h3', text('标题层级')),
    heading('h1', text('一级标题')),
    heading('h2', text('二级标题')),
    heading('h3', text('三级标题')),
    heading('h4', text('四级标题')),
    heading('h5', text('五级标题')),
    heading('h6', text('六级标题')),

    // 文本样式
    heading('h3', text('文本样式')),
    paragraph(
      text('这是'),
      text('粗体文本', FORMAT_BOLD),
      text('，这是'),
      text('斜体文本', FORMAT_ITALIC),
      text('，这是'),
      text('粗斜体', FORMAT_BOLD | FORMAT_ITALIC),
      text('。'),
    ),
    paragraph(text('这是'), text('删除线', FORMAT_STRIKETHROUGH), text('文本。')),
    paragraph(text('这是 '), text('高亮标记', FORMAT_HIGHLIGHT), text(' 文本。')),
    paragraph(text('这是 '), text('插入文本', FORMAT_UNDERLINE), text(' 效果。')),
    paragraph(text('这是 '), spoiler(text('剧透文本，鼠标悬停显示')) as any, text(' 效果。')),

    // 引用
    heading('h3', text('引用')),
    quote(paragraph(text('这是一段引用文本')), paragraph(text('可以有多行'))),

    // 分割线
    heading('h3', text('分割线')),
    horizontalRule(),
    horizontalRule(),
    horizontalRule(),
    horizontalRule(),

    // ==============================
    // # 列表
    // ==============================
    heading('h2', text('列表')),

    heading('h3', text('无序列表')),
    list(
      'bullet',
      listItem(paragraph(text('项目一'))),
      indentedListItem(1, '子项目 1.1') as any,
      indentedListItem(1, '子项目 1.2') as any,
      indentedListItem(2, '子子项目') as any,
      listItem(paragraph(text('项目二'))),
      listItem(paragraph(text('项目三'))),
    ),

    heading('h3', text('有序列表')),
    list(
      'number',
      listItem(paragraph(text('第一步'))),
      listItem(paragraph(text('第二步'))),
      indentedListItem(1, '步骤 2.1') as any,
      indentedListItem(1, '步骤 2.2') as any,
      listItem(paragraph(text('第三步'))),
    ),

    heading('h3', text('GFM 任务列表')),
    taskList(
      taskItem(false, 1, '待办事项 1'),
      taskItem(true, 2, '已完成事项 2'),
      taskItem(false, 3, '待办事项 3'),
      taskItem(true, 4, '已完成事项 4'),
    ) as any,

    horizontalRule(),

    // ==============================
    // # 代码
    // ==============================
    heading('h2', text('代码')),

    heading('h3', text('行内代码')),
    paragraph(text('这是 '), text('inline code', FORMAT_CODE), text(' 行内代码示例。')),
    paragraph(text('使用 '), text('npm install', FORMAT_CODE), text(' 安装依赖。')),

    heading('h3', text('代码块')),
    codeBlock(
      'javascript',
      `// JavaScript 代码高亮
function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return {
    message: 'Welcome to Shiroi',
    timestamp: Date.now()
  };
}

greet('World');`,
    ) as any,

    codeBlock(
      'typescript',
      `// TypeScript 代码高亮
interface User {
  id: number;
  name: string;
  email?: string;
}

const createUser = (data: Partial<User>): User => ({
  id: Date.now(),
  name: 'Anonymous',
  ...data
});`,
    ) as any,

    codeBlock(
      'python',
      `# Python 代码高亮
def fibonacci(n: int) -> list[int]:
    """生成斐波那契数列"""
    if n <= 0:
        return []
    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[i-1] + fib[i-2])
    return fib[:n]

print(fibonacci(10))`,
    ) as any,

    codeBlock(
      'css',
      `/* CSS 代码高亮 */
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}`,
    ) as any,

    codeBlock(
      'bash',
      `# Shell 命令
npm install
pnpm dev
docker compose up -d`,
    ) as any,

    codeBlock(
      'json',
      `{
  "name": "shiroi",
  "version": "1.0.0",
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0"
  }
}`,
    ) as any,

    horizontalRule(),

    // ==============================
    // # 表格
    // ==============================
    heading('h2', text('表格')),
    table(
      tableRow(
        tableCell(1, paragraph(text('功能'))),
        tableCell(1, paragraph(text('支持情况'))),
        tableCell(1, paragraph(text('备注'))),
      ) as any,
      tableRow(
        tableCell(0, paragraph(text('Markdown 基础语法'))),
        tableCell(0, paragraph(text('✓'))),
        tableCell(0, paragraph(text('完全支持'))),
      ) as any,
      tableRow(
        tableCell(0, paragraph(text('GFM 扩展'))),
        tableCell(0, paragraph(text('✓'))),
        tableCell(0, paragraph(text('任务列表、表格等'))),
      ) as any,
      tableRow(
        tableCell(0, paragraph(text('数学公式'))),
        tableCell(0, paragraph(text('✓'))),
        tableCell(0, paragraph(text('KaTeX 渲染'))),
      ) as any,
      tableRow(
        tableCell(0, paragraph(text('代码高亮'))),
        tableCell(0, paragraph(text('✓'))),
        tableCell(0, paragraph(text('Shiki 引擎'))),
      ) as any,
      tableRow(
        tableCell(0, paragraph(text('自定义组件'))),
        tableCell(0, paragraph(text('✓'))),
        tableCell(0, paragraph(text('React 组件嵌入'))),
      ) as any,
    ) as any,

    table(
      tableRow(
        tableCell(1, paragraph(text('左对齐'))),
        tableCell(1, paragraph(text('居中对齐'))),
        tableCell(1, paragraph(text('右对齐'))),
      ) as any,
      tableRow(
        tableCell(0, paragraph(text('内容'))),
        tableCell(0, paragraph(text('内容'))),
        tableCell(0, paragraph(text('内容'))),
      ) as any,
      tableRow(
        tableCell(0, paragraph(text('较长的内容'))),
        tableCell(0, paragraph(text('较长的内容'))),
        tableCell(0, paragraph(text('较长的内容'))),
      ) as any,
    ) as any,

    horizontalRule(),

    // ==============================
    // # 数学公式 (KaTeX)
    // ==============================
    heading('h2', text('数学公式 (KaTeX)')),

    heading('h3', text('行内公式')),
    paragraph(
      text('爱因斯坦质能方程 '),
      katexInline('E = mc^2') as any,
      text(' 是物理学中最著名的公式。'),
    ),
    paragraph(
      text('勾股定理表示为 '),
      katexInline('c = \\pm\\sqrt{a^2 + b^2}') as any,
      text(' 。'),
    ),
    paragraph(
      text('二次方程求根公式是 '),
      katexInline('x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}') as any,
      text(' 。'),
    ),
    paragraph(
      text('也可以不带空格：勾股定理 '),
      katexInline('c = \\pm\\sqrt{a^2 + b^2}') as any,
      text(' 和多项式 '),
      katexInline('P(x) = a_nx^n+a_{n-1}x^{n-1} + \\dots + a_1x + a_0') as any,
      text(' 。'),
    ),

    heading('h3', text('块级公式')),
    katexBlock('\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}') as any,
    katexBlock('P(x) = a_nx^n + a_{n-1}x^{n-1} + \\dots + a_1x + a_0') as any,
    katexBlock('\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}') as any,
    katexBlock(
      '\\begin{pmatrix}\na & b \\\\\nc & d\n\\end{pmatrix}\n\\begin{pmatrix}\nx \\\\\ny\n\\end{pmatrix}\n=\n\\begin{pmatrix}\nax + by \\\\\ncx + dy\n\\end{pmatrix}',
    ) as any,

    horizontalRule(),

    // ==============================
    // # 图片
    // ==============================
    heading('h2', text('图片')),

    heading('h3', text('基础图片')),
    image(
      `${IMG_BASE}/22213165-6445-4d76-9238-3a61a5378d9a.jpg`,
      '',
      undefined,
      1200,
      800,
      'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
    ) as any,

    heading('h3', text('带标题的图片')),
    image(
      `${IMG_BASE}/41a3e56f-97f1-4df4-bddd-4501ce3b8fed.jpg`,
      '风景',
      '这是一张风景图',
      1200,
      800,
      'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
    ) as any,

    horizontalRule(),

    // ==============================
    // # 链接
    // ==============================
    heading('h2', text('链接')),

    heading('h3', text('普通链接')),
    paragraph(link('https://github.com', text('访问 GitHub'))),
    paragraph(link('https://github.com/Innei/Shiro', text('Shiroi 项目'))),

    heading('h3', text('自动链接')),
    paragraph(link('https://github.com/Innei', text('https://github.com/Innei'))),
    paragraph(link('https://github.com/Innei/Shiro', text('https://github.com/Innei/Shiro'))),

    horizontalRule(),

    // ==============================
    // # 富链接卡片 (自动解析)
    // ==============================
    heading('h2', text('富链接卡片 (自动解析)')),

    heading('h3', text('GitHub 仓库')),
    linkCard('https://github.com/Innei/Shiro', 'Innei/Shiro') as any,

    heading('h3', text('GitHub Commit')),
    linkCard(
      'https://github.com/vuejs/vitepress/commit/71eb11f72e60706a546b756dc3fd72d06e2ae4e2',
      'vuejs/vitepress - Commit',
    ) as any,

    heading('h3', text('GitHub PR')),
    linkCard('https://github.com/Innei/Shiro/pull/129', 'Innei/Shiro - Pull Request #129') as any,

    heading('h3', text('GitHub 文件预览')),
    embed(
      'https://github.com/Innei/Shiro/blob/108d4c3e927e1c9c9304e41a0631f91958477d9f/src/providers/root/modal-stack-provider.tsx',
      'github-file',
    ),

    heading('h3', text('Twitter/X')),
    embed('https://twitter.com/zhizijun/status/1649822091234148352', 'tweet'),

    heading('h3', text('YouTube')),
    embed('https://www.youtube.com/watch?v=N93cTbtLCIM', 'youtube'),

    heading('h3', text('GitHub Gist')),
    embed('https://gist.github.com/Innei/94b3e8f078d29e1820813a24a3d8b04e', 'github-gist'),

    heading('h3', text('CodeSandbox')),
    embed('https://codesandbox.io/s/framer-motion-layoutroot-prop-forked-p39g96', 'codesandbox'),

    heading('h3', text('站内文章链接')),
    paragraph(text('如果链接指向本站的文章，会自动渲染为卡片形式：')),
    linkCard('https://www.lxink.cn/posts/share/seedflow', '站内文章') as any,

    horizontalRule(),

    // ==============================
    // # LinkCard 组件
    // ==============================
    heading('h2', text('LinkCard 组件')),
    linkCard('https://github.com/mx-space/core', 'mx-space/core') as any,
    linkCard('https://github.com/Innei/Shiro', 'Innei/Shiro') as any,
    linkCard(
      'https://github.com/mx-space/kami/commit/e1eee4136c21ab03ab5690e17025777984c362a0',
      'mx-space/kami - Commit',
    ) as any,

    horizontalRule(),

    // ==============================
    // # 更多 LinkCard 类型
    // ==============================
    heading('h2', text('更多 LinkCard 类型')),

    heading('h3', text('Arxiv 论文')),
    linkCard('https://arxiv.org/abs/2309.16889', 'Arxiv Paper') as any,

    heading('h3', text('Bangumi 番剧')),
    linkCard('https://bgm.tv/subject/424883', 'Bangumi Subject') as any,

    heading('h3', text('LeetCode 题目')),
    linkCard('https://leetcode.cn/problems/two-sum', 'Two Sum - LeetCode') as any,

    heading('h3', text('网易云音乐')),
    linkCard('https://music.163.com/#/song?id=1901371647', '网易云音乐') as any,

    heading('h3', text('QQ 音乐')),
    linkCard('https://y.qq.com/n/ryqq/songDetail/003aAYrm3GE0Ac', 'QQ 音乐') as any,

    heading('h3', text('Bilibili 视频')),
    linkCard('https://www.bilibili.com/video/BV1GJ411x7h7', 'Bilibili 视频') as any,

    heading('h3', text('TMDB 影视')),
    linkCard('https://www.themoviedb.org/movie/550-fight-club', 'Fight Club - TMDB') as any,

    horizontalRule(),

    // ==============================
    // # @ 提及
    // ==============================
    heading('h2', text('@ 提及')),
    paragraph(mention('GH', 'Innei', 'Innei') as any),
    paragraph(mention('TG', '52Lxcloud', '52Lxcloud') as any),
    paragraph(text('支持的平台：')),
    list(
      'bullet',
      listItem(paragraph(text('GitHub: '), text('{GH@用户名}', FORMAT_CODE))),
      listItem(paragraph(text('Twitter: '), text('{TW@用户名}', FORMAT_CODE))),
      listItem(paragraph(text('Telegram: '), text('{TG@用户名}', FORMAT_CODE))),
    ),

    horizontalRule(),

    // ==============================
    // # GitHub 风格 Alerts
    // ==============================
    heading('h2', text('GitHub 风格 Alerts')),

    alertQuote(
      'note',
      paragraph(text('这是一条提示信息，用户在浏览内容时应该了解的有用信息。')),
    ) as any,

    alertQuote('tip', paragraph(text('这是一条小技巧，帮助用户更好或更轻松地完成任务。'))) as any,

    alertQuote('important', paragraph(text('这是重要信息，用户需要了解才能实现目标。'))) as any,

    alertQuote('warning', paragraph(text('这是警告信息，需要用户立即注意以避免问题。'))) as any,

    alertQuote(
      'caution',
      paragraph(text('这是危险提示，告知用户某些操作的风险或负面后果。')),
    ) as any,

    horizontalRule(),

    // ==============================
    // # Container 容器语法
    // ==============================
    heading('h2', text('Container 容器语法')),

    heading('h3', text('Banner 提示框')),
    banner(
      'info',
      paragraph(text('这是一条信息提示，使用 '), text('info', FORMAT_CODE), text(' 类型。')),
    ) as any,
    banner('success', paragraph(text('操作成功！这是一条成功提示。'))) as any,
    banner('warning', paragraph(text('请注意！这是一条警告提示。'))) as any,
    banner('error', paragraph(text('出错了！这是一条错误提示。'))) as any,
    alertQuote('note', paragraph(text('这是一条笔记/备注信息。'))) as any,

    heading('h3', text('自定义 Banner')),
    banner(
      'warning',
      paragraph(
        text('这是使用 banner 语法的警告框，支持 '),
        text('Markdown', FORMAT_BOLD),
        text(' 格式。'),
      ),
    ) as any,
    banner('success', paragraph(text('恭喜你完成了所有步骤！'))) as any,

    horizontalRule(),

    // ==============================
    // # 图片画廊
    // ==============================
    heading('h2', text('图片画廊')),
    gallery([
      {
        src: `${IMG_BASE}/9bc5ff3c-4dfd-4023-90ca-bb8983e99b0f.jpg`,
        width: 1200,
        height: 800,
        thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
      },
      {
        src: `${IMG_BASE}/59330e47-7605-473a-973b-3343b8179302.jpg`,
        width: 1200,
        height: 800,
        thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
      },
      {
        src: `${IMG_BASE}/cd17eb14-bfad-4b52-9a1c-586738acc0c5.jpg`,
        width: 1200,
        height: 800,
        thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
      },
    ]) as any,

    horizontalRule(),

    // ==============================
    // # Grid 网格布局
    // ==============================
    heading('h2', text('Grid 网格布局')),

    heading('h3', text('普通网格')),
    grid(
      3,
      8,
      paragraph(text('卡片一', FORMAT_BOLD), lineBreak() as any, text('这是第一个网格项')),
      paragraph(text('卡片二', FORMAT_BOLD), lineBreak() as any, text('这是第二个网格项')),
      paragraph(text('卡片三', FORMAT_BOLD), lineBreak() as any, text('这是第三个网格项')),
    ) as any,

    heading('h3', text('图片网格')),
    gallery(
      [
        {
          src: `${IMG_BASE}/2567d100-a7c8-43f1-b1b7-5c32d655ccd3.jpg`,
          width: 1200,
          height: 800,
          thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
        },
        {
          src: `${IMG_BASE}/cd17eb14-bfad-4b52-9a1c-586738acc0c5.jpg`,
          width: 1200,
          height: 800,
          thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
        },
        {
          src: `${IMG_BASE}/9bc5ff3c-4dfd-4023-90ca-bb8983e99b0f.jpg`,
          width: 1200,
          height: 800,
          thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
        },
        {
          src: `${IMG_BASE}/9761a552-1e29-41ed-8826-5f5e264b4d56.jpg`,
          width: 1200,
          height: 800,
          thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
        },
      ],
      'grid',
    ) as any,

    heading('h3', text('3x3 图片网格')),
    gallery(
      [
        {
          src: `${IMG_BASE}/ea74bf29-a000-49d9-9f04-49383eaf0a7c.jpeg`,
          width: 1200,
          height: 800,
          thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
        },
        {
          src: `${IMG_BASE}/51a974ab-1d20-4d79-8948-89ecbde2afcd.jpg`,
          width: 1200,
          height: 800,
          thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
        },
        {
          src: `${IMG_BASE}/41a3e56f-97f1-4df4-bddd-4501ce3b8fed.jpg`,
          width: 1200,
          height: 800,
          thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
        },
        {
          src: `${IMG_BASE}/93bbcff0-ebe3-43e9-91d2-3c305df68599.jpg`,
          width: 1200,
          height: 800,
          thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
        },
        {
          src: `${IMG_BASE}/59330e47-7605-473a-973b-3343b8179302.jpg`,
          width: 1200,
          height: 800,
          thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
        },
        {
          src: `${IMG_BASE}/cd17eb14-bfad-4b52-9a1c-586738acc0c5.jpg`,
          width: 1200,
          height: 800,
          thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
        },
        {
          src: `${IMG_BASE}/22213165-6445-4d76-9238-3a61a5378d9a.jpg`,
          width: 1200,
          height: 800,
          thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
        },
        {
          src: `${IMG_BASE}/2567d100-a7c8-43f1-b1b7-5c32d655ccd3.jpg`,
          width: 1200,
          height: 800,
          thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
        },
        {
          src: `${IMG_BASE}/9bc5ff3c-4dfd-4023-90ca-bb8983e99b0f.jpg`,
          width: 1200,
          height: 800,
          thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
        },
      ],
      'grid',
    ) as any,

    horizontalRule(),

    // ==============================
    // # Masonry 瀑布流
    // ==============================
    heading('h2', text('Masonry 瀑布流')),
    gallery(
      [
        {
          src: `${IMG_BASE}/51a974ab-1d20-4d79-8948-89ecbde2afcd.jpg`,
          width: 1200,
          height: 800,
          thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
        },
        {
          src: `${IMG_BASE}/9bc5ff3c-4dfd-4023-90ca-bb8983e99b0f.jpg`,
          width: 1200,
          height: 800,
          thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
        },
        {
          src: `${IMG_BASE}/9761a552-1e29-41ed-8826-5f5e264b4d56.jpg`,
          width: 1200,
          height: 800,
          thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
        },
        {
          src: `${IMG_BASE}/b17c71b0-8a93-4b4f-a884-0a6d304058f3.jpg`,
          width: 1200,
          height: 800,
          thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
        },
        {
          src: `${IMG_BASE}/ea74bf29-a000-49d9-9f04-49383eaf0a7c.jpeg`,
          width: 1200,
          height: 800,
          thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
        },
        {
          src: `${IMG_BASE}/93bbcff0-ebe3-43e9-91d2-3c305df68599.jpg`,
          width: 1200,
          height: 800,
          thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
        },
      ],
      'masonry',
    ) as any,

    horizontalRule(),

    // ==============================
    // # 折叠内容 (Details)
    // ==============================
    heading('h2', text('折叠内容 (Details)')),

    details(
      '点击展开查看更多内容',
      paragraph(text('这里是被折叠的内容。')),
      paragraph(text('可以包含任何 Markdown 格式：')),
      list('bullet', listItem(paragraph(text('列表项 1'))), listItem(paragraph(text('列表项 2')))),
      codeBlock('javascript', "console.log('折叠内容中的代码');") as any,
    ) as any,

    details(
      '另一个折叠块',
      table(
        tableRow(
          tableCell(1, paragraph(text('表头1'))),
          tableCell(1, paragraph(text('表头2'))),
        ) as any,
        tableRow(
          tableCell(0, paragraph(text('内容1'))),
          tableCell(0, paragraph(text('内容2'))),
        ) as any,
      ) as any,
    ) as any,

    horizontalRule(),

    // ==============================
    // # 视频嵌入
    // ==============================
    heading('h2', text('视频嵌入')),
    video('https://xcimg.szwego.com/pvod/f71fe4b2/124790f5-c9f8-4123-a94e-a5ea7034fc26.mp4') as any,

    horizontalRule(),

    // ==============================
    // # Mermaid 图表
    // ==============================
    heading('h2', text('Mermaid 图表')),
    {
      type: 'mermaid',
      diagram: `graph TD
    A[开始] --> B{判断条件}
    B -->|是| C[执行操作A]
    B -->|否| D[执行操作B]
    C --> E[结束]
    D --> E`,
      version: 1,
    } as any,

    {
      type: 'mermaid',
      diagram: `sequenceDiagram
    participant 用户
    participant 前端
    participant 后端
    participant 数据库

    用户->>前端: 发起请求
    前端->>后端: API 调用
    后端->>数据库: 查询数据
    数据库-->>后端: 返回结果
    后端-->>前端: JSON 响应
    前端-->>用户: 渲染页面`,
      version: 1,
    } as any,

    {
      type: 'mermaid',
      diagram: `pie title 技术栈占比
    "React" : 40
    "TypeScript" : 30
    "Tailwind CSS" : 20
    "其他" : 10`,
      version: 1,
    } as any,

    {
      type: 'mermaid',
      diagram: `gantt
    title 项目进度
    dateFormat  YYYY-MM-DD
    section 设计
    需求分析     :a1, 2024-01-01, 7d
    UI设计       :after a1, 5d
    section 开发
    前端开发     :2024-01-13, 14d
    后端开发     :2024-01-13, 14d
    section 测试
    测试         :2024-01-27, 7d`,
      version: 1,
    } as any,

    horizontalRule(),

    // ==============================
    // # 脚注
    // ==============================
    heading('h2', text('脚注')),
    paragraph(
      text('这是一段带有脚注的文本'),
      footnote('1') as any,
      text('，还有另一个脚注'),
      footnote('2') as any,
      text('。'),
    ),
    {
      type: 'footnote-section',
      definitions: {
        '1': '这是第一个脚注的内容，包含一些详细说明。',
        '2': '第二个脚注引用了相关资料和参考链接。',
      },
      version: 1,
    } as any,

    horizontalRule(),

    // ==============================
    // # HTML 标签支持
    // ==============================
    heading('h2', text('HTML 标签支持')),
    paragraph(text('Ctrl', FORMAT_CODE), text(' + '), text('C', FORMAT_CODE), text(' 复制')),
    paragraph(text('Ctrl', FORMAT_CODE), text(' + '), text('V', FORMAT_CODE), text(' 粘贴')),
    paragraph(text('这是使用 HTML mark 标签的高亮', FORMAT_HIGHLIGHT)),
    paragraph(text('HTML', FORMAT_CODE), text(' 是一种标记语言。')),
    paragraph(text('这是插入的文本', FORMAT_UNDERLINE)),
    paragraph(text('这是删除的文本', FORMAT_STRIKETHROUGH)),
    paragraph(text('这是小号文本')),
    paragraph(
      text('上标文本', FORMAT_SUPERSCRIPT),
      text(' 和 '),
      text('下标文本', FORMAT_SUBSCRIPT),
    ),

    horizontalRule(),

    // ==============================
    // # Tag 标签
    // ==============================
    heading('h2', text('Tag 标签')),
    paragraph(
      text('标签1', FORMAT_CODE),
      text(' '),
      text('标签2', FORMAT_CODE),
      text(' '),
      text('React', FORMAT_CODE),
      text(' '),
      text('TypeScript', FORMAT_CODE),
    ),

    horizontalRule(),

    // ==============================
    // # 特殊字符转义
    // ==============================
    heading('h2', text('特殊字符转义')),
    paragraph(text('*这不是斜体*')),
    paragraph(text('`这不是代码`')),
    paragraph(text('[这不是链接](url)')),

    horizontalRule(),

    // ==============================
    // # 总结
    // ==============================
    heading('h2', text('总结')),
    paragraph(text('以上就是 Shiroi 博客系统支持的所有 Markdown 渲染功能测试。包括：')),
    list(
      'number',
      listItem(paragraph(text('基础 Markdown 语法（标题、粗体、斜体、删除线）'))),
      listItem(paragraph(text('GFM 扩展（表格、任务列表）'))),
      listItem(paragraph(text('代码高亮（Shiki 引擎，支持多种语言）'))),
      listItem(paragraph(text('数学公式（KaTeX，行内和块级）'))),
      listItem(paragraph(text('图片与画廊（Gallery、Grid、Masonry）'))),
      listItem(paragraph(text('富链接卡片自动解析：'))),
      indentedListItem(1, 'GitHub 仓库/Commit/PR/文件预览') as any,
      indentedListItem(2, 'Twitter/X 推文嵌入') as any,
      indentedListItem(3, 'YouTube 视频嵌入') as any,
      indentedListItem(4, 'GitHub Gist 嵌入') as any,
      indentedListItem(5, 'CodeSandbox 嵌入') as any,
      indentedListItem(6, 'Bilibili 视频嵌入') as any,
      indentedListItem(7, 'Arxiv 论文') as any,
      indentedListItem(8, 'Bangumi 番剧') as any,
      indentedListItem(9, 'LeetCode 题目') as any,
      indentedListItem(10, '网易云/QQ 音乐') as any,
      indentedListItem(11, 'TMDB 影视') as any,
      indentedListItem(12, '站内文章') as any,
      listItem(paragraph(text('LinkCard 组件（手动指定类型）'))),
      listItem(paragraph(text('Container 容器（Banner、Grid、Gallery、Masonry）'))),
      listItem(paragraph(text('折叠内容（Details）'))),
      listItem(paragraph(text('Mermaid 图表（流程图、时序图、饼图、甘特图）'))),
      listItem(paragraph(text('Excalidraw 手绘图'))),
      listItem(paragraph(text('远程 React 组件嵌入'))),
      listItem(paragraph(text('GitHub 风格 Alerts（NOTE、TIP、IMPORTANT、WARNING、CAUTION）'))),
      listItem(paragraph(text('@ 提及（GitHub/Twitter/Telegram）'))),
      listItem(paragraph(text('剧透文本（||spoiler||）'))),
      listItem(paragraph(text('高亮标记（==mark==）'))),
      listItem(paragraph(text('插入文本（++insert++）'))),
      listItem(paragraph(text('脚注'))),
      listItem(paragraph(text('视频嵌入'))),
      listItem(paragraph(text('HTML 标签支持（kbd、sup、sub、mark、abbr 等）'))),
      listItem(paragraph(text('Tag 标签组件'))),
    ),

    horizontalRule(),
    paragraph(text('最后更新：2026-01-11', FORMAT_ITALIC)),
  ) as SerializedEditorState,
};
