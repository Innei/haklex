import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import {
  $createNodeSelection,
  $createParagraphNode,
  $getNodeByKey,
  $getSelection,
  $isDecoratorNode,
  $isElementNode,
  $isNodeSelection,
  $setSelection,
} from 'lexical';
import { useCallback, useEffect, useState } from 'react';

import { $isCodeBlockNode } from '../../nodes/CodeBlockNode';
import { CODE_BLOCK_NODE_KEY } from '../../types/renderer-keys';
import {
  consumeCodeBlockCursorIntent,
  setCodeBlockCursorIntent,
} from '../../utils/codeBlockSelectionIntent';
import { CodeBlockRenderer } from '../renderers/CodeBlockRenderer';
import { RendererWrapper } from '../RendererWrapper';

interface CodeBlockEditDecoratorProps {
  code: string;
  language: string;
  nodeKey: string;
}

export function CodeBlockEditDecorator({ nodeKey, code, language }: CodeBlockEditDecoratorProps) {
  const [editor] = useLexicalComposerContext();
  const [isSelected] = useLexicalNodeSelection(nodeKey);
  const [shouldFocusEditor, setShouldFocusEditor] = useState(false);
  const [cursorPlacement, setCursorPlacement] = useState<'start' | 'end'>('start');
  const editable = editor.isEditable();

  useEffect(() => {
    if (!editable || !isSelected) {
      setShouldFocusEditor(false);
      return;
    }

    let nextShouldFocus = false;
    let nextCursorPlacement: 'start' | 'end' = 'start';

    editor.getEditorState().read(() => {
      const selection = $getSelection();
      const selectedNodes = $isNodeSelection(selection) ? selection.getNodes() : null;

      nextShouldFocus =
        selectedNodes !== null &&
        selectedNodes.length === 1 &&
        selectedNodes[0]?.getKey() === nodeKey;

      if (nextShouldFocus) {
        nextCursorPlacement = consumeCodeBlockCursorIntent(nodeKey) ?? 'start';
      }
    });

    setShouldFocusEditor(nextShouldFocus);

    if (nextShouldFocus) {
      setCursorPlacement(nextCursorPlacement);
    }
  }, [editable, editor, isSelected, nodeKey]);

  const handleCodeChange = useCallback(
    (newCode: string) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isCodeBlockNode(node)) {
          node.setCode(newCode);
        }
      });
    },
    [editor, nodeKey],
  );

  const handleLanguageChange = useCallback(
    (newLanguage: string) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isCodeBlockNode(node)) {
          node.setLanguage(newLanguage);
        }
      });
    },
    [editor, nodeKey],
  );

  const handleDelete = useCallback(() => {
    editor.getRootElement()?.focus({ preventScroll: true });
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (!node) return;

      const prev = node.getPreviousSibling();
      const next = node.getNextSibling();
      const parent = node.getParent();
      node.remove();

      if (prev) {
        if ($isElementNode(prev)) {
          prev.selectEnd();
        } else {
          if ($isDecoratorNode(prev) && prev.getType() === 'code-block') {
            setCodeBlockCursorIntent(prev.getKey(), 'end');
          }
          const selection = $createNodeSelection();
          selection.add(prev.getKey());
          $setSelection(selection);
        }
        return;
      }

      if (next) {
        if ($isElementNode(next)) {
          next.selectStart();
        } else {
          if ($isDecoratorNode(next) && next.getType() === 'code-block') {
            setCodeBlockCursorIntent(next.getKey(), 'start');
          }
          const selection = $createNodeSelection();
          selection.add(next.getKey());
          $setSelection(selection);
        }
        return;
      }

      if (parent) {
        const p = $createParagraphNode();
        parent.append(p);
        p.selectStart();
      }
    });
  }, [editor, nodeKey]);

  const handleExitBlock = useCallback(
    (direction: 'before' | 'after') => {
      editor.getRootElement()?.focus({ preventScroll: true });
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if (!node) return;

        if (direction === 'before') {
          const prev = node.getPreviousSibling();
          if (!prev) return;

          if ($isElementNode(prev)) {
            prev.selectEnd();
          } else {
            if ($isDecoratorNode(prev) && prev.getType() === 'code-block') {
              setCodeBlockCursorIntent(prev.getKey(), 'end');
            }
            const selection = $createNodeSelection();
            selection.add(prev.getKey());
            $setSelection(selection);
          }
          return;
        }

        let next = node.getNextSibling();
        if (!next) {
          const p = $createParagraphNode();
          node.insertAfter(p);
          next = p;
        }

        if ($isElementNode(next)) {
          next.selectStart();
        } else {
          if ($isDecoratorNode(next) && next.getType() === 'code-block') {
            setCodeBlockCursorIntent(next.getKey(), 'start');
          }
          const selection = $createNodeSelection();
          selection.add(next.getKey());
          $setSelection(selection);
        }
      });
    },
    [editor, nodeKey],
  );

  return (
    <RendererWrapper
      defaultRenderer={CodeBlockRenderer}
      rendererKey={CODE_BLOCK_NODE_KEY}
      props={{
        code,
        language,
        editable,
        onCodeChange: editable ? handleCodeChange : undefined,
        onLanguageChange: editable ? handleLanguageChange : undefined,
        onDelete: editable ? handleDelete : undefined,
        onExitBlock: editable ? handleExitBlock : undefined,
        selected: editable ? shouldFocusEditor : false,
        cursorPlacement: editable ? cursorPlacement : 'start',
      }}
    />
  );
}
