import '@haklex/rich-renderer-linkcard/style.css';

import { linkCardEditNodes, PasteLinkCardPlugin } from '@haklex/rich-renderer-linkcard';

import type { RichEditorModule } from '../../core/types';
import { linkCardModule } from './module';

export const linkCardEditModule: RichEditorModule = {
  ...linkCardModule,
  editNodes: linkCardEditNodes,
  plugins: <PasteLinkCardPlugin />,
};
