import type { SerializedEditorState } from 'lexical';

import {
  details,
  doc,
  FORMAT_BOLD,
  FORMAT_CODE,
  FORMAT_HIGHLIGHT,
  FORMAT_ITALIC,
  FORMAT_STRIKETHROUGH,
  heading,
  image,
  link,
  list,
  listItem,
  paragraph,
  quote,
  spoiler,
  table,
  tableCell,
  tableRow,
  text,
} from './helpers';
import type { Preset } from './presets';

const CODE_STRIKE = FORMAT_CODE | FORMAT_STRIKETHROUGH;

const inneiAboutData: SerializedEditorState = doc(
  paragraph(text('远方的朋友，很高兴能在这里与你相遇。首先，我得给你打个招呼。嘿，你好吗。')),
  paragraph(
    text('我是 '),
    text('Innei', FORMAT_BOLD),
    text('。叫我 '),
    text('拾一', FORMAT_BOLD),
    text(' 就行了，那么接下来我就从以下几个方面聊聊自己。'),
  ),
  details(
    '人生就是不断地给自己贴上标签，或许我们并不需要这么多的标签。所以我把这些藏起来了。',
    false,
    heading('h3', text('社会地位')),
    paragraph(text('家里蹲废物')),
    heading('h3', text('性格属性')),
    paragraph(
      text('内向&社恐', FORMAT_HIGHLIGHT),
      text('，从小以来不擅长于他人交往，性格孤僻。因为从小与计算机结缘，特别热衷于计算机领域。'),
    ),
    paragraph(text('INFP-T', FORMAT_HIGHLIGHT), text('，MBTI16 人格中最敏感最内耗最废物。')),
    paragraph(
      text('专注者', FORMAT_HIGHLIGHT),
      text('，对于一件热衷的事物，往往会废寝忘食。近些天无非就是独立开发。'),
    ),
    paragraph(
      text('简洁主义者', FORMAT_HIGHLIGHT),
      text('，花里胡哨厌倦者，认为生活就应该简简单单。'),
    ),
    paragraph(
      text('其他标签', FORMAT_BOLD),
      text(' '),
      text('多愁善感', FORMAT_CODE),
      text(' '),
      text('也许是二次元？', CODE_STRIKE),
      text(' '),
      text('双重人格', FORMAT_CODE),
    ),
    heading('h3', text('兴趣爱好')),
    paragraph(
      text('纯音乐爱好者', FORMAT_HIGHLIGHT),
      text('，自 15 年入云村以来，迷上了以「Luv Letter」为首的纯音乐风格。喜欢的音乐人：'),
      link('https://music.163.com/#/artist?id=12079231', text('邱有句')),
      text('。'),
    ),
    paragraph(
      text('兴趣变淡的二次元废柴', FORMAT_HIGHLIGHT),
      text('，入宅作为「CLANNAD」。吹爆的番：「命运石之门」'),
    ),
    paragraph(
      text('开源爱好者', FORMAT_HIGHLIGHT),
      text('，曾给 '),
      link('https://github.com/bytebase/bytebase', text('bytebase')),
      text(', '),
      link('https://github.com/toeverything/blocksuite', text('blocksuite')),
      text(' 等做过贡献。'),
    ),
  ) as any,
  heading('h2', text('现状')),
  paragraph(
    text('AI 指挥师', FORMAT_HIGHLIGHT),
    text('（25.4-），员工：Claude Code, CodeX, GitHub Copilot, Cursor, ChatGPT'),
  ),
  paragraph(
    text('设计开发者', FORMAT_HIGHLIGHT),
    text('（24.6-），技术栈：React, Radix, Framer Motion'),
  ),
  paragraph(
    text('Node 全栈开发者', FORMAT_HIGHLIGHT),
    text('（19.4-），技术栈：Vue.js, React, NestJS, Fastify, MongoDB, prisma'),
  ),
  paragraph(text('梦想是成为 Design Engineer。')),
  image({
    src: 'https://ghchart.rshah.org/innei',
    altText: 'GitHub contribution chart',
  }) as any,
  heading('h2', text('名字由来')),
  details(
    'Innei',
    false,
    paragraph(
      spoiler(text('来源于罗马音，日文为')),
      text('陰影', FORMAT_BOLD),
      spoiler(text('，读作 /ɪnni/。')),
    ),
  ) as any,
  details(
    '拾一',
    false,
    paragraph(spoiler(text('拾起，未来。把握未来，抓住机会的涵义。来源于命运石之门：'))),
    quote(paragraph(text('「0」が過去で「1」が未来「今」は何処にもない'))),
  ) as any,
  details(
    '寻',
    false,
    paragraph(
      spoiler(text('来源于')),
      text('『千与千寻』', FORMAT_HIGHLIGHT),
      spoiler(text('，千寻被汤婆婆抹掉的单字「寻」。找到迷失的自我。')),
    ),
  ) as any,
  details(
    '亿夏',
    false,
    paragraph(
      spoiler(text('来源于')),
      text('『亿夏风铃』', FORMAT_HIGHLIGHT),
      spoiler(text('-- 邱有句，阿里花名。')),
    ),
  ) as any,
  heading('h2', text('域名')),
  paragraph(
    text('shizuri.net', FORMAT_STRIKETHROUGH),
    text('、来源日语「しずかなもり／静かな森」'),
  ),
  quote(
    paragraph(
      text(
        '人间浮躁，尘世喧嚣。不曾想过去桃花源与世界隔绝的人间圣地，只想拥有一片属于自己的宁境。',
        FORMAT_ITALIC,
      ),
    ),
  ),
  paragraph(
    text('innei.in', FORMAT_BOLD),
    text(' '),
    text('innei.ren', FORMAT_BOLD),
    text(' '),
    text('innei.dev', FORMAT_BOLD),
    text(' 私の名前、'),
    link('https://innei.in', text('https://innei.in')),
    text(' へ'),
  ),
  heading('h2', text('联系方式')),
  paragraph(
    link('https://github.com/innei', text('@Innei')),
    text(' · '),
    link('mailto:i@innei.ren', text('Send Mail')),
    text(' · SW-1006-1241-1745 · PSN innei-j'),
  ),
  heading('h2', text('设备')),
  heading('h3', text('智能手机')),
  list(
    'bullet',
    listItem(paragraph(text('iPhone 12'))),
    listItem(paragraph(text('iPhone 16'))),
    listItem(paragraph(text('iPhone 17'))),
    listItem(paragraph(text('iPhone SE 2020', FORMAT_STRIKETHROUGH), text(' (已出手)'))),
  ),
  heading('h3', text('笔记本电脑')),
  list(
    'bullet',
    listItem(paragraph(text('MacBook Air (2022)'))),
    listItem(paragraph(text("MacBook Pro 16' (2019)", FORMAT_STRIKETHROUGH), text(' (已出手)'))),
  ),
  heading('h2', text('栈')),
  paragraph(
    text('可理解语言', FORMAT_BOLD),
    text(' （'),
    text('?', FORMAT_CODE),
    text('了解，'),
    text('~', FORMAT_CODE),
    text('熟悉，'),
    text('+', FORMAT_CODE),
    text('掌握，'),
    text('++', FORMAT_CODE),
    text('熟练，'),
    text('*', FORMAT_CODE),
    text('精通）'),
  ),
  paragraph(
    text('HTML', FORMAT_BOLD),
    text(' '),
    text('CSS', FORMAT_BOLD),
    text(' '),
    text('JavaScript', FORMAT_BOLD),
    text(' '),
    text('TypeScript', FORMAT_BOLD),
    text(' '),
    text('Markdown', FORMAT_BOLD),
  ),
  paragraph(
    text('技术栈', FORMAT_BOLD),
    text('：React, NestJS, NextJS, Vue 3, Express, Fastify, MongoDB'),
  ),
  heading('h2', text('赞助我！')),
  paragraph(
    text(
      '感谢你能看到这里。如果我写的文章和所做的开源贡献对你有帮助，欢迎投食。',
      FORMAT_HIGHLIGHT,
    ),
  ),
  paragraph(
    link('https://afdian.com/@Innei', text('爱发电')),
    text(' · Polygon 主网：'),
    text('0x0CC14dD429303AEe55bfB56529B81D2a300362Ed', FORMAT_CODE),
  ),
  table(
    tableRow(
      tableCell(1, paragraph(text('微信赞赏'))),
      tableCell(1, paragraph(text('支付宝'))),
    ) as any,
    tableRow(
      tableCell(0, paragraph(text('[二维码占位]'))),
      tableCell(0, paragraph(text('[二维码占位]'))),
    ) as any,
  ),
  paragraph(
    text('推荐链接：'),
    link('https://railway.com?referralCode=1xNEFr', text('Railway Referrals')),
  ),
  quote(paragraph(text('我们会成为好朋友的，对吧'))),
);

export const inneiAboutPreset: Preset = {
  key: 'innei-about',
  label: 'Innei 关于页',
  description: '个人介绍页面的富文本示例，展示 details、spoiler、highlight、表格等',
  data: inneiAboutData,
};
