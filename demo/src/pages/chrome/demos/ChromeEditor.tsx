import { composeEditor } from '@haklex/rich-compose';
import { allEditorModules } from '@haklex/rich-compose/editor';
import type { SerializedEditorState } from 'lexical';
import type { ReactNode } from 'react';

import type { FrameTheme } from '../../../site/tokens';

const Composed = composeEditor({ modules: allEditorModules });

interface ChromeEditorProps {
  actions?: ReactNode;
  children?: ReactNode;
  gutter?: boolean;
  header?: ReactNode;
  hint: string;
  initialValue: SerializedEditorState;
  theme: FrameTheme;
}

export function ChromeEditor({
  actions,
  children,
  gutter = false,
  header,
  hint,
  initialValue,
  theme,
}: ChromeEditorProps) {
  return (
    <div className={gutter ? 'chrome-editor chrome-editor-gutter' : 'chrome-editor'}>
      <Composed
        actions={actions}
        header={header}
        initialValue={initialValue}
        theme={theme}
        variant="article"
      >
        {children}
      </Composed>
      <p className="chrome-hint">{hint}</p>
    </div>
  );
}
