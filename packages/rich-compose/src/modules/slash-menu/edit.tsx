import { SlashMenuPlugin } from '@haklex/rich-plugin-slash-menu';

import type { RichEditorModule } from '../../core/types';

export const slashMenuEditModule: RichEditorModule = {
  name: 'slash-menu',
  nestedEditorPlugins: <SlashMenuPlugin nested />,
};
