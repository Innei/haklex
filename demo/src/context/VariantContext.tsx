import type { RichEditorVariant } from '@haklex/rich-editor';
import { createContext, type Dispatch, type SetStateAction } from 'react';

export const VariantContext = createContext<RichEditorVariant>('article');
export const SetVariantContext = createContext<Dispatch<SetStateAction<RichEditorVariant>>>(
  () => {},
);
