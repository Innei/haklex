import type { Klass, LexicalEditor, LexicalNode, SerializedEditorState } from 'lexical';
import type { ReactNode } from 'react';

import type { ColorScheme } from './context/ColorSchemeContext';
import type { RendererConfig } from './types/renderer-config';

export type RichEditorVariant = 'article' | 'comment' | 'note';

export interface RichEditorProps {
  actions?: ReactNode;
  autoFocus?: boolean;
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
  debounceMs?: number;
  extraNodes?: Array<Klass<LexicalNode>>;
  fileUpload?: (
    file: File,
    opts?: { onProgress?: (percent: number) => void },
  ) => Promise<{ src: string }>;
  header?: ReactNode;
  imageUpload?: (file: File) => Promise<{
    src: string;
    altText?: string;
    width?: number;
    height?: number;
    thumbhash?: string;
  }>;
  initialValue?: SerializedEditorState;
  onChange?: (value: SerializedEditorState) => void;
  onEditorReady?: (editor: LexicalEditor | null) => void;
  onSubmit?: () => void;
  placeholder?: string;
  rendererConfig?: RendererConfig;
  style?: React.CSSProperties;
  theme?: ColorScheme;
  variant?: RichEditorVariant;
  videoUpload?: (
    file: File,
    opts?: { onProgress?: (percent: number) => void },
  ) => Promise<{ src: string }>;
}
