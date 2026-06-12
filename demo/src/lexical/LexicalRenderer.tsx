import { composeRenderer } from '@haklex/rich-compose';
import {
  allRendererModules,
  dynamicModule,
  excalidrawModule,
  galleryModule,
  imageModule,
  nestedDocModule,
} from '@haklex/rich-compose/renderer';
import { presentDialog } from '@haklex/rich-editor-ui';
import {
  ExcalidrawExpandShell,
  excalidrawFullscreenPopup,
} from '@haklex/rich-ext-excalidraw/static';

import { isAllowedDynamicUrl } from '../fixtures/dynamic-catalog';
import { onImageClick } from '../lightbox/lightbox-store';
import * as dialogCss from './nested-doc-dialog.css';

const modules = allRendererModules.map((module) => {
  if (module === dynamicModule) {
    return dynamicModule.setup({ validateUrl: isAllowedDynamicUrl });
  }
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
  if (module === excalidrawModule) {
    return excalidrawModule.setup({
      onExpand: ({ content, theme }) => {
        presentDialog({
          content: ({ dismiss }) => (
            <ExcalidrawExpandShell dismiss={dismiss}>{content}</ExcalidrawExpandShell>
          ),
          className: excalidrawFullscreenPopup,
          theme,
          showCloseButton: false,
          clickOutsideToDismiss: true,
        });
      },
    });
  }
  return module;
});

export const LexicalRenderer = composeRenderer({ modules });
