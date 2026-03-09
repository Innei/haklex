import type { SerializedEditorState } from 'lexical';

import inneiAboutData from './innei-about-data';
import type { Preset } from './presets';

export const inneiAboutPreset: Preset = {
  key: 'innei-about',
  label: 'Innei 关于页',
  description: '个人介绍页面的富文本示例，展示 details、spoiler、highlight、表格等',
  data: inneiAboutData as SerializedEditorState,
};
