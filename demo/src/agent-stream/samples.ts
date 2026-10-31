import type { SerializedEditorState } from 'lexical';

const text = (value: string) => ({
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text: value,
  type: 'text',
  version: 1,
});

const block = (type: 'paragraph' | 'heading', value: string, tag?: string) => ({
  children: [text(value)],
  direction: 'ltr',
  format: '',
  indent: 0,
  type,
  version: 1,
  ...(tag ? { tag } : { textFormat: 0, textStyle: '' }),
});

export const INITIAL_STATE = {
  root: {
    children: [
      block('heading', '让 agent 写作看起来像在打字', 'h1'),
      block(
        'paragraph',
        '右侧的按钮会模拟一次 agent 写入：数据一次性进入编辑器，AgentStreamPlugin 再把新内容逐字放出来。',
      ),
      block(
        'paragraph',
        '数据和显示分开以后，CRDT 历史里每次编辑只有一条记录，保存和导出拿到的永远是最终内容。',
      ),
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
} as unknown as SerializedEditorState;

export const REWRITE =
  '数据和显示分开以后，CRDT 历史里每次编辑只有一条记录；动画只是本地的视觉效果，打断它不会丢任何内容。';

export const AGENT_PARAGRAPHS = [
  '过去的做法是把一次编辑切成上百个小 update 依次推送，看的人收到的是一串碎片，历史记录也被这些碎片填满。',
  '现在 editor 收到带 agent 标记的写入后，先算出这次新增或改动了哪些文字，再用 CSS Highlight 把还没轮到的部分隐藏起来，按固定速度一点点露出。',
  '图片、代码块、表格这类 block 不做逐字动画，按文档顺序轮到它时直接出现。',
  '图片之后的段落继续逐字显示。单次播放被限制在几秒以内，超出的部分自动加速。',
  '第一次快速写入：短句。',
  '第二次快速写入：排在上一段后面依次播放。',
  '第三次快速写入：积压超过六秒时，之前没播完的部分直接显示完。',
];
