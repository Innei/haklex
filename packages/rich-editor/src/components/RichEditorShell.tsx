import { PortalThemeProvider } from '@haklex/rich-style-token';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import type { Klass, LexicalEditor, LexicalNode, SerializedEditorState } from 'lexical';
import type { ReactNode } from 'react';

import type { ColorScheme } from '../context/ColorSchemeContext';
import { ColorSchemeProvider } from '../context/ColorSchemeContext';
import { RendererConfigProvider } from '../context/RendererConfigContext';
import { TextSelectionStoreProvider } from '../context/TextSelectionContext';
import { setResolvedEditNodes } from '../node-registry';
import { AutoFocusPlugin } from '../plugins/AutoFocusPlugin';
import { EditorRefPlugin } from '../plugins/EditorRefPlugin';
import { FootnotePlugin } from '../plugins/FootnotePlugin';
import { OnChangePlugin } from '../plugins/OnChangePlugin';
import { SubmitShortcutPlugin } from '../plugins/SubmitShortcutPlugin';
import { editorTheme } from '../styles/theme';
import type { RichEditorVariant } from '../types';
import type { RendererConfig } from '../types/renderer-config';
import { ContentEditable } from './ContentEditable';
import { clsx, getVariantClass } from './utils';

export interface RichEditorShellProps {
  actions?: ReactNode;
  autoFocus?: boolean;
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
  debounceMs?: number;
  header?: ReactNode;
  initialValue?: SerializedEditorState;
  nodes: Array<Klass<LexicalNode>>;
  onChange?: (value: SerializedEditorState) => void;
  onEditorReady?: (editor: LexicalEditor | null) => void;
  onSubmit?: () => void;
  placeholder?: string;
  rendererConfig?: RendererConfig;
  style?: React.CSSProperties;
  theme?: ColorScheme;
  variant?: RichEditorVariant;
}

export function RichEditorShell({
  nodes,
  initialValue,
  onChange,
  variant = 'article',
  theme = 'light',
  placeholder = 'Write something...',
  onSubmit,
  autoFocus = false,
  className,
  contentClassName,
  style,
  actions,
  header,
  onEditorReady,
  rendererConfig,
  debounceMs,
  children,
}: RichEditorShellProps) {
  setResolvedEditNodes(nodes);
  const initialConfig = {
    namespace: 'RichEditor',
    theme: editorTheme,
    nodes,
    editable: true,
    onError: (error: Error) => {
      console.error('[RichEditor]', error);
    },
    ...(initialValue ? { editorState: JSON.stringify(initialValue) } : {}),
  };

  const variantClass = getVariantClass(variant);

  return (
    <PortalThemeProvider className={variantClass} theme={theme}>
      <ColorSchemeProvider colorScheme={theme}>
        <RendererConfigProvider config={rendererConfig} mode="editor" variant={variant}>
          <LexicalComposer initialConfig={initialConfig}>
            <TextSelectionStoreProvider>
              <FootnotePlugin>
                <div
                  suppressHydrationWarning
                  className={clsx('rich-editor', variantClass, className)}
                  data-theme={theme}
                  style={{ ...style, maxWidth: 'none' }}
                >
                  {header}
                  <RichTextPlugin
                    ErrorBoundary={LexicalErrorBoundary}
                    contentEditable={
                      <ContentEditable
                        className={contentClassName}
                        hasHeader={!!header}
                        placeholder={placeholder}
                      />
                    }
                  />
                  <HistoryPlugin />
                  <OnChangePlugin debounceMs={debounceMs} onChange={onChange} />
                  <SubmitShortcutPlugin onSubmit={onSubmit} />
                  <EditorRefPlugin onEditorReady={onEditorReady} />
                  {autoFocus && <AutoFocusPlugin />}
                  {children}
                  {actions && <div className="rich-editor__actions">{actions}</div>}
                </div>
              </FootnotePlugin>
            </TextSelectionStoreProvider>
          </LexicalComposer>
        </RendererConfigProvider>
      </ColorSchemeProvider>
    </PortalThemeProvider>
  );
}
