import { composeRenderer } from '@haklex/rich-compose';
import { allRendererModules, galleryModule, imageModule } from '@haklex/rich-compose/renderer';

import { onImageClick } from '../lightbox/lightbox-store';

const modules = allRendererModules.map((module) => {
  if (module === imageModule) return imageModule.setup({ onImageClick });
  if (module === galleryModule) return galleryModule.setup({ onImageClick });
  return module;
});

export const LexicalRenderer = composeRenderer({ modules });
