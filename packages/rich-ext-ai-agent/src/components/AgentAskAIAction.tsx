import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Sparkles } from 'lucide-react';
import { useCallback } from 'react';

import { AGENT_PIN_SELECTION_COMMAND } from '../commands';

export function AgentAskAIAction({ onPin }: { onPin?: () => void }) {
  const [editor] = useLexicalComposerContext();

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      editor.dispatchCommand(AGENT_PIN_SELECTION_COMMAND, undefined);
      onPin?.();
    },
    [editor, onPin],
  );

  return (
    <button
      aria-label="Ask AI"
      type="button"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        borderRadius: 4,
        color: 'inherit',
        padding: 0,
      }}
      onMouseDown={handleMouseDown}
    >
      <Sparkles size={14} strokeWidth={2} />
    </button>
  );
}
