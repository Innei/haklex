import { Spinner } from '@haklex/rich-editor-ui';
import type { ReactElement } from 'react';

interface StatusBarProps {
  status: 'idle' | 'running' | 'thinking' | 'calling_tool' | 'writing' | 'done';
  toolName?: string;
}

const labels: Record<string, string> = {
  thinking: 'Thinking...',
  writing: 'Writing...',
  running: 'Processing...',
};

export function StatusBar({ status, toolName }: StatusBarProps): ReactElement | null {
  if (status === 'idle' || status === 'done') return null;

  const label =
    status === 'calling_tool' && toolName
      ? `Calling ${toolName}...`
      : labels[status] || 'Processing...';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 12px',
        fontSize: '12px',
        color: '#737373',
      }}
    >
      <Spinner size="sm" />
      <span>{label}</span>
    </div>
  );
}
