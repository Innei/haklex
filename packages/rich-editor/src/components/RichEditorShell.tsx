import { QuoteAttributionPlugin } from '@haklex/rich-editor-ui';
import { PortalThemeProvider } from '@haklex/rich-style-token';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import type {
  Klass,
  LexicalEditor,
  LexicalNode,
  LexicalNodeReplacement,
  SerializedEditorState,
} from 'lexical';
import { type ReactNode, useMemo } from 'react';

import type { ColorScheme } from '../context/ColorSchemeContext';
import { ColorSchemeProvider } from '../context/ColorSchemeContext';
import {
  ActiveEditorScope,
  EditorSurfacePlugins,
  EditorSurfaceProvider,
} from '../context/EditorSurfaceContext';
import { RendererConfigProvider } from '../context/RendererConfigContext';
import { TextSelectionStoreProvider } from '../context/TextSelectionContext';
import { setResolvedEditNodes } from '../node-registry';
import { EditorRefPlugin } from '../plugins/EditorRefPlugin';
import { FootnotePlugin } from '../plugins/FootnotePlugin';
import { OnChangePlugin } from '../plugins/OnChangePlugin';
import { SubmitShortcutPlugin } from '../plugins/SubmitShortcutPlugin';
import { editorTheme } from '../styles/theme';
import type { RichEditorVariant } from '../types';
import type { RendererConfig } from '../types/renderer-config';
import { normalizeSerializedEditorState } from '../utils/normalizeSerializedEditorState';
import type { EditorVirtualization } from '../virtualization/types';
import { EditorSurfaceHost } from './EditorSurfaceHost';
import { clsx, getVariantClass } from './utils';
import { VirtualizationFromProps } from './VirtualizationFromProps';

export interface RichEditorShellProps {
  actions?: ReactNode;
  autoFocus?: boolean;
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
  debounceMs?: number;
  header?: ReactNode;
  initialValue?: SerializedEditorState;
  nodes: Array<Klass<LexicalNode> | LexicalNodeReplacement>;
  onChange?: (value: SerializedEditorState) => void;
  onEditorReady?: (editor: LexicalEditor | null) => void;
  onSubmit?: () => void;
  placeholder?: string;
  rendererConfig?: RendererConfig;
  style?: React.CSSProperties;
  theme?: ColorScheme;
  variant?: RichEditorVariant;
  virtualization?: EditorVirtualization;
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
  virtualization,
}: RichEditorShellProps) {
  setResolvedEditNodes(nodes);
  const normalizedInitialValue = useMemo(
    () => (initialValue ? normalizeSerializedEditorState(initialValue) : undefined),
    [initialValue],
  );
  const initialConfig = {
    namespace: 'RichEditor',
    theme: editorTheme,
    nodes,
    editable: true,
    onError: (error: Error) => {
      console.error('[RichEditor]', error);
    },
    ...(normalizedInitialValue ? { editorState: JSON.stringify(normalizedInitialValue) } : {}),
  };

  const variantClass = getVariantClass(variant);

  return (
    <PortalThemeProvider className={variantClass} theme={theme}>
      <ColorSchemeProvider colorScheme={theme}>
        <RendererConfigProvider config={rendererConfig} mode="editor" variant={variant}>
          <LexicalComposer initialConfig={initialConfig}>
            <EditorSurfaceProvider>
              <VirtualizationFromProps value={virtualization} />
              <TextSelectionStoreProvider>
                <FootnotePlugin>
                  <div
                    suppressHydrationWarning
                    className={clsx('rich-editor', variantClass, className)}
                    data-theme={theme}
                    style={{ ...style, maxWidth: 'none' }}
                  >
                    <ActiveEditorScope>{header}</ActiveEditorScope>
                    <EditorSurfaceHost
                      autoFocus={autoFocus}
                      className={contentClassName}
                      hasHeader={!!header}
                      placeholder={placeholder}
                    />
                    <HistoryPlugin />
                    <OnChangePlugin debounceMs={debounceMs} onChange={onChange} />
                    <SubmitShortcutPlugin onSubmit={onSubmit} />
                    <EditorRefPlugin onEditorReady={onEditorReady} />
                    <EditorSurfacePlugins>
                      <QuoteAttributionPlugin />
                    </EditorSurfacePlugins>
                    {children}
                    {actions && (
                      <div className="rich-editor__actions">
                        <ActiveEditorScope>{actions}</ActiveEditorScope>
                      </div>
                    )}
                  </div>
                </FootnotePlugin>
              </TextSelectionStoreProvider>
            </EditorSurfaceProvider>
          </LexicalComposer>
        </RendererConfigProvider>
      </ColorSchemeProvider>
    </PortalThemeProvider>
  );
}
