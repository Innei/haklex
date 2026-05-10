import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LexicalNestedComposer } from '@lexical/react/LexicalNestedComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import type { LexicalEditor } from 'lexical';
import {
  $createParagraphNode,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_HIGH,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ENTER_COMMAND,
} from 'lexical';
import { useCallback, useEffect } from 'react';

import type { AlertType } from '../../nodes/AlertQuoteNode';
import { $isAlertQuoteNode } from '../../nodes/AlertQuoteNode';
import { ALERT_NODE_KEY } from '../../types/renderer-keys';
import { AlertRenderer } from '../renderers/AlertRenderer';
import { RendererWrapper } from '../RendererWrapper';

function ExitBlockPlugin({
  parentEditor,
  nodeKey,
}: {
  parentEditor: LexicalEditor;
  nodeKey: string;
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const focusParent = () => {
      parentEditor.focus(() => {
        parentEditor.update(() => {
          const alertNode = $getNodeByKey(nodeKey);
          if (alertNode) {
            const next = alertNode.getNextSibling();
            if (next) {
              next.selectStart();
            }
          }
        });
      });
    };

    const exitAlert = (removeEmpty: boolean) => {
      const root = $getRoot();
      const lastChild = root.getLastChild();
      const shouldRemoveAlert = removeEmpty && root.getChildrenSize() <= 1;

      if (removeEmpty && lastChild) {
        lastChild.remove();
      }

      if (shouldRemoveAlert) {
        parentEditor.update(
          () => {
            const alertNode = $getNodeByKey(nodeKey);
            if (alertNode) {
              const paragraph = $createParagraphNode();
              alertNode.insertAfter(paragraph);
              alertNode.remove();
              paragraph.selectStart();
            }
          },
          { onUpdate: focusParent },
        );
      } else {
        parentEditor.update(
          () => {
            const alertNode = $getNodeByKey(nodeKey);
            if (alertNode) {
              let next = alertNode.getNextSibling();
              if (!next || !$isParagraphNode(next)) {
                next = $createParagraphNode();
                alertNode.insertAfter(next);
              }
              next.selectStart();
            }
          },
          { onUpdate: focusParent },
        );
      }
    };

    const isAtLastEmptyParagraph = () => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection) || !selection.isCollapsed()) return false;
      const anchorNode = selection.anchor.getNode();
      const topLevelElement = anchorNode.getTopLevelElement();
      return (
        topLevelElement &&
        $isParagraphNode(topLevelElement) &&
        topLevelElement.getTextContent() === '' &&
        topLevelElement.getNextSibling() === null
      );
    };

    // Enter on empty last paragraph → exit alert
    const unregisterEnter = editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event) => {
        // Cmd+Enter: always exit alert
        if (event?.metaKey || event?.ctrlKey) {
          event.preventDefault();
          exitAlert(false);
          return true;
        }
        // Regular Enter on empty last paragraph
        if (!isAtLastEmptyParagraph()) return false;
        event?.preventDefault();
        exitAlert(true);
        return true;
      },
      COMMAND_PRIORITY_CRITICAL,
    );

    // ArrowDown on empty last paragraph → exit alert
    const unregisterArrowDown = editor.registerCommand(
      KEY_ARROW_DOWN_COMMAND,
      (event) => {
        if (!isAtLastEmptyParagraph()) return false;
        event?.preventDefault();
        exitAlert(false);
        return true;
      },
      COMMAND_PRIORITY_HIGH,
    );

    return () => {
      unregisterEnter();
      unregisterArrowDown();
    };
  }, [editor, parentEditor, nodeKey]);

  return null;
}

interface AlertEditDecoratorProps {
  alertType: AlertType;
  contentEditor: LexicalEditor;
  nodeKey: string;
}

export function AlertEditDecorator({ nodeKey, alertType, contentEditor }: AlertEditDecoratorProps) {
  const [editor] = useLexicalComposerContext();
  const editable = editor.isEditable();

  const handleTypeChange = useCallback(
    (newType: AlertType) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isAlertQuoteNode(node)) {
          node.setAlertType(newType);
        }
      });
    },
    [editor, nodeKey],
  );

  return (
    <>
      <RendererWrapper
        defaultRenderer={AlertRenderer}
        rendererKey={ALERT_NODE_KEY}
        props={{
          type: alertType,
          editable,
          onTypeChange: editable ? handleTypeChange : undefined,
        }}
      />
      <div className="rich-alert-content">
        <LexicalNestedComposer initialEditor={contentEditor}>
          <RichTextPlugin
            ErrorBoundary={LexicalErrorBoundary}
            contentEditable={
              <ContentEditable
                aria-placeholder=""
                className="rich-alert-content-editable"
                placeholder={<span style={{ display: 'none' }} />}
                style={{ outline: 'none' }}
              />
            }
          />
          <ListPlugin />
          <LinkPlugin />
          <ExitBlockPlugin nodeKey={nodeKey} parentEditor={editor} />
        </LexicalNestedComposer>
      </div>
    </>
  );
}
