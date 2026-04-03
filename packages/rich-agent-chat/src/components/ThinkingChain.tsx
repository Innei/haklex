import { ChevronRight, Sparkles } from 'lucide-react';
import type { ReactElement } from 'react';
import { useState } from 'react';

import {
  pulseDot,
  thinkingRow,
  thinkingSteps,
  toolCallChevron,
  toolCallDetail,
  toolCallDetailInner,
  toolCallGroupCounter,
  toolCallStatusIcon,
} from '../styles.css';

interface ThinkingChainProps {
  defaultExpanded?: boolean;
  id: string;
  isStreaming: boolean;
  rawText: string;
  steps: string[];
}

export function ThinkingChain({
  steps,
  isStreaming,
  defaultExpanded = false,
}: ThinkingChainProps): ReactElement {
  const [expanded, setExpanded] = useState(defaultExpanded || isStreaming);

  return (
    <div>
      <button className={thinkingRow} type="button" onClick={() => setExpanded(!expanded)}>
        <span className={toolCallStatusIcon}>
          <Sparkles
            size={14}
            style={
              isStreaming ? { animation: 'pulse 1.5s ease-in-out infinite' } : { opacity: 0.5 }
            }
          />
        </span>
        <span style={isStreaming ? { color: 'var(--hk-color-text)' } : undefined}>Thinking</span>

        {isStreaming ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <span className={pulseDot} />
            <span className={pulseDot} style={{ animationDelay: '0.2s' }} />
            <span className={pulseDot} style={{ animationDelay: '0.4s' }} />
          </span>
        ) : (
          steps.length > 0 && <span className={toolCallGroupCounter}>{steps.length} steps</span>
        )}

        <span style={{ flex: 1 }} />
        <ChevronRight className={toolCallChevron} data-expanded={expanded} size={12} />
      </button>

      <div className={toolCallDetail} data-open={expanded}>
        <div className={toolCallDetailInner}>
          <div className={thinkingSteps}>
            {steps.map((step, i) => (
              <p key={i} style={{ margin: 0 }}>
                {step}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
