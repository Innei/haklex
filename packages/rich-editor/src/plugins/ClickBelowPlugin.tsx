import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $createParagraphNode,
  $getRoot,
  $isDecoratorNode,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  type LexicalEditor,
} from 'lexical';
import { useEffect } from 'react';

export function ClickBelowPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return registerClickBelowCommand(editor);
  }, [editor]);

  return null;
}

export function registerClickBelowCommand(editor: LexicalEditor) {
  return editor.registerCommand(
    CLICK_COMMAND,
    (event) => {
      const rootElement = editor.getRootElement();
      if (!rootElement || event.target !== rootElement) return false;

      const root = $getRoot();
      const last = root.getLastChild();

      if (last === null) {
        const paragraph = $createParagraphNode();
        root.append(paragraph);
        paragraph.selectStart();
        return true;
      }

      if (!$isDecoratorNode(last)) return false;

      const lastDom = editor.getElementByKey(last.getKey());
      if (lastDom && event.clientY <= lastDom.getBoundingClientRect().bottom) {
        return false;
      }

      const paragraph = $createParagraphNode();
      last.insertAfter(paragraph);
      paragraph.selectStart();
      return true;
    },
    COMMAND_PRIORITY_LOW,
  );
}
