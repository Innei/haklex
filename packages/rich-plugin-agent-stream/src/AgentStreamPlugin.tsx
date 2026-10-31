import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect, useRef } from 'react';

import { createAgentStreamPlayer, type PlaybackState, type PlayerOptions } from './player';

export interface AgentStreamPluginProps {
  agentName?: string;
  backlogSeconds?: number;
  charsPerSecond?: number;
  maxSeconds?: number;
  onPlaybackChange?: (state: PlaybackState) => void;
  scrollContainer?: HTMLElement | null | { current: HTMLElement | null };
}

const resolveContainer = (container: AgentStreamPluginProps['scrollContainer']) =>
  container && 'current' in container ? container.current : (container ?? null);

export function AgentStreamPlugin({
  agentName = 'AI',
  backlogSeconds = 6,
  charsPerSecond = 80,
  maxSeconds = 3,
  onPlaybackChange,
  scrollContainer,
}: AgentStreamPluginProps) {
  const [editor] = useLexicalComposerContext();
  const options = useRef<() => PlayerOptions>(null!);
  options.current = () => ({
    agentName,
    backlogSeconds,
    charsPerSecond,
    maxSeconds,
    onPlaybackChange,
    scrollContainer: resolveContainer(scrollContainer),
  });

  useEffect(() => {
    const player = createAgentStreamPlayer(editor, () => options.current());
    return player.dispose;
  }, [editor]);

  return null;
}
