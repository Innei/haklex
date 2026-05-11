import '@haklex/rich-renderer-mention/style.css';

import { MentionEditRenderer } from '@haklex/rich-renderer-mention';

import type { RichEditorModule } from '../../core/types';
import { mentionModule } from './module';

export const mentionEditModule: RichEditorModule = {
  ...mentionModule,
  editRenderers: { Mention: MentionEditRenderer },
};
