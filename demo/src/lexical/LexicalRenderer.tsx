import { composeRenderer } from '@haklex/rich-compose';
import { dynamicModule } from '@haklex/rich-compose/modules/dynamic';
import {
  allRendererModules,
  galleryModule,
  imageModule,
  nestedDocModule,
  whiteboardModule,
} from '@haklex/rich-compose/renderer';
import { presentDialog } from '@haklex/rich-editor-ui';
import {
  WhiteboardExpandShell,
  whiteboardFullscreenPopup,
} from '@haklex/rich-ext-whiteboard/static';

import { isAllowedDynamicUrl } from '../fixtures/dynamic-catalog';
import { onImageClick } from '../lightbox/lightbox-store';
import * as dialogCss from './nested-doc-dialog.css';

const modules = allRendererModules.map((module) => {
  if (module === imageModule) return imageModule.setup({ onImageClick });
  if (module === galleryModule) return galleryModule.setup({ onImageClick });
  if (module === nestedDocModule) {
    return nestedDocModule.setup({
      onExpand: ({ title, content }) => {
        presentDialog({
          title: title || undefined,
          content: () => <div className={dialogCss.dialogBody}>{content}</div>,
          className: dialogCss.dialogPopup,
          showCloseButton: true,
          clickOutsideToDismiss: true,
          sheet: 'auto',
        });
      },
    });
  }
  if (module === whiteboardModule) {
    return whiteboardModule.setup({
      onExpand: ({ content, elementCount, theme }) => {
        presentDialog({
          content: ({ dismiss }) => (
            <WhiteboardExpandShell
              dismiss={dismiss}
              meta={elementCount === undefined ? undefined : `${elementCount} elements`}
            >
              {content}
            </WhiteboardExpandShell>
          ),
          className: whiteboardFullscreenPopup,
          theme,
          showCloseButton: false,
          clickOutsideToDismiss: true,
        });
      },
    });
  }
  return module;
});

export const LexicalRenderer = composeRenderer({
  modules: [...modules, dynamicModule.setup({ validateUrl: isAllowedDynamicUrl })],
});
