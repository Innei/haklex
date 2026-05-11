import { composeRenderer } from '@haklex/rich-compose';
import { allRendererModules } from '@haklex/rich-compose/renderer';

export const LexicalRenderer = composeRenderer({ modules: allRendererModules });
