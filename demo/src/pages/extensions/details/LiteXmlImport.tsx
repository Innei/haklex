import { AgentDiffEditNode } from '@haklex/rich-ext-ai-agent';
import {
  type NestedDocDialogEditorProps,
  NestedDocDialogEditorProvider,
  NestedDocPlugin,
} from '@haklex/rich-ext-nested-doc';
import { ToolbarPlugin } from '@haklex/rich-plugin-toolbar';
import type { SerializedEditorState } from 'lexical';
import { useState } from 'react';

import { Panel } from '../../../components/Panel';
import { useTheme } from '../../../context/ThemeContext';
import { liteXmlPasteSample } from '../../../fixtures/litexml-paste-sample';
import { LexicalEditor } from '../../../lexical';

const liteXmlEditorExtraNodes = [AgentDiffEditNode];

const liteXmlInitialContent: SerializedEditorState = {
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  },
};

const liteXmlInsertItemOrder = [
  'Image',
  'Code Block',
  'Table',
  'Link Card',
  'Callout',
  'Banner',
  'Gallery',
  'Video',
  'Mermaid Diagram',
  'Code Snippet',
  'Embed',
  'Whiteboard',
  'Nested Document',
];

function LiteXmlNestedDocDialogEditor({ initialValue, onEditorReady }: NestedDocDialogEditorProps) {
  return (
    <LexicalEditor
      header={<ToolbarPlugin insertItemOrder={liteXmlInsertItemOrder} maxVisibleInsertItems={5} />}
      initialValue={initialValue}
      onEditorReady={onEditorReady}
    />
  );
}

export function LiteXmlImportDetail() {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);

  return (
    <NestedDocDialogEditorProvider value={LiteXmlNestedDocDialogEditor}>
      <div className="biz-grid">
        <Panel
          badge="xml"
          title="Markdown Flavor LiteXML"
          headerExtra={
            <button
              className="btn btn-sm"
              onClick={() => {
                void navigator.clipboard.writeText(liteXmlPasteSample).then(() => {
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1200);
                });
              }}
            >
              {copied ? 'Copied' : 'Copy XML'}
            </button>
          }
        >
          <textarea
            readOnly
            className="import-textarea litexml-sample-textarea"
            rows={22}
            value={liteXmlPasteSample}
          />
        </Panel>

        <Panel badge="editor" bodyStyle={{ padding: 0 }} title="Paste Target">
          <LexicalEditor
            extraNodes={liteXmlEditorExtraNodes}
            initialValue={liteXmlInitialContent}
            placeholder="Paste XML plain text here..."
            theme={theme}
            variant="article"
            header={
              <ToolbarPlugin insertItemOrder={liteXmlInsertItemOrder} maxVisibleInsertItems={5} />
            }
          >
            <NestedDocPlugin />
          </LexicalEditor>
        </Panel>
      </div>
    </NestedDocDialogEditorProvider>
  );
}
