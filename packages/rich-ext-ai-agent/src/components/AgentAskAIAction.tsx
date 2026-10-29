import { ActionButton, TooltipContent, TooltipRoot, TooltipTrigger } from '@haklex/rich-editor-ui';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Sparkles } from 'lucide-react';
import { useCallback } from 'react';

import { AGENT_PIN_SELECTION_COMMAND } from '../commands';

export function AgentAskAIAction({ onPin }: { onPin?: () => void }) {
  const [editor] = useLexicalComposerContext();

  const handleClick = useCallback(() => {
    editor.dispatchCommand(AGENT_PIN_SELECTION_COMMAND, undefined);
    onPin?.();
  }, [editor, onPin]);

  return (
    <TooltipRoot>
      <TooltipTrigger
        data-tooltip="Ask AI"
        render={
          <ActionButton size="md" onClick={handleClick} onMouseDown={(e) => e.preventDefault()} />
        }
      >
        <Sparkles />
        Ask AI
      </TooltipTrigger>
      <TooltipContent side="bottom">Ask AI about the selection</TooltipContent>
    </TooltipRoot>
  );
}
